import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ContextMenu } from "primereact/contextmenu";
import { Checkbox } from "primereact/checkbox";

import { ITimelineRow, ITimelineEmployee, ITimeBlock } from "../../../common/interfaces/timeline.interfaces";
import { getBlockBackgroundColor, getBlockBorderColor, getBlockTextColor } from "../../../common/constants/block-colors.constants";

interface ITimelineGridProps {
    data: ITimelineRow[];
    selectedRows: ITimelineRow[];
    onSelectionChange: (rows: ITimelineRow[]) => void;
    onCellClick: (row: ITimelineRow, day: string) => void;
    onCellSelect?: (positionId: string, employeeId: string, day: string) => void;
    onBlockClick?: (block: ITimeBlock, position: ITimelineRow, day: string) => void;
    onCreateBlockClick?: (position: ITimelineRow, day: string) => void;
    onCreateBlockDoubleClick?: (position: ITimelineRow, day: string) => void;
    contextMenuModel: any[];
    loading?: boolean;
    onAssignEmployee?: (position: ITimelineRow) => void;
    onUnassignEmployee?: (position: ITimelineRow) => void;
    currentWeekStart?: string | null; // Fecha de inicio de la semana actual
    selectedCell?: { positionId: string, employeeId: string, day: string } | null;
    // New prop for add employee row
    onAddEmployeeClick?: (position: ITimelineRow, day: string, date: string) => void;
    showAddEmployeeRow?: Record<string, boolean>;
    setShowAddEmployeeRow?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
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

// Helper function to format date as local YYYY-MM-DD
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to get the actual date for each day of the week
const getWeekDates = (weekStart?: string | null): { [key: string]: string } => {
  if (!weekStart) {
    // Use current week if no weekStart provided
    // Adjust to Bogota timezone (UTC-5)
    const now = new Date();
    const bogotaOffset = -5; // UTC-5
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const bogotaTime = new Date(utc + (bogotaOffset * 3600000));
    const monday = new Date(bogotaTime);
    monday.setDate(bogotaTime.getDate() - bogotaTime.getDay() + 1); // Get Monday of current week
    weekStart = formatLocalDate(monday);
  }

  // Parse the weekStart date string as local date (not UTC)
  const [year, month, day] = weekStart.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);
  const dates: { [key: string]: string } = {};

  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

  days.forEach((dayKey, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    dates[dayKey] = formatLocalDate(date);
  });

  return dates;
};

