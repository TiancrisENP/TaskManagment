import React, { useState } from 'react';
import TaskList from './TaskList';
import CalendarView from './CalendarView';

function App() {
  const [tasks, setTasks] = useState([]);

  const handleTasksChange = (updatedTasks) => {
    console.log("Tareas recibidas en App.jsx:", updatedTasks);
    setTasks(updatedTasks);
  };

  return (
    <div className="app-container">
      <h1>Gestión de Tareas</h1>
      <div className="content-container">
        <TaskList onTasksChange={handleTasksChange} />
        <CalendarView tasks={tasks} />
      </div>
    </div>
  );
}

export default App;
