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

  const renderPositionRow = (row: ITimelineRow) => {
    return (
      <div key={row.id} className="position-timeline-section">
        {/* Position Header */}
        <div className="position-header" style={{
          backgroundColor: selectedRows.some(selected => selected.id === row.id) ? '#e3f2fd' : '#f8f9fa',
          border: '1px solid #e0e0e0',
          borderBottom: '2px solid #094a90',
          padding: '12px 15px',
          marginBottom: '0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#094a90',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Checkbox
            checked={selectedRows.some(selected => selected.id === row.id)}
            onChange={() => handleRowSelection(row)}
          />
          {row.position.name} - {row.position.location}
        </div>

        {/* Employee Name Header */}
        <div className="employee-header-row" style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#e9ecef',
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#495057'
        }}>
          <div style={{
            width: '200px',
            padding: '8px 15px',
            borderRight: '1px solid #dee2e6'
          }}>
            Empleado
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
        {row.employees && row.employees.length > 0 ? (
          row.employees.map(employee => (
            <div key={employee.id} className="employee-timeline-row" style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: employee.currentEmployee ? '#fff3cd' : 'white',
              borderLeft: employee.currentEmployee ? '4px solid #ffc107' : 'none',
              position: 'relative'
            }}>
              {/* Employee Name Column */}
              <div className="employee-name-column" style={{
                width: '200px',
                padding: '10px 15px',
                fontSize: '14px',
                fontWeight: employee.currentEmployee ? 'bold' : 'normal',
                color: employee.currentEmployee ? '#094a90' : '#6c757d',
                borderRight: '1px solid #dee2e6'
              }}>
                {employee.name}
                {employee.currentEmployee && (
                  <span style={{
                    marginLeft: '8px',
                    backgroundColor: '#ffc107',
                    color: '#000',
                    padding: '3px 8px',
                    borderRadius: '12px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    border: '2px solid #ff8c00'
                  }}>
                    ⭐ ACTUAL
                  </span>
                )}
              </div>

              {/* Days Columns */}
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                const timeBlocks = employee.scheduleData[day as keyof typeof employee.scheduleData] || [];

                return (
                  <div
                    key={day}
                    className="time-blocks-cell"
                    onClick={() => onCellClick(row, day)}
                    style={{
                      cursor: 'pointer',
                      minHeight: '45px',
                      position: 'relative',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #dee2e6'
                    }}
                  >
                    {timeBlocks.length > 0 && timeBlocks[0].type !== 'off' ? (
                      <div className="time-visualization" style={{
                        position: 'relative',
                        height: '35px',
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
                                height: '32px',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                fontWeight: block.isCurrentEmployee ? 'bold' : 'normal',
                                color: 'white',
                                border: block.isCurrentEmployee ? '3px solid #000' : '1px solid rgba(0,0,0,0.3)',
                                boxShadow: block.isCurrentEmployee ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.1)',
                                transform: block.isCurrentEmployee ? 'scale(1.05)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                              }}
                              title={`${block.employeeName}: ${formatTimeRange(block.startTime, block.endTime)}${block.isCurrentEmployee ? ' (Actual)' : ' (Histórico)'}`}
                            >
                              {formatTimeRange(block.startTime, block.endTime)}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="no-schedule text-gray small">-</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="no-employees" style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6c757d',
            fontStyle: 'italic'
          }}>
            No hay empleados asignados a esta posición
          </div>
        )}
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
      {data.map(row => renderPositionRow(row))}

      {/* Action buttons for selected positions */}
      {selectedRows.length > 0 && (
        <div className="timeline-actions" style={{
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderTop: '1px solid #dee2e6',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}>
          <span style={{ fontWeight: 'bold', color: '#094a90' }}>
            {selectedRows.length} posición(es) seleccionada(s)
          </span>

          {/* Show assign button if any selected position doesn't have an employee */}
          {selectedRows.some(row => !row.position.employeeCache) && (
            <button
              onClick={() => handleAssignEmployee(selectedRows[0])} // For now, handle first selected
              style={{
                padding: '8px 16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Asignar Empleado
            </button>
          )}

          {/* Show unassign button if any selected position has an employee */}
          {selectedRows.some(row => row.position.employeeCache) && (
            <button
              onClick={() => handleUnassignEmployee(selectedRows[0])} // For now, handle first selected
              style={{
                padding: '8px 16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Desasignar Empleado
            </button>
          )}
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