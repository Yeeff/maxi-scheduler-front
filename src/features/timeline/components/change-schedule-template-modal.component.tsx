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
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
      />
      <Button
        label="Cambiar Plantilla"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={handleChange}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "700px" }}
      header="Cambiar Plantilla de Horario"
      modal
      className="p-fluid"
      footer={footer}
      onHide={handleHide}
    >
      <div className="p-field mb-4">
        <label htmlFor="search" className="block text-900 font-medium mb-2">
          Buscar plantilla:
        </label>
        <InputText
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          className="w-full"
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
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="description" header="Descripción" sortable />
      </DataTable>

      {selectedTemplate && (
        <div className="mt-3 p-3 bg-blue-50 border-round">
          <strong>Plantilla seleccionada:</strong> {selectedTemplate.name}
          {selectedTemplate.description && (
            <div className="mt-1 text-sm text-gray-600">
              {selectedTemplate.description}
            </div>
          )}
        </div>
      )}

      {!selectedTemplate && currentScheduleTemplateId && (
        <div className="mt-3 p-3 bg-orange-50 border-round">
          <strong>Nota:</strong> Si no selecciona ninguna plantilla, se removerá la plantilla actual del empleado.
        </div>
      )}

      {currentScheduleTemplateId && (
        <div className="mt-3 p-3 bg-green-50 border-round">
          <strong>Plantilla actual asignada:</strong> {
            scheduleTemplates.find(t => t.id === currentScheduleTemplateId)?.name || 'Desconocida'
          }
        </div>
      )}
    </Dialog>
  );
};

export default ChangeScheduleTemplateModal;