import React, { useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ContextMenu } from "primereact/contextmenu";
import { Checkbox } from "primereact/checkbox";

import { ITimelineRow, ITimeBlock } from "../../../common/interfaces/timeline.interfaces";

interface ITimelineGridProps {
  data: ITimelineRow[];
  selectedRows: ITimelineRow[];
  onSelectionChange: (rows: ITimelineRow[]) => void;
  onCellClick: (row: ITimelineRow, day: string) => void;
  contextMenuModel: any[];
  loading?: boolean;
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

  const renderTimeBlocks = (row: ITimelineRow, day: string) => {
    const timeBlocks = row.actualScheduleData[day as keyof typeof row.actualScheduleData] || [];

    return (
      <div
        className="time-blocks-cell"
        onClick={() => onCellClick(row, day)}
        style={{
          cursor: 'pointer',
          minHeight: '60px',
          position: 'relative',
          width: '100%'
        }}
      >
        {timeBlocks.length > 0 ? (
          <div className="time-visualization" style={{ position: 'relative', height: '50px', width: '100%' }}>
            {(() => {
              // Sort blocks by start time to maintain chronological order
              const sortedBlocks = [...timeBlocks].sort((a, b) =>
                timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
              );

              // Calculate total duration of all blocks for the day
              const totalDuration = sortedBlocks.reduce((total, block) => {
                const startMinutes = timeToMinutes(block.startTime);
                const endMinutes = timeToMinutes(block.endTime);
                return total + (endMinutes - startMinutes);
              }, 0);

              const CELL_WIDTH = 140; // pixels
              let currentLeft = 0;

              return sortedBlocks.map((block, index) => {
                const startMinutes = timeToMinutes(block.startTime);
                const endMinutes = timeToMinutes(block.endTime);
                const duration = endMinutes - startMinutes;

                // Calculate proportional width based on total duration of blocks
                const proportion = duration / totalDuration;
                const width = proportion * CELL_WIDTH;

                const blockElement = (
                  <div
                    key={index}
                    className={`time-block-sequential ${block.type}`}
                    style={{
                      backgroundColor: getBlockColor(block.type, block.isCurrentEmployee),
                      position: 'absolute',
                      left: `${currentLeft}px`,
                      top: '15px', // Move blocks down to make room for labels
                      width: `${width}px`,
                      height: '20px', // Shorter blocks
                      borderRadius: '3px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                      border: block.isCurrentEmployee ? '2px solid #000' : '1px solid rgba(255,255,255,0.3)',
                      zIndex: block.type === 'break' ? 10 : 5
                    }}
                    title={`${block.employeeName || 'Sin asignar'} - ${block.type === 'work' ? 'Trabajo' : 'Break'}: ${formatTimeRange(block.startTime, block.endTime)} (${duration} min)${block.isCurrentEmployee ? ' (Actual)' : ''}`}
                  />
                );

                // Add time label above the block
                const labelElement = (
                  <div
                    key={`label-${index}`}
                    style={{
                      position: 'absolute',
                      left: `${currentLeft}px`,
                      top: '0px',
                      width: `${width}px`,
                      textAlign: 'center',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#333',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      zIndex: 15
                    }}
                    title={`${block.employeeName || 'Sin asignar'}: ${formatTimeRange(block.startTime, block.endTime)}${block.isCurrentEmployee ? ' (Actual)' : ''}`}
                  >
                    {width > 50 ? `${block.employeeName || 'N/A'}: ${formatTimeRange(block.startTime, block.endTime)}` :
                     width > 30 ? block.employeeName || 'N/A' : '...'}
                  </div>
                );

                currentLeft += width;
                return [labelElement, blockElement];
              }).flat();
            })()}
          </div>
        ) : (
          <div className="no-schedule text-gray small">-</div>
        )}
      </div>
    );
  };

  const getBlockColor = (type: string, isCurrentEmployee?: boolean) => {
    // Different shades for current vs historical employees
    const baseColors = {
      work: isCurrentEmployee ? '#094a90' : '#6c757d', // Blue for current, gray for historical
      break: isCurrentEmployee ? '#ffc107' : '#ffecb3', // Yellow for current, light yellow for historical
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
    <>
      <DataTable
        value={data}
        loading={loading}
        scrollable
        scrollHeight="600px"
        className="timeline-datatable"
        onContextMenu={(e) => {
          const target = e.originalEvent.target as HTMLElement;
          const rowElement = target.closest('tr');
          if (rowElement) {
            const rowIndex = Array.from(rowElement.parentElement?.children || []).indexOf(rowElement);
            if (data[rowIndex]) {
              handleContextMenu(e.originalEvent, data[rowIndex]);
            }
          }
        }}
      >
        <Column
          header=""
          body={renderSelectionCell}
          style={{ width: '40px' }}
          frozen
        />
        <Column
          field="position"
          header="Cargo/Empleado"
          body={renderPositionEmployeeCell}
          style={{ width: '200px', minWidth: '200px' }}
          frozen
        />

        {DAYS_OF_WEEK.map((day, index) => (
          <Column
            key={day.key}
            field={day.key}
            header={day.short}
            body={(row: ITimelineRow) => renderTimeBlocks(row, day.key)}
            style={{
              width: '140px',
              minWidth: '140px',
              paddingLeft: index === 0 ? '0px' : '2px', // Add small gap between columns
              paddingRight: index === DAYS_OF_WEEK.length - 1 ? '0px' : '2px'
            }}
          />
        ))}
      </DataTable>

      <ContextMenu
        model={contextMenuModel}
        ref={contextMenuRef}
        onHide={() => setContextMenuTarget(null)}
      />
    </>
  );
};