import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";

import { ITimeBlock } from "../../../common/interfaces/timeline.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IEmployeeCache {
  id: number;
  name: string;
  document: string;
  status: boolean;
}

interface ITimeBlockEditorModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (timeBlockId: number, employeeId: number, startTime: string, endTime: string, type: string) => void;
  onCreate?: (positionId: number, employeeId: number, date: string, startTime: string, endTime: string, type: string) => void;
  timeBlock?: ITimeBlock | null;
  selectedDate?: string;
  positionName?: string;
  positionId?: number;
  companyId?: number;
}

const TimeBlockEditorModal = ({
  visible,
  onHide,
  onSave,
  onCreate,
  timeBlock,
  selectedDate,
  positionName,
  positionId,
  companyId,
}: ITimeBlockEditorModalProps): React.JSX.Element => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployeeCache | null>(null);
  const [selectedType, setSelectedType] = useState("work");
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState<IEmployeeCache[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployeeCache[]>([]);
  const [initialEmployeeId, setInitialEmployeeId] = useState<number | null>(null);

  // Determine if we're in CREATE or EDIT mode
  const isCreateMode = !timeBlock || !timeBlock.id;

  const { get } = useCrudService(process.env.urlApiScheduler);

  useEffect(() => {
    // Filter employees based on search term
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.document.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, searchTerm]);

  const fetchTimeBlockData = async (timeBlockId: number) => {
    try {
      const response = await get(`/api/daily-schedules/${timeBlockId}`);
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const scheduleData = (response as any).data?.data || (response as any).data;
        if (scheduleData) {
          setStartTime(scheduleData.actualStartTime || scheduleData.plannedStartTime || "");
          setEndTime(scheduleData.actualEndTime || scheduleData.plannedEndTime || "");
          setSelectedType(scheduleData.type || "work");
          
          // Store initial employee ID for edit mode
          if (scheduleData.employeeCache?.id) {
            setInitialEmployeeId(scheduleData.employeeCache.id);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching time block data:", error);
      // Fallback to prop data
      setStartTime(timeBlock?.startTime || "");
      setEndTime(timeBlock?.endTime || "");
      setSelectedType(timeBlock?.type || "work");
      if (timeBlock?.employeeId) {
        setInitialEmployeeId(timeBlock.employeeId);
      }
    }
  };

  const loadAvailableEmployees = async (start: string, end: string, excludeId?: number) => {
    if (!selectedDate || !start || !end) {
      return;
    }

    try {
      setLoadingEmployees(true);
      let url = `/api/daily-schedules/available-employees?date=${selectedDate}&start=${start}&end=${end}`;
      if (excludeId) {
        url += `&excludeBlockId=${excludeId}`;
      }

      const response = await get<IEmployeeCache[]>(url);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const employeesData = (response as any).data?.data || (response as any).data || [];
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        
        // In edit mode, if the current employee is still valid, keep them selected
        if (!isCreateMode && initialEmployeeId) {
          const currentEmployeeStillValid = employeesData.find((emp: IEmployeeCache) => emp.id === initialEmployeeId);
          if (currentEmployeeStillValid) {
            setSelectedEmployee(currentEmployeeStillValid);
          } else {
            setSelectedEmployee(null);
          }
        }
      } else {
        console.error("Error loading available employees:", response.operation.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error("Error loading available employees:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  useEffect(() => {
    if (visible) {
      if (isCreateMode) {
        // CREATE mode: clear fields
        setStartTime("");
        setEndTime("");
        setSelectedType("work");
        setSelectedEmployee(null);
        setSearchTerm("");
        setEmployees([]);
        setInitialEmployeeId(null);
      } else {
        // EDIT mode: fetch fresh data from API
        if (timeBlock?.id) {
          fetchTimeBlockData(timeBlock.id);
        } else {
          // Fallback to prop data if no ID
          setStartTime(timeBlock?.startTime || "");
          setEndTime(timeBlock?.endTime || "");
          setSelectedType(timeBlock?.type || "work");
          if (timeBlock?.employeeId) {
            setInitialEmployeeId(timeBlock.employeeId);
          }
        }
      }
    }
  }, [visible, timeBlock, isCreateMode]);

  // Load employees when both times are set in CREATE mode
  useEffect(() => {
    if (visible && isCreateMode && startTime && endTime) {
      loadAvailableEmployees(startTime, endTime);
    }
  }, [visible, isCreateMode, startTime, endTime]);

  // Load employees when times change in EDIT mode (after initial load)
  useEffect(() => {
    if (visible && !isCreateMode && startTime && endTime && initialEmployeeId !== null) {
      // Only reload if times have been modified
      const originalStart = timeBlock?.startTime || "";
      const originalEnd = timeBlock?.endTime || "";
      
      if (startTime !== originalStart || endTime !== originalEnd) {
        loadAvailableEmployees(startTime, endTime, timeBlock?.id);
      } else {
        // Initial load in edit mode - load with current employee
        loadAvailableEmployees(startTime, endTime, timeBlock?.id);
      }
    }
  }, [visible, isCreateMode, startTime, endTime, initialEmployeeId]);

  const handleSave = async () => {
    if (!selectedEmployee) {
      alert("Por favor seleccione un empleado");
      return;
    }

    if (!startTime || !endTime) {
      alert("Por favor ingrese hora de inicio y fin");
      return;
    }

    if (isCreateMode) {
      // CREATE mode
      if (!onCreate || !positionId || !selectedDate) {
        console.error("Missing required props for CREATE mode:", { onCreate, positionId, selectedDate });
        return;
      }
      setLoading(true);
      try {
        await onCreate(
          positionId,
          selectedEmployee.id,
          selectedDate,
          startTime,
          endTime,
          selectedType
        );
        handleHide();
      } catch (error) {
        console.error("Error creating time block:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // EDIT mode
      if (!timeBlock || !timeBlock.id) {
        console.error("TimeBlock or ID missing:", { timeBlock, id: timeBlock?.id });
        return;
      }
      setLoading(true);
      try {
        await onSave(timeBlock.id, selectedEmployee.id, startTime, endTime, selectedType);
        handleHide();
      } catch (error) {
        console.error("Error saving time block:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleHide = () => {
    setStartTime("");
    setEndTime("");
    setSelectedEmployee(null);
    setSelectedType("work");
    setSearchTerm("");
    setEmployees([]);
    setInitialEmployeeId(null);
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
        label={isCreateMode ? "Crear Bloque" : "Guardar Cambios"}
        icon={isCreateMode ? "pi pi-plus" : "pi pi-check"}
        onClick={handleSave}
        loading={loading}
        disabled={!selectedEmployee || !startTime || !endTime}
        style={{
          background: (selectedEmployee && startTime && endTime) ? '#094a90' : '#6c757d',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: (selectedEmployee && startTime && endTime) ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (selectedEmployee && startTime && endTime) {
            e.currentTarget.style.backgroundColor = '#073a70';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedEmployee && startTime && endTime) {
            e.currentTarget.style.backgroundColor = '#094a90';
          }
        }}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{
        width: "500px",
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      header={isCreateMode ? "Crear Nuevo Bloque" : "Editar Bloque"}
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
      {/* 1. Start Time */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="startTime" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Hora de Inicio: <span style={{ color: 'red' }}>*</span>
        </label>
        <InputText
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
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

      {/* 2. End Time */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="endTime" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Hora de Fin: <span style={{ color: 'red' }}>*</span>
        </label>
        <InputText
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
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

      {/* 3. Employee Selection */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <label htmlFor="search" style={{
            color: '#094a90',
            fontWeight: '600',
            fontSize: '14px',
            marginRight: '8px'
          }}>
            Empleado: <span style={{ color: 'red' }}>*</span>
          </label>
          {loadingEmployees && (
            <ProgressSpinner 
              style={{ width: '20px', height: '20px' }} 
              strokeWidth="4"
            />
          )}
        </div>

        {startTime && endTime ? (
          <>
            <InputText
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              disabled={loadingEmployees}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '14px',
                marginBottom: '12px',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#094a90'}
              onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
            />

            <DataTable
              value={filteredEmployees}
              selectionMode="single"
              selection={selectedEmployee}
              onSelectionChange={(e) => setSelectedEmployee(e.value)}
              dataKey="id"
              loading={loadingEmployees}
              scrollable
              scrollHeight="200px"
              emptyMessage={loadingEmployees ? "Cargando empleados disponibles..." : "No hay empleados disponibles para este horario"}
              className="p-datatable-sm"
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                overflow: 'hidden',
                marginBottom: '12px'
              }}
            >
              <Column field="name" header="Nombre" sortable style={{ fontSize: '14px' }} />
              <Column field="document" header="Documento" sortable style={{ fontSize: '14px' }} />
            </DataTable>

            {selectedEmployee && (
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#e3f2fd',
                border: '1px solid #2196f3',
                borderRadius: '4px',
                color: '#1565c0',
                fontSize: '14px'
              }}>
                <strong>Empleado seleccionado:</strong> {selectedEmployee.name} ({selectedEmployee.document})
              </div>
            )}
          </>
        ) : (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fff3cd',
            border: '1px solid #ffc107',
            borderRadius: '4px',
            color: '#856404',
            fontSize: '14px'
          }}>
            Por favor ingrese hora de inicio y fin para ver empleados disponibles
          </div>
        )}
      </div>

      {/* 4. Type Selection */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="typeSelect" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Tipo de Bloque: <span style={{ color: 'red' }}>*</span>
        </label>
        <Dropdown
          id="typeSelect"
          value={selectedType}
          options={[
            { label: 'Trabajo', value: 'work' },
            { label: 'Descanso', value: 'break' }
          ]}
          onChange={(e) => setSelectedType(e.value)}
          placeholder="Seleccionar tipo"
          style={{
            width: '100%',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px'
          }}
        />
      </div>
    </Dialog>
  );
};

export default TimeBlockEditorModal;