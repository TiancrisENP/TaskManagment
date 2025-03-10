import React, { useState } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks = [] }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("week");

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const events = tasks.map(task => ({
    title: task.title || "Tarea sin título",
    start: new Date(task.startDate) || new Date(),
    end: new Date(task.endDate) || new Date(),
    allDay: task.allDay || false,
    resource: task
  }));

  // Vistas disponibles
  const views = [
    { key: "month", label: "Mes" },
    { key: "week", label: "Semana" },
    { key: "day", label: "Día" },
    { key: "agenda", label: "Agenda" }
  ];

  return (
    <div className="calendar-container">
      <div className="calendar-layout">
        {/* Panel lateral con botones de vista en formato lista */}
        <div className="calendar-sidebar">
          <h2 className="sidebar-title">Vistas</h2>
          <ul className="view-buttons-list">
            {views.map(viewOption => (
              <li key={viewOption.key}>
                <button 
                  className={`view-button ${view === viewOption.key ? 'active' : ''}`}
                  onClick={() => handleViewChange(viewOption.key)}
                >
                  {viewOption.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Área principal del calendario */}
        <div className="calendar-main">
          {/* Barra de navegación optimizada */}
          <div className="calendar-header">
            <div className="nav-buttons-group">
              <button
                className="nav-button"
                onClick={() => handleNavigate(moment(date).subtract(1, "week").toDate())}
              >
                ⬅
              </button>
              
              <button
                className="nav-button today-button"
                onClick={() => handleNavigate(moment().toDate())}
              >
                Hoy
              </button>
              
              <button
                className="nav-button"
                onClick={() => handleNavigate(moment(date).add(1, "week").toDate())}
              >
                ➡
              </button>
            </div>
            
            <h1 className="calendar-title">Mi Calendario</h1>
          </div>
          
          {/* Calendario */}
          <div className="calendar-content">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              date={date}
              view={view}
              onView={handleViewChange}
              onNavigate={handleNavigate}
              views={["month", "week", "day", "agenda"]}
              toolbar={false}
              style={{ height: "100%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;