export const TimelineGrid = ({
    data,
    selectedRows,
    onSelectionChange,
    onCellClick,
    onCellSelect,
    onBlockClick,
    onCreateBlockClick,
    onCreateBlockDoubleClick,
    contextMenuModel,
    loading = false,
    onAssignEmployee,
    onUnassignEmployee,
    currentWeekStart,
    selectedCell,
    onAddEmployeeClick,
    showAddEmployeeRow: externalShowAddEmployeeRow,
    setShowAddEmployeeRow: externalSetShowAddEmployeeRow,
  }: ITimelineGridProps) => {
   const contextMenuRef = useRef<ContextMenu>(null);
   const gridRef = useRef<HTMLDivElement>(null);
   const [contextMenuTarget, setContextMenuTarget] = useState<any>(null);
   // State to track which positions show the "add employee" row
   // Use external state if provided, otherwise use local state
   const [internalShowAddEmployeeRow, setInternalShowAddEmployeeRow] = useState<Record<string, boolean>>({});
   const showAddEmployeeRow = externalShowAddEmployeeRow ?? internalShowAddEmployeeRow;
   const setShowAddEmployeeRow = externalSetShowAddEmployeeRow ?? setInternalShowAddEmployeeRow;

  // Calculate week dates for header display
  const weekDates = getWeekDates(currentWeekStart);

  console.log('DEBUG: TimeBlocks data:', data);
  console.log('DEBUG: Current week start (from API or calculated):', currentWeekStart);
  console.log('DEBUG: Week dates calculated:', weekDates);
  console.log('DEBUG: Current local time:', new Date().toString());
  console.log('DEBUG: Current UTC time:', new Date().toUTCString());

  const handleContextMenu = (event: any, row: ITimelineRow) => {
    event.preventDefault();
    setContextMenuTarget(row);
    contextMenuRef.current?.show(event);
  };

  const handleRowSelection = (row: ITimelineRow) => {
     // Don't allow selection of company header rows (negative IDs)
     if (row.position.id < 0) {
       return;
     }

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

  const handleCellHover = (positionId: string, employeeId: string, day: string, isEnter: boolean) => {
    if (!gridRef.current) return;
    const cells = gridRef.current.querySelectorAll(`[data-position="${positionId}"][data-employee="${employeeId}"][data-day="${day}"]`);
    const isSelected = selectedCell?.positionId === positionId && selectedCell?.employeeId === employeeId && selectedCell?.day === day;
    cells.forEach(cell => {
      (cell as HTMLElement).style.backgroundColor = isEnter ? 'rgba(9, 74, 144, 0.1)' : (isSelected ? '#fff3cd' : '');
    });
  };

  const renderPositionEmployeeCell = (row: ITimelineRow) => {
    // Company header rows don't have position-employee info
    if (row.position.id < 0) {
      return null;
    }

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

  const renderEmployeeRow = (employee: ITimelineEmployee, position: ITimelineRow, index: number, allEmployees: ITimelineEmployee[]) => {
    // Determinar si es la primera fila de esta posición
    const isFirstEmployeeOfPosition = index === 0;
    // Determinar si es la última fila de esta posición
    const isLastEmployeeOfPosition = index === allEmployees.length - 1;
    
    // Generar color único para cada posición basado en su ID (intercalado entre azul oscuro y claro)
    const getPositionColor = (positionId: string) => {
      const colors = [
        '#094a90', // Azul oscuro
        '#5B8FD4', // Azul claro
      ];
      const hash = positionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    const positionColor = getPositionColor(position.id);
    
    return (
      <div key={`${position.id}-${employee.id}`} className="employee-timeline-row" style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: 'white',
        position: 'relative',
        minHeight: '32px',
        borderLeft: `6px solid ${positionColor}`,
        borderTopLeftRadius: isFirstEmployeeOfPosition ? '4px' : '0px',
        borderBottomLeftRadius: isLastEmployeeOfPosition ? '4px' : '0px'
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
          gap: '8px',
          marginLeft: '-6px'
        }}>
          <Checkbox
            checked={selectedRows.some(selected => selected.id === position.id)}
            onChange={() => handleRowSelection(position)}
          />
          <div style={{ flex: 1 }}>
            {index === 0 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '13px',
                color: '#094a90',
                fontWeight: 'bold',
                marginBottom: '2px',
                backgroundColor: 'rgba(9, 74, 144, 0.08)',
                padding: '2px 4px',
                borderRadius: '2px'
              }}>
                <span>
                  {position.position.name} - {position.position.location}
                </span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginLeft: '16px',
              fontWeight: 'normal',
              color: '#212529'
            }}>
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

          const isSelected = selectedCell?.positionId === position.id.toString() && selectedCell?.employeeId === employee.id.toString() && selectedCell?.day === day;

          return (
            <div
              key={day}
              className="time-blocks-cell"
              data-position={position.id}
              data-employee={employee.id}
              data-day={day}
              onClick={() => {
                console.log("Cell clicked - position:", position.position.name, "day:", day);
                onCellClick(position, day);
              }}
              onMouseEnter={() => handleCellHover(position.id.toString(), employee.id.toString(), day, true)}
              onMouseLeave={() => handleCellHover(position.id.toString(), employee.id.toString(), day, false)}
              style={{
                cursor: 'pointer',
                minHeight: '32px',
                position: 'relative',
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRight: '1px solid #dee2e6',
                padding: '4px',
                backgroundColor: isSelected ? '#fff3cd' : undefined
              }}
            >
              {(() => {
                const activeBlocks = timeBlocks.filter(block => block.type !== 'off' && block.type !== 'break'); // Hide break blocks from UI
                return activeBlocks.length > 0 ? (
                  <div className="time-visualization" style={{
                    position: 'relative',
                    height: '32px',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    {/* Proportional bars at the top */}
                    <div style={{
                      position: 'relative',
                      height: '8px',
                      width: '100%',
                      marginBottom: '4px'
                    }}>
                      {activeBlocks.map((block, index) => {
                        const startMinutes = timeToMinutes(block.startTime);
                        const endMinutes = timeToMinutes(block.endTime);
                        const leftPercent = (startMinutes / 1440) * 100;
                        const widthPercent = ((endMinutes - startMinutes) / 1440) * 100;

                        return (
                          <div
                            key={`bar-${index}`}
                            className={`time-block-bar ${block.type} ${block.isCurrentEmployee ? 'current-employee' : 'historical-employee'}`}
                            style={{
                              position: 'absolute',
                              left: `calc(${leftPercent}% + ${index * 2}px)`,
                              width: `${widthPercent}%`,
                              height: '8px',
                              backgroundColor: getBlockBackgroundColor(block.type, block.isCurrentEmployee ? true : false),
                              border: `1px solid ${getBlockBorderColor(block.type)}`,
                              borderRadius: '2px',
                              boxShadow: block.isCurrentEmployee ? '0 1px 3px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.1)',
                              transform: block.isCurrentEmployee ? 'scaleY(1.1)' : 'scaleY(1)',
                              transition: 'all 0.2s ease'
                            }}
                            title={`${block.employeeName}: ${formatTimeRange(block.startTime, block.endTime)} - ${block.leaveTypeName || getBlockTypeLabel(block.type)}${block.isCurrentEmployee ? ' (Actual)' : ''}`}
                          />
                        );
                      })}
                    </div>
                    {/* Uniform time text blocks below */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px',
                      alignItems: 'center'
                    }}>
                      {activeBlocks.map((block, index) => (
                        <div
                          key={`text-${index}`}
                          className={`time-block-text ${block.type} ${block.isCurrentEmployee ? 'current-employee' : 'historical-employee'}`}
                          style={{
                            width: '100%',
                            padding: '2px 4px',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            border: `1px solid ${getBlockBorderColor(block.type)}`,
                            borderRadius: '3px',
                            textAlign: 'center',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            color: '#000000', // Black text for better readability
                            boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                            lineHeight: '1.2',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onCellSelect?.(position.id.toString(), employee.id.toString(), day);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            onBlockClick?.(block, position, day);
                          }}
                        >
                          {formatTimeRange(block.startTime, block.endTime)}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    className="no-schedule text-gray small"
                    style={{
                      fontSize: '12px',
                      cursor: 'pointer',
                      opacity: 0.6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'opacity 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCellSelect?.(position.id.toString(), employee.id.toString(), day);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onCreateBlockDoubleClick?.(position, day);
                    }}
                    title="Crear nuevo bloque"
                  >
                    <i className="pi pi-plus" style={{ fontSize: '10px' }}></i>
                  </div>
                );
              })()}
            </div>
          );
        })}
      </div>
    );
  };


  const formatTimeRange = (start: string, end: string) => {
    return `${start}-${end}`;
  };

  const getBlockTypeLabel = (blockType: string): string => {
    const typeLabels: { [key: string]: string } = {
      work: 'Trabajo',
      // break: 'Pausa', // Hidden from UI
      off: 'Ausencia',
      vacation: 'Vacaciones',
      sick: 'Enfermedad',
      personal: 'Personal',
      training: 'Capacitación'
    };

    return typeLabels[blockType.toLowerCase()] || blockType;
  };

  const renderSelectionCell = (row: ITimelineRow) => {
    // Don't show checkbox for company header rows
    if (row.position.id < 0) {
      return null;
    }

    const isSelected = selectedRows.some(selected => selected.id === row.id);
    return (
      <Checkbox
        checked={isSelected}
        onChange={() => handleRowSelection(row)}
      />
    );
  };

  return (
    <div ref={gridRef} className="timeline-custom-grid" style={{
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
        {DAYS_OF_WEEK.map(day => {
          const date = weekDates[day.key];
          // Parse date string as local date to avoid timezone shift
          const [year, month, dayNum] = date.split('-').map(Number);
          const dateObj = new Date(year, month - 1, dayNum);
          const dayNumber = dateObj.getDate();
          const isToday = date === formatLocalDate(new Date());

          return (
            <div key={day.key} style={{
              flex: 1,
              padding: '8px 10px',
              textAlign: 'center',
              borderRight: '1px solid #dee2e6',
              backgroundColor: isToday ? 'rgba(9, 74, 144, 0.1)' : 'transparent'
            }}>
              <div style={{ fontSize: '10px', color: '#6c757d', marginBottom: '2px' }}>
                {day.short}
              </div>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: isToday ? '#094a90' : '#495057'
              }}>
                {dayNumber}
              </div>
            </div>
          );
        })}
      </div>

      {/* Employee Rows */}
      {data && data.length > 0 ? (
        data.flatMap(row => {
          // Check if this is a company header row (negative ID)
          if (row.position.id < 0) {
            return (
              <div key={row.id} className="company-header-row" style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#e3f2fd',
                borderBottom: '2px solid #094a90',
                minHeight: '40px',
                fontWeight: 'bold',
                color: '#094a90'
              }}>
                {/* Company Header Column */}
                <div style={{
                  width: '220px',
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRight: '1px solid #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    backgroundColor: '#094a90',
                    borderRadius: '50%',
                    flexShrink: 0
                  }}></div>
                  <div style={{ flex: 1 }}>
                    {row.position.name}
                  </div>
                </div>

                {/* Days Columns - Empty for header */}
                {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => (
                  <div
                    key={day}
                    style={{
                      flex: 1,
                      padding: '8px 10px',
                      textAlign: 'center',
                      borderRight: '1px solid #dee2e6',
                      backgroundColor: '#e3f2fd'
                    }}
                  >
                    {/* Empty header cell */}
                  </div>
                ))}
              </div>
            );
          }

          // Renderizar fila vacía cuando no hay empleados en la posición
  const renderEmptyEmployeeRow = (position: ITimelineRow) => {
    const getPositionColor = (positionId: string) => {
      const colors = [
        '#094a90', // Azul oscuro
        '#5B8FD4', // Azul claro
      ];
      const hash = positionId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return colors[hash % colors.length];
    };
    
    const positionColor = getPositionColor(position.id);
    
    return (
      <div key={`${position.id}-empty`} className="employee-timeline-row" style={{
        display: 'flex',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fafafa',
        position: 'relative',
        minHeight: '32px',
        borderLeft: `6px solid ${positionColor}`,
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px'
      }}>
        {/* Position-Employee Column */}
        <div className="position-employee-column" style={{
          width: '220px',
          padding: '6px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#6c757d',
          borderRight: '1px solid #dee2e6',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '-6px'
        }}>
          <Checkbox
            checked={selectedRows.some(selected => selected.id === position.id)}
            onChange={() => handleRowSelection(position)}
          />
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '13px',
              color: '#094a90',
              fontWeight: 'bold',
              marginBottom: '2px',
              backgroundColor: 'rgba(9, 74, 144, 0.08)',
              padding: '2px 4px',
              borderRadius: '2px'
            }}>
              <span>
                {position.position.name} - {position.position.location}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px',
              marginLeft: '16px',
              fontWeight: 'normal',
              color: '#6c757d',
              fontStyle: 'italic'
            }}>
              Sin empleados - Click para agregar
            </div>
          </div>
        </div>

        {/* Days Columns - Clickable to add blocks */}
        {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
          const dayDate = weekDates[day];
          return (
            <div
              key={day}
              className="time-blocks-cell"
              data-position={position.id}
              data-employee="empty"
              data-day={day}
              onClick={() => {
                console.log("Empty cell clicked - position:", position.position.name, "day:", day);
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
                padding: '4px',
                backgroundColor: '#f8f9fa'
              }}
            >
              <div
                className="no-schedule text-gray small"
                style={{
                  fontSize: '12px',
                  cursor: 'pointer',
                  opacity: 0.6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  onCreateBlockDoubleClick?.(position, day);
                }}
                title="Crear nuevo bloque"
              >
                <i className="pi pi-plus" style={{ fontSize: '10px' }}></i>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Regular position row
  const employeeRows = row.employees && row.employees.length > 0
    ? row.employees.map((employee, index) => renderEmployeeRow(employee, row, index, row.employees))
    : renderEmptyEmployeeRow(row);
          
          // Add employee row (shown when toggle is active)
          const addEmployeeRow = showAddEmployeeRow[row.id] ? (
            <div key={`${row.id}-add`} style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#e8f5e9',
              minHeight: '32px',
              borderLeft: '6px solid #28a745'
            }}>
              <div style={{
                width: '220px',
                padding: '6px 12px',
                fontSize: '12px',
                color: '#28a745',
                fontWeight: 'bold',
                borderRight: '1px solid #dee2e6',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginLeft: '-6px'
              }}>
                <span>➕ Agregar empleado</span>
              </div>
              
              {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map(day => {
                const dayDate = weekDates[day];
                return (
                  <div
                    key={day}
                    style={{
                      flex: 1,
                      minHeight: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRight: '1px solid #dee2e6',
                      cursor: 'pointer',
                      backgroundColor: '#c8e6c9'
                    }}
                    onClick={() => {
                      if (onAddEmployeeClick && dayDate) {
                        onAddEmployeeClick(row, day, dayDate);
                      }
                    }}
                    title={`Agregar empleado para ${day}`}
                  >
                    <span style={{
                      color: '#28a745',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}>+</span>
                  </div>
                );
              })}
            </div>
          ) : null;
          
          const rowsArray = Array.isArray(employeeRows) ? employeeRows : [employeeRows];
          return [
            ...rowsArray,
            addEmployeeRow
          ];
        })
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