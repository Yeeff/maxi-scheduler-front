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
  { key: 'monday', label: 'Lunes', short: 'Lun' },
  { key: 'tuesday', label: 'Martes', short: 'Mar' },
  { key: 'wednesday', label: 'Miércoles', short: 'Mié' },
  { key: 'thursday', label: 'Jueves', short: 'Jue' },
  { key: 'friday', label: 'Viernes', short: 'Vie' },
  { key: 'saturday', label: 'Sábado', short: 'Sáb' },
  { key: 'sunday', label: 'Domingo', short: 'Dom' },
];

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
        {row.employee ? (
          <div className="employee-name text-gray small">{row.employee.name}</div>
        ) : (
          <div className="no-employee text-gray small italic">Sin asignar</div>
        )}
      </div>
    );
  };

  const renderTimeBlocks = (row: ITimelineRow, day: string) => {
    const timeBlocks = row.scheduleData[day as keyof typeof row.scheduleData] || [];

    return (
      <div
        className="time-blocks-cell"
        onClick={() => onCellClick(row, day)}
        style={{ cursor: 'pointer', minHeight: '60px' }}
      >
        {timeBlocks.length > 0 ? (
          timeBlocks.map((block, index) => (
            <div
              key={index}
              className={`time-block ${block.type}`}
              style={{
                backgroundColor: getBlockColor(block.type),
                padding: '2px 4px',
                margin: '1px 0',
                borderRadius: '3px',
                fontSize: '11px',
                color: 'white',
                textAlign: 'center'
              }}
            >
              {formatTimeRange(block.startTime, block.endTime)}
            </div>
          ))
        ) : (
          <div className="no-schedule text-gray small">-</div>
        )}
      </div>
    );
  };

  const getBlockColor = (type: string) => {
    switch (type) {
      case 'work': return '#094a90';
      case 'break': return '#6c757d';
      case 'off': return '#dc3545';
      default: return '#6c757d';
    }
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

        {DAYS_OF_WEEK.map((day) => (
          <Column
            key={day.key}
            field={day.key}
            header={day.short}
            body={(row: ITimelineRow) => renderTimeBlocks(row, day.key)}
            style={{ width: '120px', minWidth: '120px' }}
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