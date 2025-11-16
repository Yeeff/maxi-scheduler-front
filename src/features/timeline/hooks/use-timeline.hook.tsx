import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { ITimelineRow, ITimelineData } from "../../../common/interfaces/timeline.interfaces";
import { ICompany } from "../../../common/interfaces/company.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useCrudService from "../../../common/hooks/crud-service.hook";

export default function useTimelineHook() {
  const navigate = useNavigate();
  const { setMessage } = useContext(AppContext);

  // State
  const [timelineData, setTimelineData] = useState<ITimelineRow[]>([]);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | undefined>(undefined);
  const [selectedRows, setSelectedRows] = useState<ITimelineRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);
  const [weekStart, setWeekStart] = useState<string | null>(null);

  // Services
  const { get, put, post } = useCrudService(process.env.urlApiScheduler);

  // Load initial data
  useEffect(() => {
    loadCompanies();
  }, []);

  // Reload data when company filter changes
  useEffect(() => {
    loadTimelineData();
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const response = await get<ICompany[]>("/api/companies");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const companiesData = (response as any).data?.data || (response as any).data || [];
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    }
  };

  const loadTimelineData = async () => {
    try {
      setLoading(true);

      // Only load timeline data if a company is selected
      if (!selectedCompanyId) {
        setTimelineData([]);
        return;
      }

      // Backend now calculates default week start, so we only send companyId
      const params = new URLSearchParams({
        companyId: selectedCompanyId.toString()
      });
      const response = await get<ITimelineData>(`/api/daily-schedules/timeline?${params.toString()}`);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const timelineDataResponse = (response as any).data?.data || (response as any).data || { positions: [] };
        setTimelineData(timelineDataResponse.positions || []);
        setWeekStart(timelineDataResponse.weekStart || null); // Guardar weekStart

        // Update selectedRows to synchronize with new data
        const updatedSelectedRows = selectedRows
          .map(selectedRow =>
            timelineDataResponse.positions.find((row: ITimelineRow) => row.position.id === selectedRow.position.id)
          )
          .filter(Boolean) as ITimelineRow[];
        setSelectedRows(updatedSelectedRows);
      } else {
        setMessage({
          title: "Error",
          description: "Error al cargar los datos del timeline",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
      }
    } catch (error) {
      console.error("Error loading timeline data:", error);
      setMessage({
        title: "Error",
        description: "Error al conectar con el servidor",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId?: number) => {
    setSelectedCompanyId(companyId);
    setSelectedRows([]); // Clear selection when filter changes
  };

  const handleRowSelectionChange = (rows: ITimelineRow[]) => {
    setSelectedRows(rows);
  };

  // Función para convertir nombre del día a fecha real
  const getDayDate = (dayName: string): string | null => {
    if (!weekStart) return null;
    
    const daysMap: { [key: string]: number } = {
      'MONDAY': 0,
      'TUESDAY': 1,
      'WEDNESDAY': 2,
      'THURSDAY': 3,
      'FRIDAY': 4,
      'SATURDAY': 5,
      'SUNDAY': 6
    };
    
    const dayIndex = daysMap[dayName];
    if (dayIndex === undefined) return null;
    
    // Parsear la fecha sin considerar zona horaria
    const [year, month, day] = weekStart.split('-').map(Number);
    const weekStartDate = new Date(year, month - 1, day);
    
    // Calcular la fecha del día
    const targetDate = new Date(weekStartDate);
    targetDate.setDate(targetDate.getDate() + dayIndex);
    
    // Formato YYYY-MM-DD
    const resultYear = targetDate.getFullYear();
    const resultMonth = String(targetDate.getMonth() + 1).padStart(2, '0');
    const resultDay = String(targetDate.getDate()).padStart(2, '0');
    
    console.log("getDayDate - weekStart:", weekStart, "dayName:", dayName, "dayIndex:", dayIndex, "result:", `${resultYear}-${resultMonth}-${resultDay}`);
    
    return `${resultYear}-${resultMonth}-${resultDay}`;
  };

  const handleCellClick = (row: ITimelineRow, day: string) => {
    // VALIDACIÓN: Verificar si hay empleado asignado a la posición
    if (!row.position.employeeCache) {
      setMessage({
        title: "Empleado No Asignado",
        description: `No hay un empleado asignado a la posición "${row.position.name}". Asigna un empleado primero para crear o editar horarios.`,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
      return;
    }

    // Find any employee with a work block for this day (prioritize current employee)
    let selectedEmployee = row.employees.find(emp => emp.currentEmployee);
    
    if (!selectedEmployee) {
      // If no current employee, find any employee with a work block
      selectedEmployee = row.employees.find(emp => {
        const timeBlocks = emp.scheduleData[day as keyof typeof emp.scheduleData] || [];
        return timeBlocks.some(block => block.type === 'work');
      });
    }

    if (selectedEmployee) {
      // Find the time block for this day
      const timeBlocks = selectedEmployee.scheduleData[day as keyof typeof selectedEmployee.scheduleData] || [];
      const timeBlock = timeBlocks.find(block => block.type === 'work'); // Only allow editing work blocks

      if (timeBlock) {
        // MODO EDITAR: Bloque existente
        const realDate = getDayDate(day); // Convertir a fecha real (YYYY-MM-DD)
        console.log("TimeBlock clicked (EDIT mode):", timeBlock, "realDate:", realDate);
        setSelectedTimeBlock({
          ...timeBlock,
          employeeName: selectedEmployee.name,
          positionId: row.position.id,
          date: realDate // ← Guardar fecha YYYY-MM-DD en lugar del nombre del día
        });
        setShowTimeBlockEditorModal(true);
      } else {
        // MODO CREAR: Celda vacía
        const realDate = getDayDate(day);
        console.log("Empty cell clicked (CREATE mode) - day:", day, "realDate:", realDate);
        setSelectedTimeBlock(null); // Indica que es nuevo
        setSelectedRowForTimeBlock(row); // Guardar la fila
        setSelectedDateForTimeBlock(realDate); // Guardar la fecha real (YYYY-MM-DD)
        setShowTimeBlockEditorModal(true);
      }
    } else {
      // MODO CREAR: Celda vacía (sin empleado histórico)
      const realDate = getDayDate(day);
      console.log("Empty cell clicked (CREATE mode) - day:", day, "realDate:", realDate);
      setSelectedTimeBlock(null); // Indica que es nuevo
      setSelectedRowForTimeBlock(row); // Guardar la fila
      setSelectedDateForTimeBlock(realDate); // Guardar la fecha real (YYYY-MM-DD)
      setShowTimeBlockEditorModal(true);
    }
  };

  // Modal state
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [showTimeBlockEditorModal, setShowTimeBlockEditorModal] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<any>(null);
  const [selectedRowForTimeBlock, setSelectedRowForTimeBlock] = useState<ITimelineRow | null>(null);
  const [selectedDateForTimeBlock, setSelectedDateForTimeBlock] = useState<string | null>(null);

  // Action handlers
  const handleAssignEmployee = () => {
    if (selectedRows.length === 1 && !selectedRows[0].position.employeeCache) {
      setShowAssignEmployeeModal(true);
    }
  };

  const handleAssignEmployeeConfirm = async (employeeId: number) => {
    try {
      const positionId = selectedRows[0].position.id;

      // Call assign employee endpoint
      const response = await put(`/api/positions/${positionId}/assign-employee`, { employeeId });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Show success message
        setMessage({
          title: "Empleado Asignado",
          description: "El empleado ha sido asignado exitosamente a la posición.",
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            // Reload timeline data
            loadTimelineData();
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });

        setShowAssignEmployeeModal(false);
      } else {
        throw new Error(response.operation.message || "Error al asignar empleado");
      }
    } catch (error) {
      console.error("Error assigning employee:", error);
      setMessage({
        title: "Error",
        description: "Error al asignar el empleado a la posición",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleUnassignEmployee = async () => {
    try {
      // For now, handle single position (can be extended for multiple)
      const position = selectedRows.find(row => row.position.employeeCache);
      if (!position) return;

      // STEP 1: Get preview of what will be deleted
      const previewResponse = await get(`/api/positions/${position.position.id}/unassign-preview`);
      const impact = (previewResponse as any).data?.data || (previewResponse as any).data || {};

      // STEP 2: Show confirmation dialog
      setMessage({
        title: "Confirmar Liberación de Puesto",
        description: `Se liberará el puesto del empleado ${
          position.position.employeeCache?.name || 'desconocido'
        }.${
          impact.futureSchedulesDeleted > 0
            ? ` Además se eliminarán ${impact.futureSchedulesDeleted} registro(s) de horarios futuros.`
            : ' No hay horarios futuros que eliminar.'
        } ¿Desea continuar?`,
        show: true,
        OkTitle: "Liberar Puesto",
        onOk: () => executeUnassign(position.position.id),
        cancelTitle: "Cancelar",
        background: true,
      });

    } catch (error) {
      console.error("Error getting unassign preview:", error);
      setMessage({
        title: "Error",
        description: "Error al calcular el impacto de la liberación",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const executeUnassign = async (positionId: number) => {
    try {
      // STEP 3: Execute the unassignment
      const resultResponse = await put(`/api/positions/${positionId}/unassign-employee`, {});
      const result = (resultResponse as any).data?.data || (resultResponse as any).data || {};

      // STEP 4: Show success message
      setMessage({
        title: "Puesto Liberado",
        description: `El puesto ha sido liberado exitosamente.${
          result.futureSchedulesDeleted > 0
            ? ` Se eliminaron ${result.futureSchedulesDeleted} registro(s) de horarios.`
            : ''
        }`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          // Reload timeline data
          loadTimelineData();
          setMessage((prev) => ({ ...prev, show: false }));
        },
        background: true,
      });

    } catch (error) {
      console.error("Error executing unassign:", error);
      setMessage({
        title: "Error",
        description: "Error al liberar el puesto",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleMoveEmployee = () => {
    // TODO: Open employee move modal
    console.log("Move employees:", selectedRows);
  };

  const handleLinkScheduleTemplate = () => {
    // TODO: Open schedule template linking modal
    console.log("Link schedule template to positions:", selectedRows);
  };

  // Modal state for change schedule template
  const [showChangeTemplateModal, setShowChangeTemplateModal] = useState(false);

  const handleChangeScheduleTemplate = () => {
    if (selectedRows.length === 1 && selectedRows[0].position.employeeCache) {
      setShowChangeTemplateModal(true);
    }
  };

  const handleChangeTemplateConfirm = async (scheduleTemplateId: number | null) => {
    try {
      const employeeId = selectedRows[0].position.employeeCache!.id;

      // Call update employee schedule template endpoint
      const response = await put(`/api/employees-cache/${employeeId}/schedule-template`, {
        scheduleTemplateId
      });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Show success message
        const action = scheduleTemplateId ? "actualizada" : "removida";
        setMessage({
          title: "Plantilla Actualizada",
          description: `La plantilla de horario ha sido ${action} exitosamente.`,
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            // Reload timeline data
            loadTimelineData();
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });

        setShowChangeTemplateModal(false);
      } else {
        throw new Error(response.operation.message || "Error al cambiar plantilla");
      }
    } catch (error) {
      console.error("Error changing schedule template:", error);
      setMessage({
        title: "Error",
        description: "Error al cambiar la plantilla de horario",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleGenerateSchedules = async () => {
    try {
      // Validate selected positions
      const validationErrors: string[] = [];

      selectedRows.forEach((row, index) => {
        if (!row.position.employeeCache) {
          validationErrors.push(`Posición ${index + 1}: No tiene empleado asignado`);
        } else if (!row.position.employeeCache.scheduleTemplate) {
          validationErrors.push(`Empleado ${row.position.employeeCache.name}: No tiene plantilla de horario asignada`);
        }
      });

      if (validationErrors.length > 0) {
        setMessage({
          title: "Validación Fallida",
          description: `No se pueden generar horarios:\n${validationErrors.join('\n')}`,
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        return;
      }

      // Show confirmation dialog
      setMessage({
        title: "Confirmar Generación de Horarios",
        description: `Se generarán los horarios para ${selectedRows.length} posición(es) desde hoy hasta el final de la semana. ¿Desea continuar?`,
        show: true,
        OkTitle: "Generar Horarios",
        onOk: () => executeGenerateSchedules(),
        cancelTitle: "Cancelar",
        background: true,
      });

    } catch (error) {
      console.error("Error validating positions:", error);
      setMessage({
        title: "Error",
        description: "Error al validar las posiciones seleccionadas",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const executeGenerateSchedules = async () => {
    try {
      const positionIds = selectedRows.map(row => row.position.id);

      // Call generate schedules endpoint
      const response = await post<Record<number, string>>("/api/daily-schedules/generate-schedules", {
        positionIds
      });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const results = (response as any).data?.data || (response as any).data || {};

        // Check if all were successful
        const errors = Object.entries(results)
          .filter(([_, message]) => (message as string).startsWith("ERROR"))
          .map(([positionId, message]) => `Posición ${positionId}: ${message}`);

        if (errors.length === 0) {
          // All successful
          setMessage({
            title: "Horarios Generados",
            description: `Se generaron los horarios exitosamente para ${positionIds.length} posición(es).`,
            show: true,
            OkTitle: "Aceptar",
            onOk: () => {
              // Reload timeline data
              loadTimelineData();
              setMessage((prev) => ({ ...prev, show: false }));
            },
            background: true,
          });
        } else {
          // Some errors
          setMessage({
            title: "Generación Parcial",
            description: `Algunos horarios no pudieron generarse:\n${errors.join('\n')}`,
            show: true,
            OkTitle: "Aceptar",
            onOk: () => {
              // Reload timeline data even with partial success
              loadTimelineData();
              setMessage((prev) => ({ ...prev, show: false }));
            },
            background: true,
          });
        }
      } else {
        throw new Error(response.operation.message || "Error al generar horarios");
      }
    } catch (error) {
      console.error("Error generating schedules:", error);
      setMessage({
        title: "Error",
        description: "Error al generar los horarios",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleBulkGenerateSchedules = () => {
    // TODO: Bulk generate schedules
    console.log("Bulk generate schedules for positions:", selectedRows);
  };

  // Time block editor handlers
  const handleTimeBlockSave = async (timeBlockId: number, startTime: string, endTime: string) => {
    try {
      setIsGeneratingSchedules(true); // Reuse loading state for simplicity
      await put(`/api/daily-schedules/time-block`, { timeBlockId, startTime, endTime });

      setMessage({
        title: "Horario Actualizado",
        description: "El horario ha sido actualizado exitosamente.",
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          loadTimelineData();
          setMessage((prev) => ({ ...prev, show: false }));
        },
        background: true,
      });

      setShowTimeBlockEditorModal(false);
    } catch (error) {
      console.error("Error updating time block:", error);
      setMessage({
        title: "Error",
        description: "Error al actualizar el horario",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setIsGeneratingSchedules(false);
    }
  };

  const handleTimeBlockCreate = async (positionId: number, employeeId: number, date: string, startTime: string, endTime: string) => {
    try {
      setIsGeneratingSchedules(true);
      console.log("Creating time block:", { positionId, employeeId, date, startTime, endTime });
      
      const response = await post(`/api/daily-schedules/time-block`, {
        positionId,
        employeeId,
        date,
        startTime,
        endTime
      });

      // Validar que la respuesta sea exitosa
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        setMessage({
          title: "Horario Creado",
          description: "El horario ha sido creado exitosamente.",
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            loadTimelineData();
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });

        setShowTimeBlockEditorModal(false);
      } else {
        // Si la respuesta tiene código FAIL, mostrar error
        throw new Error(response.operation.message || "Error al crear el horario");
      }
    } catch (error) {
      console.error("Error creating time block:", error);
      const errorMessage = (error as any)?.response?.data?.operation?.message || (error as any)?.message || "Error al crear el horario";
      setMessage({
        title: "Error",
        description: errorMessage,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setIsGeneratingSchedules(false);
    }
  };

  // Context menu model for right-click actions - minimalistic style
  const contextMenuModel = [
    {
      label: 'Vincular empleado',
      icon: 'pi pi-user-plus',
      command: handleAssignEmployee,
      style: { background: 'transparent', border: 'none', color: '#000' }
    },
    {
      label: 'Liberar puesto',
      icon: 'pi pi-user-minus',
      command: handleUnassignEmployee,
      disabled: !selectedRows.some(row => row.position.employeeCache),
      style: { background: 'transparent', border: 'none', color: '#000' }
    },
    {
      label: 'Pasar empleado a otro puesto',
      icon: 'pi pi-arrow-right',
      command: handleMoveEmployee,
      disabled: !selectedRows.some(row => row.position.employeeCache),
      style: { background: 'transparent', border: 'none', color: '#000' }
    },
  ];

  // Computed properties for button states
  const canAssignEmployee = selectedRows.length === 1 && !selectedRows[0]?.position.employeeCache;
  const canUnassignEmployee = selectedRows.length === 1 && !!selectedRows[0]?.position.employeeCache;
  const canAssociateTemplate = selectedRows.length === 1 && !!selectedRows[0]?.position.employeeCache;
  const canGenerateSchedules = selectedRows.length > 0;

  return {
    timelineData,
    companies,
    selectedCompanyId,
    selectedRows,
    loading,
    handleCompanyChange,
    handleRowSelectionChange,
    handleCellClick,
    handleAssignEmployee,
    handleUnassignEmployee,
    handleMoveEmployee,
    handleLinkScheduleTemplate,
    handleChangeScheduleTemplate,
    handleGenerateSchedules,
    handleBulkGenerateSchedules,
    contextMenuModel,
    // Modal state
    showAssignEmployeeModal,
    setShowAssignEmployeeModal,
    handleAssignEmployeeConfirm,
    // Change template modal state
    showChangeTemplateModal,
    setShowChangeTemplateModal,
    handleChangeTemplateConfirm,
    // Time block editor modal state
    showTimeBlockEditorModal,
    setShowTimeBlockEditorModal,
    selectedTimeBlock,
    setSelectedTimeBlock,
    selectedRowForTimeBlock,
    selectedDateForTimeBlock,
    handleTimeBlockSave,
    handleTimeBlockCreate,
    // Button states
    canAssignEmployee,
    canUnassignEmployee,
    canAssociateTemplate,
    canGenerateSchedules,
  };
}