import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ContextMenu } from "primereact/contextmenu";
import { Checkbox } from "primereact/checkbox";

import { ITimelineRow, ITimelineEmployee, ITimeBlock } from "../../../common/interfaces/timeline.interfaces";

interface ITimelineGridProps {
   data: ITimelineRow[];
   selectedRows: ITimelineRow[];
   onSelectionChange: (rows: ITimelineRow[]) => void;
   onCellClick: (row: ITimelineRow, day: string) => void;
   contextMenuModel: any[];
   loading?: boolean;
   onAssignEmployee?: (position: ITimelineRow) => void;
   onUnassignEmployee?: (position: ITimelineRow) => void;
 }

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Lunes', short: 'Lun' },
  { key: 'TUESDAY', label: 'Martes', short: 'Mar' },
  { key: 'WEDNESDAY', label: 'Miércoles', short: 'Mié' },
  { key: 'THURSDAY', label: 'Jueves', short: 'Jue' },
  { key: 'FRIDAY', label: 'Viernes', short: 'Vie' },
  { key: 'SATURDAY', label: 'Sábado', short: 'Sáb' },
  { key: 'SUNDAY', label: 'Domingo', short: 'Dom' },
];

// Helper function to convert time string (HH:mm) to minutes since midnight
const timeToMinutes = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
};

