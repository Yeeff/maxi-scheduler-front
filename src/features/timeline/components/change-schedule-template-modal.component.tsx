import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IChangeScheduleTemplateModalProps {
  visible: boolean;
  onHide: () => void;
  onChange: (scheduleTemplateId: number | null) => void;
  employeeId: number;
  currentScheduleTemplateId?: number;
}

const ChangeScheduleTemplateModal = ({
  visible,
  onHide,
  onChange,
  employeeId,
  currentScheduleTemplateId,
}: IChangeScheduleTemplateModalProps): React.JSX.Element => {
  const [scheduleTemplates, setScheduleTemplates] = useState<IScheduleTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<IScheduleTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<IScheduleTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { get } = useCrudService(process.env.urlApiScheduler);

  useEffect(() => {
    if (visible) {
      loadScheduleTemplates();
      // Reset selected template when modal opens
      setSelectedTemplate(null);
    }
  }, [visible, currentScheduleTemplateId]);

  useEffect(() => {
    // Filter templates based on search term
    if (searchTerm.trim() === "") {
      setFilteredTemplates(scheduleTemplates);
    } else {
      const filtered = scheduleTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTemplates(filtered);
    }
  }, [scheduleTemplates, searchTerm]);

  const loadScheduleTemplates = async () => {
    try {
      setLoading(true);
      const response = await get<IScheduleTemplate[]>("/api/schedules");

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const templatesData = (response as any).data?.data || (response as any).data || [];
        setScheduleTemplates(Array.isArray(templatesData) ? templatesData : []);

        // Pre-select current template if exists
        if (currentScheduleTemplateId) {
          const currentTemplate = templatesData.find((t: IScheduleTemplate) => t.id === currentScheduleTemplateId);
          if (currentTemplate) {
            setSelectedTemplate(currentTemplate);
          }
        }
      } else {
        console.error("Error loading schedule templates:", response.operation.message);
      }
    } catch (error) {
      console.error("Error loading schedule templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = () => {
    const templateId = selectedTemplate ? selectedTemplate.id : null;
    onChange(templateId);
    setSelectedTemplate(null);
    setSearchTerm("");
  };

  const handleHide = () => {
    setSelectedTemplate(null);
    setSearchTerm("");
    onHide();
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        style={{
          background: 'transparent',
          border: '1px solid #6c757d',
          color: '#6c757d',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#5a6268';
          e.currentTarget.style.color = '#5a6268';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#6c757d';
          e.currentTarget.style.color = '#6c757d';
        }}
      />
      <Button
        label="Cambiar Plantilla"
        icon="pi pi-check"
        onClick={handleChange}
        style={{
          background: '#094a90',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#138496';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#094a90';
        }}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{
        width: "700px",
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      header="Cambiar Plantilla de Horario"
      modal
      className="p-fluid"
      footer={footer}
      onHide={handleHide}
      headerStyle={{
        backgroundColor: '#094a90',
        color: 'white',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        padding: '16px 24px',
        fontSize: '18px',
        fontWeight: '600'
      }}
      contentStyle={{
        padding: '24px',
        backgroundColor: '#ffffff'
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="search" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Buscar plantilla:
        </label>
        <InputText
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#094a90'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <DataTable
        value={filteredTemplates}
        selectionMode="single"
        selection={selectedTemplate}
        onSelectionChange={(e) => setSelectedTemplate(e.value)}
        dataKey="id"
        loading={loading}
        scrollable
        scrollHeight="300px"
        emptyMessage="No hay plantillas de horario disponibles"
        className="p-datatable-sm"
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <Column field="name" header="Nombre" sortable style={{ fontSize: '14px' }} />
        <Column field="description" header="Descripción" sortable style={{ fontSize: '14px' }} />
      </DataTable>

      {selectedTemplate && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#e1f5fe',
          border: '1px solid #29b6f6',
          borderRadius: '4px',
          color: '#0277bd',
          fontSize: '14px'
        }}>
          <strong>Plantilla seleccionada:</strong> {selectedTemplate.name}
          {selectedTemplate.description && (
            <div style={{ marginTop: '4px', color: '#546e7a', fontSize: '13px' }}>
              {selectedTemplate.description}
            </div>
          )}
        </div>
      )}

      {!selectedTemplate && currentScheduleTemplateId && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '4px',
          color: '#e65100',
          fontSize: '14px'
        }}>
          <strong>Nota:</strong> Si no selecciona ninguna plantilla, se removerá la plantilla actual del empleado.
        </div>
      )}

    </Dialog>
  );
};

export default ChangeScheduleTemplateModal;