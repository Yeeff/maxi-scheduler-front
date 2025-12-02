import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

import { ITimeBlock } from "../../../common/interfaces/timeline.interfaces";
import TimeBlockEditorModal from "./time-block-editor-modal.component";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface ITimeBlockManagerModalProps {
  visible: boolean;
  onHide: () => void;
  positionId: number;
  positionName: string;
  date: string;
  dayKey: string;
  companyId: number;
}

const DAYS_OF_WEEK = [
  { key: 'MONDAY', label: 'Lunes' },
  { key: 'TUESDAY', label: 'Martes' },
  { key: 'WEDNESDAY', label: 'Miércoles' },
  { key: 'THURSDAY', label: 'Jueves' },
  { key: 'FRIDAY', label: 'Viernes' },
  { key: 'SATURDAY', label: 'Sábado' },
  { key: 'SUNDAY', label: 'Domingo' },
];

const TimeBlockManagerModal = ({
  visible,
  onHide,
  positionId,
  positionName,
  date,
  dayKey,
  companyId,
}: ITimeBlockManagerModalProps): React.JSX.Element => {
  const [timeBlocks, setTimeBlocks] = useState<ITimeBlock[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string; code: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [selectedBlockForEdit, setSelectedBlockForEdit] = useState<ITimeBlock | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const { get, deleted, put, post } = useCrudService(process.env.urlApiScheduler);

  const dayLabel = DAYS_OF_WEEK.find(day => day.key === dayKey)?.label || dayKey;

  const loadLeaveTypes = async () => {
    try {
      const response = await get('/api/leave-types/active');
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const leaveTypesData = (response as any).data?.data || (response as any).data || [];
        setLeaveTypes(Array.isArray(leaveTypesData) ? leaveTypesData : []);
      }
    } catch (error) {
      console.error("Error loading leave types:", error);
      setLeaveTypes([]);
    }
  };

  useEffect(() => {
    if (visible && positionId && date) {
      loadLeaveTypes();
      loadTimeBlocks();
    }
  }, [visible, positionId, date]);

  const loadTimeBlocks = async () => {
    setLoading(true);
    try {
      const response = await get(`/api/daily-schedules/position/${positionId}/date/${date}`);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const blocksData = (response as any).data?.data || (response as any).data || [];
        
        // Transform the data to match ITimeBlock interface
        const transformedBlocks: ITimeBlock[] = blocksData.map((block: any) => ({
          id: block.id,
          startTime: block.actualStartTime || block.plannedStartTime || "",
          endTime: block.actualEndTime || block.plannedEndTime || "",
          type: block.leaveType?.code || "work",
          employeeId: block.employeeCache?.id,
          employeeName: block.employeeCache?.name || "Unknown",
          isCurrentEmployee: false,
        }));
        
        setTimeBlocks(transformedBlocks);
      } else {
        console.error("Error loading time blocks:", response.operation.message);
        setTimeBlocks([]);
      }
    } catch (error) {
      console.error("Error loading time blocks:", error);
      setTimeBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (timeBlock: ITimeBlock) => {
    if (!timeBlock.id) return;

    if (!confirm(`¿Está seguro de eliminar el bloque de ${timeBlock.employeeName}?`)) {
      return;
    }

    try {
      const response = await deleted(`/api/daily-schedules/${timeBlock.id}`);
      if (response.operation.code === EResponseCodes.SUCCESS || response.operation.code === EResponseCodes.OK) {
        loadTimeBlocks(); // Refresh data
      } else {
        alert("Error al eliminar el bloque: " + response.operation.message);
      }
    } catch (error) {
      console.error("Error deleting time block:", error);
      alert("Error al eliminar el bloque");
    }
  };

  const handleEditBlock = (timeBlock: ITimeBlock) => {
    setSelectedBlockForEdit(timeBlock);
    setIsCreatingNew(false);
    setShowEditorModal(true);
  };

  const handleCreateBlock = () => {
    setSelectedBlockForEdit(null);
    setIsCreatingNew(true);
    setShowEditorModal(true);
  };

  const handleEditorSave = async (timeBlockId: number, employeeId: number, startTime: string, endTime: string, leaveTypeId: number) => {
    try {
      const response = await put(`/api/daily-schedules/time-block`, {
        timeBlockId,
        employeeId,
        startTime,
        endTime,
        leaveTypeId
      });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        setShowEditorModal(false);
        loadTimeBlocks(); // Refresh data
      } else {
        alert("Error al actualizar el bloque: " + response.operation.message);
      }
    } catch (error: any) {
      console.error("Error updating time block:", error);
      alert("Error al actualizar el bloque: " + (error.message || "Error desconocido"));
    }
  };

  const handleEditorCreate = async (positionId: number, employeeId: number, date: string, startTime: string, endTime: string, leaveTypeId: number) => {
    try {
      const response = await post(`/api/daily-schedules/time-block`, {
        positionId,
        employeeId,
        date,
        startTime,
        endTime,
        leaveTypeId
      });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        setShowEditorModal(false);
        loadTimeBlocks(); // Refresh data
      } else {
        alert("Error al crear el bloque: " + response.operation.message);
      }
    } catch (error: any) {
      console.error("Error creating time block:", error);
      alert("Error al crear el bloque: " + (error.message || "Error desconocido"));
    }
  };

  const renderActions = (row: ITimeBlock) => {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          label="Editar"
          icon="pi pi-pencil"
          className="p-button-sm p-button-primary"
          onClick={() => handleEditBlock(row)}
        />
        <Button
          label="Eliminar"
          icon="pi pi-trash"
          className="p-button-sm p-button-danger"
          onClick={() => handleDeleteBlock(row)}
        />
      </div>
    );
  };

  const renderType = (row: ITimeBlock) => {
    // Find the leave type by code and return its name
    const leaveType = leaveTypes.find(type => type.code === row.type);
    return leaveType ? leaveType.name : row.type;
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <Button
        label="Crear Nuevo Bloque"
        icon="pi pi-plus"
        className="p-button-primary"
        onClick={handleCreateBlock}
      />
      <Button
        label="Cerrar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={onHide}
      />
    </div>
  );

  return (
    <>
      <Dialog
        visible={visible}
        style={{ width: "800px" }}
        header={`Administrar Bloques - ${positionName} - ${dayLabel}`}
        modal
        className="p-fluid"
        footer={footer}
        onHide={onHide}
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
        <DataTable
          value={timeBlocks}
          loading={loading}
          emptyMessage="No hay bloques de tiempo para este día"
          scrollable
          scrollHeight="400px"
          className="p-datatable-sm"
          style={{
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            overflow: 'hidden'
          }}
        >
          <Column field="employeeName" header="Empleado" sortable style={{ fontSize: '14px' }} />
          <Column field="startTime" header="Inicio" sortable style={{ fontSize: '14px' }} />
          <Column field="endTime" header="Fin" sortable style={{ fontSize: '14px' }} />
          <Column field="type" header="Tipo" body={renderType} sortable style={{ fontSize: '14px' }} />
          <Column header="Acciones" body={renderActions} style={{ width: '200px' }} />
        </DataTable>
      </Dialog>

      <TimeBlockEditorModal
        visible={showEditorModal}
        onHide={() => setShowEditorModal(false)}
        onSave={handleEditorSave}
        onCreate={handleEditorCreate}
        timeBlock={selectedBlockForEdit}
        selectedDate={date}
        positionName={positionName}
        positionId={positionId}
        companyId={companyId}
      />
    </>
  );
};

export default TimeBlockManagerModal;