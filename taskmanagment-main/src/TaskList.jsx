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
      const tasksFromStorage = JSON.parse(localStorage.getItem('tasks')) || [];
      setTasks(tasksFromStorage);
      syncWithCalendar(tasksFromStorage);
    }
  };

  const syncWithCalendar = (tasksList) => {
    const formattedTasks = tasksList.map(task => ({
      title: task.name,
      start: new Date(`${task.fecha}T${task.hora}`),
      end: new Date(new Date(`${task.fecha}T${task.hora}`).getTime() + task.horas * 60 * 60 * 1000),
    }));

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
      const taskWithDateTime = {
        ...newTask,
        dateTime: `${newTask.fecha}T${newTask.hora}`
      };
      
      const response = await axios.post(API_URL, taskWithDateTime);
      const updatedTasks = [...tasks, response.data];
      setTasks(updatedTasks);
      syncWithCalendar(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));

      console.log("Tareas después de agregar:", updatedTasks);

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
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      const updatedTasks = tasks.filter(task => task.id !== id);
      setTasks(updatedTasks);
      syncWithCalendar(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
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
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Agregar Tarea</button>
      </form>

      <div>
        <label>Mostrar: </label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="completed">Completadas</option>
          <option value="pending">Pendientes</option>
        </select>
        <h1>Lista de Tareas</h1>
      </div>

      <ul>
        {filteredTasks.map((task) => (
          <Task
            key={task.id}
            task={task}
            onDelete={() => handleDelete(task.id)}
          />
        ))}
      </ul>
    </div>
  );
}

function Task({ task, onDelete }) {
  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-header">
        <button className="delete-button" onClick={onDelete}>✖</button>
        <p style={{ color: task.completed ? '#00ff2a' : 'white' }}>
          Nombre: {task.name}
        </p>
      </div>
      <p style={{ color: task.completed ? '#00ff2a' : 'white' }}>
        Descripción: {task.description}
      </p>
      <p style={{ color: task.completed ? '#00ff2a' : 'white' }}>
        Fecha: {task.fecha}
      </p>
      <p style={{ color: task.completed ? '#00ff2a' : 'white' }}>
        Hora: {task.hora}
      </p>
      <p style={{ color: task.completed ? '#00ff2a' : 'white' }}>
        Duración: {task.horas} hora(s)
      </p>
    </li>
  );
}

export default TaskList;
