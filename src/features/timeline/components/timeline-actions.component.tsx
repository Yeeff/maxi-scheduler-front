import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { ITimelineRow } from "../../../common/interfaces/timeline.interfaces";

interface ITimelineActionsProps {
  selectedRows: ITimelineRow[];
  companies: { id: number; name: string }[];
  selectedCompanyId?: number;
  onCompanyChange: (companyId?: number) => void;
  onAssignEmployee: () => void;
  onUnassignEmployee: () => void;
  onMoveEmployee: () => void;
  onLinkScheduleTemplate: () => void;
  onChangeScheduleTemplate: () => void;
  onGenerateSchedules: () => void;
  onBulkGenerateSchedules: () => void;
}

export const TimelineActions = ({
  selectedRows,
  companies,
  selectedCompanyId,
  onCompanyChange,
  onAssignEmployee,
  onUnassignEmployee,
  onMoveEmployee,
  onLinkScheduleTemplate,
  onChangeScheduleTemplate,
  onGenerateSchedules,
  onBulkGenerateSchedules,
}: ITimelineActionsProps) => {
  const hasSelectedRows = selectedRows.length > 0;
  const hasAssignedEmployees = selectedRows.some(row => row.employee);

  const companyOptions = [
    { label: 'Todas las empresas', value: undefined },
    ...companies.map(company => ({
      label: company.name,
      value: company.id
    }))
  ];

  return (
    <div className="timeline-actions">
      <div className="actions-header">
        <div className="company-filter">
          <label className="text-black bold">Empresa:</label>
          <Dropdown
            value={selectedCompanyId}
            options={companyOptions}
            onChange={(e) => onCompanyChange(e.value)}
            placeholder="Seleccionar empresa"
            className="company-dropdown"
            style={{ width: '250px' }}
          />
        </div>

        {hasSelectedRows && (
          <div className="selected-info">
            <span className="text-black">
              {selectedRows.length} cargo{selectedRows.length > 1 ? 's' : ''} seleccionado{selectedRows.length > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {hasSelectedRows && (
        <div className="actions-buttons">
          {/* Position Management Actions - Always Available */}
          <div className="action-group">
            <h4 className="text-black medium bold">Gestión de Cargos</h4>
            <div className="button-row">
              <Button
                label="Vincular empleado"
                icon="pi pi-user-plus"
                className="p-button-primary p-button-sm"
                onClick={onAssignEmployee}
              />
              <Button
                label="Liberar puesto"
                icon="pi pi-user-minus"
                className="p-button-danger p-button-sm"
                onClick={onUnassignEmployee}
                disabled={!hasAssignedEmployees}
              />
              <Button
                label="Pasar empleado a otro puesto"
                icon="pi pi-arrow-right"
                className="p-button-secondary p-button-sm"
                onClick={onMoveEmployee}
                disabled={!hasAssignedEmployees}
              />
            </div>
          </div>

          {/* Schedule Management Actions - Only when employees are assigned */}
          {hasAssignedEmployees && (
            <div className="action-group">
              <h4 className="text-black medium bold">Gestión de Horarios</h4>
              <div className="button-row">
                <Button
                  label="Vincular plantilla"
                  icon="pi pi-calendar-plus"
                  className="p-button-info p-button-sm"
                  onClick={onLinkScheduleTemplate}
                />
                <Button
                  label="Cambiar plantilla"
                  icon="pi pi-refresh"
                  className="p-button-warning p-button-sm"
                  onClick={onChangeScheduleTemplate}
                />
                <Button
                  label="Generar horarios"
                  icon="pi pi-play"
                  className="p-button-success p-button-sm"
                  onClick={onGenerateSchedules}
                />
                <Button
                  label="Generar desde plantillas"
                  icon="pi pi-bolt"
                  className="p-button-help p-button-sm"
                  onClick={onBulkGenerateSchedules}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};