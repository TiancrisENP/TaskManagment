import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const API_URL = 'http://localhost:5000/api/tasks';

function TaskList({ onTasksChange }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    name: '',
    description: '',
    fecha: '',
    hora: '',
    horas: 1, // Nueva propiedad para duración
    completed: false
  });
  const [filter, setFilter] = useState('all');
  const [errorInput, setErrorInput] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    syncWithCalendar(tasks);
  }, [tasks]);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_URL);
      const tasksFromServer = response.data;
      setTasks(tasksFromServer);
      syncWithCalendar(tasksFromServer);
      localStorage.setItem('tasks', JSON.stringify(tasksFromServer));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Intentar cargar tareas desde el almacenamiento local
      try {
        const tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(tasksFromStorage);
        syncWithCalendar(tasksFromStorage);
      } catch (storageError) {
        console.error('Error loading tasks from storage:', storageError);
        setTasks([]);
      }
    }
  };

  const syncWithCalendar = (tasksList) => {
    // Validar que tasksList sea un array
    if (!Array.isArray(tasksList)) {
      console.error('syncWithCalendar recibió un valor no array:', tasksList);
      return;
    }
    
    const formattedTasks = tasksList.map(task => {
      // Verificar que fecha y hora existan
      if (!task.fecha || !task.hora) {
        console.warn('Tarea sin fecha u hora:', task);
        return null;
      }
      
      try {
        // Crear objetos Date para el inicio y fin de la tarea
        const startDate = new Date(`${task.fecha}T${task.hora}`);
        const endDate = new Date(startDate.getTime() + (task.horas || 1) * 60 * 60 * 1000);
        
        // Verificar que las fechas sean válidas
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          console.warn('Fechas inválidas para la tarea:', task);
          return null;
        }
        
        return {
          title: task.name,
          description: task.description,
          start: startDate,
          end: endDate,
          allDay: false
        };
      } catch (error) {
        console.error('Error al formatear la tarea para el calendario:', error, task);
        return null;
      }
    }).filter(task => task !== null); // Eliminar los null del array
    
    console.log("Eventos enviados al calendario:", formattedTasks);
    onTasksChange(formattedTasks);
  };

  const handleInputChange = (event) => {
    setNewTask({
      ...newTask,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!newTask.name || !newTask.fecha || !newTask.hora || !newTask.horas) {
      setErrorInput('Por favor, completa todos los campos requeridos');
      return;
    }

    try {
      // Comprobar que horas sea un número
      const horas = parseInt(newTask.horas);
      if (isNaN(horas)) {
        setErrorInput('Por favor, introduce un número válido de horas');
        return;
      }

      // Crear objeto de tarea con los datos correctos
      const taskWithDateTime = {
        ...newTask,
        horas: horas,
        dateTime: `${newTask.fecha}T${newTask.hora}`
      };
      
      // Si no podemos conectar con la API, guardamos localmente
      let newTaskWithId;
      try {
        const response = await axios.post(API_URL, taskWithDateTime);
        newTaskWithId = response.data;
      } catch (apiError) {
        console.error('Error al conectar con la API:', apiError);
        // Generar un ID temporal para la tarea
        newTaskWithId = {
          ...taskWithDateTime,
          id: Date.now().toString()
        };
      }

      // Actualizar estado y localStorage
      const updatedTasks = [...tasks, newTaskWithId];
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Sincronizar con el calendario
      syncWithCalendar(updatedTasks);

      // Resetear el formulario
      setNewTask({
        name: '',
        description: '',
        fecha: '',
        hora: '',
        horas: 1,
        completed: false
      });
      setErrorInput(null);
    } catch (error) {
      console.error('Error adding task:', error);
      setErrorInput('Error al agregar la tarea. Inténtalo de nuevo.');
    }
  };

  const handleDelete = async (id) => {
    try {
      // Intentar eliminar de la API
      try {
        await axios.delete(`${API_URL}/${id}`);
      } catch (apiError) {
        console.error('Error al eliminar de la API:', apiError);
        // Continuar con la eliminación local
      }
      
      // Actualizar estado y localStorage
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      
      // Sincronizar con el calendario
      syncWithCalendar(updatedTasks);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  return (
    <div>
      <form onSubmit={handleSubmit} className="task-form">
        <label>
          <h2>Nueva Tarea</h2>
        </label>
        <label>
          Nombre:
          <input
            type="text"
            name="name"
            value={newTask.name}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </label>
        <br />
        <label>
          Descripción:
          <textarea
            name="description"
            value={newTask.description}
            onChange={handleInputChange}
            className="form-input"
          />
        </label>
        <br />
        <div className="datetime-inputs">
          <label>
            Fecha:
            <input
              type="date"
              name="fecha"
              value={newTask.fecha}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Hora:
            <input
              type="time"
              name="hora"
              value={newTask.hora}
              onChange={handleInputChange}
              required
            />
          </label>
          <label>
            Horas:
            <input
              type="number"
              name="horas"
              min="1"
              value={newTask.horas}
              onChange={handleInputChange}
              required
            />
          </label>
        </div>
        <br />
        {errorInput && <p style={{ color: 'red' }}>{errorInput}</p>}
        <button type="submit" className="primary-button">Agregar Tarea</button>
      </form>

      <div className="task-list-header">
        <h1>Lista de Tareas</h1>
        <div className="select-container">
          <label>Mostrar: </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Todas</option>
            <option value="completed">Completadas</option>
            <option value="pending">Pendientes</option>
          </select>
        </div>
      </div>

      <ul className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <Task
              key={task.id}
              task={task}
              onDelete={() => handleDelete(task.id)}
            />
          ))
        ) : (
          <li className="no-tasks">No hay tareas para mostrar.</li>
        )}
      </ul>
    </div>
  );
}

function Task({ task, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <p className="task-title">{task.name}</p>
        <button className="delete-button" onClick={onDelete}>✖</button>
      </div>
      <p className="task-description">{task.description}</p>
      <div className="task-details">
        <p className="task-date">Fecha: {task.fecha}</p>
        <p className="task-time">Hora: {task.hora}</p>
        <p className="task-duration">Duración: {task.horas} hora(s)</p>
      </div>
    </li>
  );
}

export default TaskList;