export const TimelineGrid = ({
   data,
   selectedRows,
   onSelectionChange,
   onCellClick,
   contextMenuModel,
   loading = false,
   onAssignEmployee,
   onUnassignEmployee,
 }: ITimelineGridProps) => {
  const contextMenuRef = useRef<ContextMenu>(null);
  const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);

  const handleContextMenu = (event: any, row: ITimelineRow) => {
    event.preventDefault();
    setContextMenuTarget(row);
    contextMenuRef.current?.show(event);
  };

  const handleRowSelection = (row: ITimelineRow) => {
     const isSelected = selectedRows.some(selected => selected.id === row.id);
     if (isSelected) {
       onSelectionChange(selectedRows.filter(selected => selected.id !== row.id));
     } else {
       onSelectionChange([...selectedRows, row]);
     }
   };

  const handleAssignEmployee = (position: ITimelineRow) => {
    if (onAssignEmployee) {
      onAssignEmployee(position);
    }
  };

  const handleUnassignEmployee = (position: ITimelineRow) => {
    if (onUnassignEmployee) {
      onUnassignEmployee(position);
    }
  };

  const renderPositionEmployeeCell = (row: ITimelineRow) => {
    return (
      <div className="position-employee-cell">
        <div className="position-name text-black bold">{row.position.name}</div>
        {row.position.employeeCache ? (
          <div className="employee-name text-gray small">{row.position.employeeCache.name}</div>
        ) : (
          <div className="no-employee text-gray small italic">Sin asignar</div>
        )}
      </div>
    );
  };

  const renderEmployeeRow = (employee: ITimelineEmployee, position: ITimelineRow) => {
    return (
      <div key={`${position.id}-${employee.id}`} className="employee-timeline-row" style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',
        position: 'relative',
        minHeight: '32px'
      }}>
        {/* Position-Employee Column */}
        <div className="position-employee-column" style={{
          width: '220px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: employee.currentEmployee ? 'bold' : 'normal',
          color: employee.currentEmployee ? '#094a90' : '#6c757d',
          borderRight: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Checkbox
            checked={selectedRows.some(selected => selected.id === position.id)}
            onChange={() => handleRowSelection(position)}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '11px', color: '#6c757d', marginBottom: '2px' }}>
              {position.position.name} - {position.position.location}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {employee.name}
              {employee.currentEmployee && (
                <span style={{
                  color: '#ffc107',
                  fontSize: '12px',
                  lineHeight: '1'
                }}>
                  ⭐
                </span>
              )}
              {employee.currentEmployee && position.position.employeeCache?.scheduleTemplate && (
                <span style={{
                  color: '#28a745',
                  fontSize: '12px',
                  lineHeight: '1',
                  cursor: 'help'
                }}
                title={`Horario: ${position.position.employeeCache.scheduleTemplate.name}`}>
                  🕒
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Days Columns */}
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
          const timeBlocks = employee.scheduleData[day as keyof typeof employee.scheduleData] || [];

          return (
            <div
              key={day}
              className="time-blocks-cell"
              onClick={() => {
                console.log("Cell clicked - position:", position.position.name, "day:", day);
                onCellClick(position, day);
              }}
              style={{
                cursor: 'pointer',
                minHeight: '32px',
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #dee2e6',
                padding: '4px'
              }}
            >
              {timeBlocks.length > 0 && timeBlocks[0].type !== 'off' ? (
                <div className="time-visualization" style={{
                  position: 'relative',
                  height: '24px',
                  width: '95%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(() => {
                    // Take the first (and only) block for the day
                    const block = timeBlocks[0];

                    return (
                      <div
                        className={`time-block-single ${block.type} ${block.isCurrentEmployee ? 'current-employee' : 'historical-employee'}`}
                        style={{
                          backgroundColor: getBlockColor(block.type, block.isCurrentEmployee ? true : false),
                          width: '100%',
                          height: '24px',
                          borderRadius: '3px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          color: '#ffffff',
                          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                          border: block.isCurrentEmployee ? '2px solid #000' : '1px solid rgba(0,0,0,0.3)',
                          boxShadow: block.isCurrentEmployee ? '0 1px 4px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
                          transform: block.isCurrentEmployee ? 'scale(1.02)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                          letterSpacing: '0.5px'
                        }}
                        title={`${block.employeeName}: ${formatTimeRange(block.startTime, block.endTime)}${block.isCurrentEmployee ? ' (Actual)' : ' (Histórico)'}`}
                      >
                        {formatTimeRange(block.startTime, block.endTime)}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="no-schedule text-gray small" style={{ fontSize: '10px' }}>-</div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const getBlockColor = (type: string, currentEmployee?: boolean) => {
    // Different shades for current vs historical employees
    const baseColors = {
      work: currentEmployee ? '#094a90' : '#adb5bd', // Blue for current, light gray for historical
      break: currentEmployee ? '#ffc107' : '#fff3cd', // Yellow for current, very light yellow for historical
      off: '#dc3545' // Red for off time (same for all)
    };

    return baseColors[type as keyof typeof baseColors] || '#6c757d';
  };

  const formatTimeRange = (start: string, end: string) => {
    return `${start}-${end}`;
  };

  const renderSelectionCell = (row: ITimelineRow) => {
    const isSelected = selectedRows.some(selected => selected.id === row.id);
    return (
      <Checkbox
        checked={isSelected}
        onChange={() => handleRowSelection(row)}
      />
    );
  };

  return (
    <div className="timeline-custom-grid" style={{
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      overflow: 'hidden'
    }}>
      {/* Global Header */}
      <div className="timeline-global-header" style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #094a90',
        fontSize: '11px',
        fontWeight: 'bold',
        color: '#495057'
      }}>
        <div style={{
          width: '220px',
          padding: '8px 12px',
          borderRight: '1px solid #dee2e6'
        }}>
          Posición - Empleado
        </div>
        {DAYS_OF_WEEK.map(day => (
          <div key={day.key} style={{
            flex: 1,
            padding: '8px 10px',
            textAlign: 'center',
            borderRight: '1px solid #dee2e6'
          }}>
            {day.short}
          </div>
        ))}
      </div>

      {/* Employee Rows */}
      {data.length > 0 ? (
        data.flatMap(row =>
          row.employees && row.employees.length > 0
            ? row.employees.map(employee => renderEmployeeRow(employee, row))
            : [
                <div key={row.id} className="no-employees-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{
                    width: '220px',
                    padding: '12px',
                    fontSize: '12px',
                    color: '#6c757d',
                    borderRight: '1px solid #dee2e6',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Checkbox
                      checked={selectedRows.some(selected => selected.id === row.id)}
                      onChange={() => handleRowSelection(row)}
                    />
                    {row.position.name} - {row.position.location}
                  </div>
                  <div style={{
                    flex: 1,
                    padding: '12px',
                    textAlign: 'center',
                    color: '#6c757d',
                    fontStyle: 'italic',
                    fontSize: '11px'
                  }}>
                    No hay empleados asignados
                  </div>
                </div>
              ]
        )
      ) : (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6c757d',
          fontStyle: 'italic'
        }}>
          No hay posiciones para mostrar
        </div>
      )}

      <ContextMenu
        model={contextMenuModel}
        ref={contextMenuRef}
        onHide={() => setContextMenuTarget(null)}
      />
    </div>
  );
};