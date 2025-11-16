import React from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";

import { ITimelineRow } from "../../../common/interfaces/timeline.interfaces";


interface ITimelineActionsProps {
  selectedRows: ITimelineRow[];
  companies: { id?: number; name: string }[];
  selectedCompanyId?: number;
  onCompanyChange: (companyId?: number) => void;
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
  canAssignEmployee,
  canUnassignEmployee,
  canAssociateTemplate,
  canGenerateSchedules,
}: ITimelineActionsProps) => {
  const hasSelectedRows = selectedRows.length > 0;

  const companyOptions = [
    { label: 'Todas las empresas', value: undefined },
    ...companies.map(company => ({
      label: company.name,
      value: company.id
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
    </div>

    {/* Actions Buttons Section */}
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
    </div>
  );
};