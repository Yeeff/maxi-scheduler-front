import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { ITimelineRow } from "../../../common/interfaces/timeline.interfaces";


interface ITimelineActionsProps {
  selectedRows: ITimelineRow[];
  companies: { id?: number; name: string }[];
  employees: { id: number; name: string; document?: string }[];
  leaveTypes: { id: number; name: string; code: string }[];
  selectedCompanyId: number | null;
  selectedEmployeeId: number | null;
  selectedLeaveTypeId: number | null;
  onCompanyChange: (companyId: number | null) => void;
  onEmployeeChange: (employeeId: number | null) => void;
  onLeaveTypeChange: (leaveTypeId: number | null) => void;
  onClearFilters: () => void;
  onAssignEmployee: () => void;
  onUnassignEmployee: () => void;
  onMoveEmployee: () => void;
  onLinkScheduleTemplate: () => void;
  onChangeScheduleTemplate: () => void;
  onGenerateSchedules: () => void;
  onBulkGenerateSchedules: () => void;
  canAssignEmployee: boolean;
  canUnassignEmployee: boolean;
  canAssociateTemplate: boolean;
  canGenerateSchedules: boolean;
  isHistoryMode?: boolean;
}

export const TimelineActions = ({
  selectedRows,
  companies,
  employees,
  leaveTypes,
  selectedCompanyId,
  selectedEmployeeId,
  selectedLeaveTypeId,
  onCompanyChange,
  onEmployeeChange,
  onLeaveTypeChange,
  onClearFilters,
  onAssignEmployee,
  onUnassignEmployee,
  onMoveEmployee,
  onLinkScheduleTemplate,
  onChangeScheduleTemplate,
  onGenerateSchedules,
  onBulkGenerateSchedules,
  canAssignEmployee,
  canUnassignEmployee,
  canAssociateTemplate,
  canGenerateSchedules,
  isHistoryMode = false,
}: ITimelineActionsProps) => {
  const hasSelectedRows = selectedRows.length > 0;

  const companyOptions = [
    { label: 'Ninguna', value: null },
    ...companies.map(company => ({
      label: company.name,
      value: company.id
    }))
  ];

  const employeeOptions = [
    { label: 'Ninguno', value: null },
    ...employees.map(employee => ({
      label: `${employee.name}${employee.document ? ` (${employee.document})` : ''}`,
      value: employee.id
    }))
  ];

  const leaveTypeOptions = [
    { label: 'Ninguno', value: null },
    ...leaveTypes.map(leaveType => ({
      label: leaveType.name,
      value: leaveType.id
    }))
  ];
return (
  <div className="timeline-actions" style={{ margin: '20px 0' }}>
    {/* Company Filter Section */}
    <div className="company-filter-section" style={{
      border: '1px solid #dee2e6',
      borderRadius: '4px',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      marginBottom: '16px'
    }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
        <div className="company-filter">
          <label className="text-black bold" style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Empresa/Cliente:
          </label>
          <Dropdown
            value={selectedCompanyId}
            options={companyOptions}
            onChange={(e) => onCompanyChange(e.value)}
            placeholder="Seleccionar empresa"
            className="company-dropdown"
            style={{ width: '250px' }}
          />
        </div>
        <div className="employee-filter">
          <label className="text-black bold" style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Empleado:
          </label>
          <Dropdown
            value={selectedEmployeeId}
            options={employeeOptions}
            onChange={(e) => onEmployeeChange(e.value)}
            placeholder="Seleccionar empleado"
            className="employee-dropdown"
            style={{ width: '250px' }}
          />
        </div>
        <div className="leave-type-filter">
          <label className="text-black bold" style={{
            display: 'block',
            marginBottom: '6px',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Tipo de Bloque:
          </label>
          <Dropdown
            value={selectedLeaveTypeId}
            options={leaveTypeOptions}
            onChange={(e) => onLeaveTypeChange(e.value)}
            placeholder="Seleccionar tipo"
            className="leave-type-dropdown"
            style={{ width: '250px' }}
          />
        </div>
        <div className="clear-filters" style={{ display: 'flex', alignItems: 'flex-end', marginLeft: '16px' }}>
          <Button
            label="Limpiar Filtros"
            icon="pi pi-filter-slash"
            onClick={onClearFilters}
            className="p-button-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #6c757d',
              backgroundColor: 'transparent',
              color: '#6c757d'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#094a90';
              e.currentTarget.style.color = '#094a90';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#6c757d';
              e.currentTarget.style.color = '#6c757d';
            }}
          />
        </div>
      </div>
    </div>

    {/* Actions Buttons Section */}
    {!isHistoryMode && (
      <div className="actions-buttons-section" style={{
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '12px',
        backgroundColor: 'white'
      }}>
        <div className="toolbar-actions" style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
            <Button
              label="Asignar empleado"
              icon="pi pi-user-plus"
              className="timeline-action-button"
              onClick={onAssignEmployee}
              disabled={!canAssignEmployee}
              style={{
                background: 'transparent',
                border: 'none',
                color: canAssignEmployee ? '#094a90' : '#6c757d',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: canAssignEmployee ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (canAssignEmployee) {
                  e.currentTarget.style.border = '1px solid #094a90';
                  e.currentTarget.style.backgroundColor = 'rgba(9, 74, 144, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = 'none';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
            <Button
              label="Desvincular puesto"
              icon="pi pi-user-minus"
              className="timeline-action-button"
              onClick={onUnassignEmployee}
              disabled={!canUnassignEmployee}
              style={{
                background: 'transparent',
                border: 'none',
                color: canUnassignEmployee ? '#094a90' : '#6c757d',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: canUnassignEmployee ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (canUnassignEmployee) {
                  e.currentTarget.style.border = '1px solid #094a90';
                  e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = 'none';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
            <Button
              label="Asociar plantilla"
              icon="pi pi-calendar-plus"
              className="timeline-action-button"
              onClick={onChangeScheduleTemplate}
              disabled={!canAssociateTemplate}
              style={{
                background: 'transparent',
                border: 'none',
                color: canAssociateTemplate ? '#094a90' : '#6c757d',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: canAssociateTemplate ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (canAssociateTemplate) {
                  e.currentTarget.style.border = '1px solid #094a90';
                  e.currentTarget.style.backgroundColor = 'rgba(23, 162, 184, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = 'none';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
            <Button
              label="Generar horarios"
              icon="pi pi-play"
              className="timeline-action-button"
              onClick={onGenerateSchedules}
              disabled={!canGenerateSchedules}
              style={{
                background: 'transparent',
                border: 'none',
                color: canGenerateSchedules ? '#094a90' : '#6c757d',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: canGenerateSchedules ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (canGenerateSchedules) {
                  e.currentTarget.style.border = '1px solid #094a90';
                  e.currentTarget.style.backgroundColor = 'rgba(40, 167, 69, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.border = 'none';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            />
          </div>
        </div>
    )}
    </div>
  );
};