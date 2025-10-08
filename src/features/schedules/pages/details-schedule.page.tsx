import React from "react";
import useDetailsScheduleHook from "../hooks/detailsSchedule.hook";
import { ButtonComponent } from "../../../common/components/Form";

const DetailsSchedulePage = (): React.JSX.Element => {
  const { schedule, loading, redirectToEdit, redirectToList } = useDetailsScheduleHook();

  if (loading) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles del Horario</label>
          </div>
          <div className="container-sections-forms">
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles del Horario</label>
          </div>
          <div className="container-sections-forms">
            <p>No se encontró el horario solicitado.</p>
          </div>
        </div>
      </div>
    );
  }

  const formatTime = (timeString: string) => {
    // Convert HH:mm:ss to HH:mm format
    return timeString.substring(0, 5);
  };

  const getDayName = (dayOfWeek: string) => {
    const days = {
      'MONDAY': 'Lunes',
      'TUESDAY': 'Martes',
      'WEDNESDAY': 'Miércoles',
      'THURSDAY': 'Jueves',
      'FRIDAY': 'Viernes',
      'SATURDAY': 'Sábado',
      'SUNDAY': 'Domingo'
    };
    return days[dayOfWeek as keyof typeof days] || dayOfWeek;
  };

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Detalles del Horario</label>
          <div className="title-buttons">
            <ButtonComponent
              value={"Editar"}
              className="button-save medium"
              action={redirectToEdit}
            />
            <ButtonComponent
              value={"Volver"}
              className="button-clean medium"
              action={redirectToList}
            />
          </div>
        </div>

        <div className="container-sections-forms">
          {/* Schedule Header */}
          <div className="schedule-header">
            <div className="grid-form-2-container gap-25">
              <div>
                <label className="text-black big bold">Nombre:</label>
                <p className="text-black medium">{schedule.name}</p>
              </div>
              <div>
                <label className="text-black big bold">Descripción:</label>
                <p className="text-black medium">{schedule.description || 'Sin descripción'}</p>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="schedule-details">
            <h3 className="text-black large bold" style={{ marginBottom: '20px' }}>Días y Turnos</h3>

            {schedule.details && schedule.details.length > 0 ? (
              schedule.details.map((day, dayIndex) => (
                <div key={dayIndex} className="day-card" style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <h4 className="text-black medium bold" style={{ marginBottom: '10px' }}>
                    {getDayName(day.dayOfWeek)}
                  </h4>

                  {day.shifts && day.shifts.length > 0 ? (
                    day.shifts.map((shift, shiftIndex) => (
                      <div key={shiftIndex} className="shift-card" style={{
                        border: '1px solid #d0d0d0',
                        borderRadius: '6px',
                        padding: '10px',
                        marginBottom: '10px',
                        backgroundColor: 'white'
                      }}>
                        <div className="grid-form-3-container gap-25">
                          <div>
                            <label className="text-black small bold">Turno:</label>
                            <p className="text-black small">{shift.name}</p>
                          </div>
                          <div>
                            <label className="text-black small bold">Horario:</label>
                            <p className="text-black small">
                              {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                            </p>
                          </div>
                          <div>
                            <label className="text-black small bold">Descanso:</label>
                            <p className="text-black small">
                              {shift.lunchDescription && shift.lunchTimeInit && shift.lunchTimeEnd
                                ? `${shift.lunchDescription}: ${formatTime(shift.lunchTimeInit)} - ${formatTime(shift.lunchTimeEnd)}`
                                : 'Sin descanso'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray small">No hay turnos definidos para este día</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray medium">No hay días configurados en este horario</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DetailsSchedulePage);