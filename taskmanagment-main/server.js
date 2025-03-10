const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Array en memoria para almacenar las tareas
let tasks = [];

// Función para generar un ID único
const generateId = () => {
  return tasks.length > 0 ? Math.max(...tasks.map(task => task.id)) + 1 : 1;
};

// Rutas de la API
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { name, description, fecha, hora, horas } = req.body;

  if (!name || !fecha || !hora || !horas) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  const startDate = new Date(`${fecha}T${hora}`);
  const endDate = new Date(startDate.getTime() + horas * 60 * 60 * 1000);

  const newTask = {
    id: generateId(),
    name,
    description,
    fecha,
    hora,
    horas,
    start: startDate, // Fecha de inicio para el calendario
    end: endDate, // Fecha de fin para el calendario
    completed: false
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = tasks.findIndex(task => task.id === parseInt(id));

  if (taskIndex !== -1) {
    const updatedTask = { ...tasks[taskIndex], ...req.body };

    // Actualizar las fechas si se modifican
    if (req.body.fecha && req.body.hora && req.body.horas) {
      const startDate = new Date(`${req.body.fecha}T${req.body.hora}`);
      updatedTask.start = startDate;
      updatedTask.end = new Date(startDate.getTime() + req.body.horas * 60 * 60 * 1000);
    }

    tasks[taskIndex] = updatedTask;
    res.json(updatedTask);
  } else {
    res.status(404).json({ message: 'Tarea no encontrada' });
  }
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(task => task.id !== parseInt(id));
  res.status(204).end();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
