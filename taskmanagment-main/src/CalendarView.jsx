import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./Calendar.css";

const localizer = momentLocalizer(moment);

const CalendarView = ({ tasks = [] }) => {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState("week");
  const [events, setEvents] = useState([]);

  // Actualizar eventos cuando cambien las tareas
  useEffect(() => {
    const formattedEvents = tasks.map(task => {
      // Asegurar que start y end sean instancias de Date válidas
      const start = new Date(task.start);
      const end = new Date(task.end);
      
      return {
        title: task.title || "Tarea sin título",
        start: isNaN(start.getTime()) ? new Date() : start,
        end: isNaN(end.getTime()) ? new Date() : end,
        allDay: task.allDay || false,
        resource: task
      };
    });
    
    setEvents(formattedEvents);
    console.log("Eventos actualizados en el calendario:", formattedEvents);
  }, [tasks]);

  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const handleViewChange = (newView) => {
    setView(newView);
  };

  // Personalizar el componente de evento
  const EventComponent = ({ event }) => (
    <div className="rbc-event-content" title={event.title}>
      <div style={{ fontWeight: 'bold' }}>{event.title}</div>
      {event.resource && event.resource.description && (
        <div style={{ fontSize: '0.85rem' }}>{event.resource.description}</div>
      )}
    </div>
  );

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
                onClick={() => handleNavigate(moment(date).subtract(1, view === 'day' ? 'day' : view === 'week' ? 'week' : 'month').toDate())}
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
                onClick={() => handleNavigate(moment(date).add(1, view === 'day' ? 'day' : view === 'week' ? 'week' : 'month').toDate())}
              >
                ➡
              </button>
            </div>
            
            <h1 className="calendar-title">
              {view === 'day' 
                ? moment(date).format('D [de] MMMM [de] YYYY')
                : view === 'week'
                  ? `Semana del ${moment(date).startOf('week').format('D [de] MMMM')}`
                  : moment(date).format('MMMM [de] YYYY')}
            </h1>
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
              components={{
                event: EventComponent
              }}
              formats={{
                dayHeaderFormat: (date) => moment(date).format('dddd D'),
                dayRangeHeaderFormat: ({ start, end }) => 
                  `${moment(start).format('D MMM')} - ${moment(end).format('D MMM')}`,
              }}
              messages={{
                allDay: 'Todo el día',
                previous: 'Anterior',
                next: 'Siguiente',
                today: 'Hoy',
                month: 'Mes',
                week: 'Semana',
                day: 'Día',
                agenda: 'Agenda',
                date: 'Fecha',
                time: 'Hora',
                event: 'Evento',
                noEventsInRange: 'No hay tareas en este período'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;