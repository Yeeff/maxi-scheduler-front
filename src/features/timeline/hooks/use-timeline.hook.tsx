import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { ITimelineRow, ITimelineData } from "../../../common/interfaces/timeline.interfaces";
import { ICompany } from "../../../common/interfaces/company.interfaces";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useCrudService from "../../../common/hooks/crud-service.hook";

export default function useTimelineHook() {
  const navigate = useNavigate();
  const { setMessage } = useContext(AppContext);

  // State
  const [timelineData, setTimelineData] = useState<ITimelineRow[]>([]);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [employees, setEmployees] = useState<{ id: number; name: string; document?: string }[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<{ id: number; name: string; code: string }[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [selectedLeaveTypeId, setSelectedLeaveTypeId] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<ITimelineRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);
  const [isGeneratingWeek, setIsGeneratingWeek] = useState(false);
  const [isGeneratingMonth, setIsGeneratingMonth] = useState(false);
  const [weekStart, setWeekStart] = useState<string | null>(null);
  const [justLoadedCurrent, setJustLoadedCurrent] = useState(false);

  // Refs
  const loadingTimelineRef = useRef(false);

  // Services
  const { get, put, post } = useCrudService(process.env.urlApiScheduler);

  // Load initial data
  useEffect(() => {
    loadCompanies();
    loadEmployees();
    loadLeaveTypes();
  }, []);

  // Reload data when filters or week start change
  useEffect(() => {
    if (justLoadedCurrent) {
      setJustLoadedCurrent(false);
      return;
    }
    loadTimelineData(weekStart);
  }, [selectedCompanyId, selectedEmployeeId, selectedLeaveTypeId, weekStart, justLoadedCurrent]);

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

  const loadEmployees = async () => {
    try {
      const response = await get<{ id: number; name: string; document?: string }[]>("/api/employees-cache");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const employeesData = (response as any).data?.data || (response as any).data || [];
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const response = await get<{ id: number; name: string; code: string }[]>("/api/leave-types");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const leaveTypesData = (response as any).data?.data || (response as any).data || [];
        setLeaveTypes(Array.isArray(leaveTypesData) ? leaveTypesData : []);
      }
    } catch (error) {
      console.error("Error loading leave types:", error);
    }
  };

  const loadTimelineData = async (specificWeekStart?: string | null) => {
    if (loadingTimelineRef.current) return; // Prevent concurrent calls

    try {
      loadingTimelineRef.current = true;
      setTimelineData([]); // Clear old data immediately for better UX
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      // Only add companyId if a specific company is selected (not null)
      if (selectedCompanyId !== null) {
        params.append('companyId', selectedCompanyId.toString());
      }

      // Only add employeeId if a specific employee is selected (not null)
      if (selectedEmployeeId !== null) {
        params.append('employeeId', selectedEmployeeId.toString());
      }

      // Only add leaveTypeId if a specific leave type is selected (not null)
      if (selectedLeaveTypeId !== null) {
        params.append('leaveTypeId', selectedLeaveTypeId.toString());
      }

      // Add weekStart parameter if provided (for history mode)
      if (specificWeekStart) {
        params.append('weekStart', specificWeekStart);
      }

      const response = await get<ITimelineData>(`/api/daily-schedules/timeline?${params.toString()}`);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const timelineDataResponse = (response as any).data?.data || (response as any).data || { positions: [] };
        let allPositions = timelineDataResponse.positions || [];
        setWeekStart(timelineDataResponse.weekStart || null); // Guardar weekStart

        if (specificWeekStart === null) {
          setJustLoadedCurrent(true);
        }

        // Always group positions by company for consistent organization
        const groupedData = groupPositionsByCompany(allPositions);

        setTimelineData(groupedData);

        // Update selectedRows to synchronize with new data
        const updatedSelectedRows = selectedRows
          .map(selectedRow =>
            allPositions.find((row: ITimelineRow) => row.position.id === selectedRow.position.id)
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
      loadingTimelineRef.current = false;
    }
  };

  const handleCompanyChange = (companyId: number | null) => {
    setSelectedCompanyId(companyId);
    setSelectedRows([]); // Clear selection when filter changes
  };

  const handleEmployeeChange = (employeeId: number | null) => {
    setSelectedEmployeeId(employeeId);
    setSelectedRows([]); // Clear selection when filter changes
  };

  const handleLeaveTypeChange = (leaveTypeId: number | null) => {
    setSelectedLeaveTypeId(leaveTypeId);
    setSelectedRows([]); // Clear selection when filter changes
  };

  const handleClearFilters = () => {
    setSelectedCompanyId(null);
    setSelectedEmployeeId(null);
    setSelectedLeaveTypeId(null);
    setSelectedRows([]); // Clear selection when filters are cleared
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

    const result = formatLocalDate(targetDate);

    console.log("getDayDate - weekStart:", weekStart, "dayName:", dayName, "dayIndex:", dayIndex, "result:", result);

    return result;
  };

  const handleCellClick = (row: ITimelineRow, day: string) => {
    // Open the time block manager modal for the position and day
    const realDate = getDayDate(day);
    console.log("Cell clicked - opening manager modal for position:", row.position.name, "day:", day, "date:", realDate);
    setSelectedPositionForManager(row.position.id);
    setSelectedDayForManager(day);
    setShowTimeBlockManagerModal(true);
  };

  // Modal state
  const [showAssignEmployeeModal, setShowAssignEmployeeModal] = useState(false);
  const [showCreateCompanyModal, setShowCreateCompanyModal] = useState(false);
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showTimeBlockEditorModal, setShowTimeBlockEditorModal] = useState(false);
  const [showTimeBlockManagerModal, setShowTimeBlockManagerModal] = useState(false);
  const [selectedTimeBlock, setSelectedTimeBlock] = useState<any>(null);
  const [selectedRowForTimeBlock, setSelectedRowForTimeBlock] = useState<ITimelineRow | null>(null);
  const [selectedDateForTimeBlock, setSelectedDateForTimeBlock] = useState<string | null>(null);
  const [selectedPositionForManager, setSelectedPositionForManager] = useState<number | null>(null);
  const [selectedDayForManager, setSelectedDayForManager] = useState<string | null>(null);

  // Action handlers
  const handleCreateCompany = () => {
    setShowCreateCompanyModal(true);
  };

  const handleCreatePosition = () => {
    if (selectedCompanyId !== null) {
      setShowCreatePositionModal(true);
    }
  };

  const handleCreateCompanyConfirm = async (companyData: { name: string; nit: string }) => {
    try {
      const response = await post<ICompany>("/api/companies", {
        name: companyData.name,
        nit: companyData.nit,
        status: true,
      });

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Reload companies list
        await loadCompanies();

        setMessage({
          title: "Empresa Creada",
          description: "La empresa ha sido creada exitosamente.",
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });

        setShowCreateCompanyModal(false);
      } else {
        throw new Error(response.operation.message || "Error al crear la empresa");
      }
    } catch (error: any) {
      console.error("Error creating company:", error);

      // Extract error message from API response
      let errorMessage = "Error al crear la empresa";

      if (error?.response?.data?.operation?.message) {
        const apiMessage = error.response.data.operation.message;

        // Check for specific database constraint errors
        if (apiMessage.includes("Duplicate entry") && apiMessage.includes("company.UKniu8sfil2gxywcru9ah3r4ec5")) {
          if (apiMessage.includes("name")) {
            errorMessage = "Ya existe una empresa con este nombre. Por favor, elija un nombre diferente.";
          } else if (apiMessage.includes("nit")) {
            errorMessage = "Ya existe una empresa con este NIT. Por favor, verifique el NIT.";
          }
        } else if (apiMessage.includes("Duplicate entry") && apiMessage.includes("company.UK")) {
          errorMessage = "Los datos de la empresa ya existen en el sistema. Verifique el nombre y NIT.";
        } else {
          errorMessage = apiMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage({
        title: "Error al Crear Empresa",
        description: errorMessage,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleCreatePositionConfirm = async (positionData: { name: string; companyId: number }) => {
    try {
      // First load schedule templates to get the default one
      const scheduleResponse = await get<IScheduleTemplate[]>("/api/schedules");
      if (!(scheduleResponse.operation.code === EResponseCodes.OK || scheduleResponse.operation.code === EResponseCodes.SUCCESS)) {
        throw new Error("No se pudieron cargar las plantillas de horario");
      }

      const schedulesData = (scheduleResponse as any).data?.data || (scheduleResponse as any).data || [];
      const scheduleTemplates = Array.isArray(schedulesData) ? schedulesData : [];

      if (scheduleTemplates.length === 0) {
        throw new Error("No hay plantillas de horario disponibles. Debe crear al menos una plantilla de horario primero.");
      }

      // Use the first schedule template as default
      const defaultScheduleTemplate = scheduleTemplates[0];

      const positionPayload = {
        name: positionData.name,
        company: { id: positionData.companyId },
        scheduleTemplate: { id: defaultScheduleTemplate.id },
        status: true,
      };

      const response = await post("/api/positions", positionPayload);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Reload timeline data to show the new position
        await loadTimelineData(weekStart);

        setMessage({
          title: "Posición Creada",
          description: "La posición ha sido creada exitosamente.",
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });

        setShowCreatePositionModal(false);
      } else {
        throw new Error(response.operation.message || "Error al crear la posición");
      }
    } catch (error: any) {
      console.error("Error creating position:", error);

      // Extract error message from API response
      let errorMessage = "Error al crear la posición";

      if (error?.response?.data?.operation?.message) {
        const apiMessage = error.response.data.operation.message;

        // Check for specific database constraint errors
        if (apiMessage.includes("Duplicate entry")) {
          errorMessage = "Ya existe una posición con este nombre en la empresa seleccionada.";
        } else {
          errorMessage = apiMessage;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      setMessage({
        title: "Error al Crear Posición",
        description: errorMessage,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

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
            loadTimelineData(weekStart);
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
          loadTimelineData(weekStart);
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
            loadTimelineData(weekStart);
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
              loadTimelineData(weekStart);
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
              loadTimelineData(weekStart);
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

  const handleGenerateWeekFromPrevious = async () => {
    if (selectedCompanyId === null) {
      setMessage({
        title: "Error",
        description: "Debe seleccionar una empresa primero",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
      return;
    }

    try {
      setIsGeneratingWeek(true);

      // Calculate reference date (today)
      const referenceDate = formatLocalDate(new Date());

      const request = {
        companyId: selectedCompanyId,
        referenceDate: referenceDate
      };

      const response = await post("/api/daily-schedules/generate-week", request);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const result = (response as any).data?.data || (response as any).data || {};

        setMessage({
          title: "Semana Generada",
          description: result.message || `Se generaron ${result.generatedCount || 0} horarios desde la semana anterior.`,
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            loadTimelineData(weekStart);
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });
      } else {
        throw new Error(response.operation.message || "Error al generar la semana");
      }
    } catch (error) {
      console.error("Error generating week:", error);
      const errorMessage = (error as any)?.response?.data?.operation?.message || (error as any)?.message || "Error al generar la semana desde la anterior";
      setMessage({
        title: "Error",
        description: errorMessage,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setIsGeneratingWeek(false);
    }
  };

  const handleGenerateMonthFromPrevious = async () => {
    try {
      setIsGeneratingMonth(true);

      // Calculate reference date (today)
      const referenceDate = formatLocalDate(new Date());

      const request = {
        referenceDate: referenceDate
      };

      const response = await post("/api/daily-schedules/generate-month", request);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const result = (response as any).data?.data || (response as any).data || {};

        setMessage({
          title: "Mes Generado",
          description: result.message || `Se generaron ${result.generatedCount || 0} horarios desde el mes anterior.`,
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            loadTimelineData(weekStart);
            setMessage((prev) => ({ ...prev, show: false }));
          },
          background: true,
        });
      } else {
        throw new Error(response.operation.message || "Error al generar el mes");
      }
    } catch (error) {
      console.error("Error generating month:", error);
      const errorMessage = (error as any)?.response?.data?.operation?.message || (error as any)?.message || "Error al generar el mes desde el anterior";
      setMessage({
        title: "Error",
        description: errorMessage,
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setIsGeneratingMonth(false);
    }
  };

  // Time block editor handlers
  const handleTimeBlockSave = async (timeBlockId: number, employeeId: number, startTime: string, endTime: string, leaveTypeId: number) => {
    try {
      setIsGeneratingSchedules(true); // Reuse loading state for simplicity
      await put(`/api/daily-schedules/time-block`, { timeBlockId, employeeId, startTime, endTime, leaveTypeId });

      setMessage({
        title: "Horario Actualizado",
        description: "El horario ha sido actualizado exitosamente.",
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          loadTimelineData(weekStart);
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

  const handleTimeBlockCreate = async (positionId: number, employeeId: number, date: string, startTime: string, endTime: string, leaveTypeId: number) => {
    try {
      setIsGeneratingSchedules(true);
      console.log("Creating time block:", { positionId, employeeId, date, startTime, endTime, leaveTypeId });

      const response = await post(`/api/daily-schedules/time-block`, {
        positionId,
        employeeId,
        date,
        startTime,
        endTime,
        leaveTypeId
      });

      // Validar que la respuesta sea exitosa
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        setMessage({
          title: "Horario Creado",
          description: "El horario ha sido creado exitosamente.",
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            loadTimelineData(weekStart);
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

  // Time block manager handlers
  const handleTimeBlockEdit = (timeBlock: any, row: ITimelineRow) => {
    const realDate = getDayDate(selectedDayForManager!);
    setSelectedTimeBlock({
      ...timeBlock,
      employeeName: timeBlock.employeeName,
      positionId: row.position.id,
      date: realDate
    });
    setShowTimeBlockEditorModal(true);
  };

  const handleTimeBlockCreateFromManager = (row: ITimelineRow, date: string) => {
    setSelectedTimeBlock(null);
    setSelectedRowForTimeBlock(row);
    setSelectedDateForTimeBlock(date);
    setShowTimeBlockEditorModal(true);
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

  // Week navigation functions
  const navigateToCurrentWeek = () => {
    setWeekStart(null); // null will trigger loading current week
  };

  const navigateToPreviousWeek = () => {
    if (!weekStart) return;

    const previousWeek = getPreviousWeekStart(weekStart);

    // Prevent navigating more than 1 year back
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const previousWeekDate = new Date(previousWeek);

    if (previousWeekDate < oneYearAgo) {
      setMessage({
        title: "Límite alcanzado",
        description: "No se puede navegar más de un año hacia atrás.",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
      return;
    }

    setWeekStart(previousWeek);
  };

  const navigateToNextWeek = () => {
    if (!weekStart) return;

    const nextWeek = getNextWeekStart(weekStart);

    // Allow navigation to future weeks
    setWeekStart(nextWeek);
  };

  const getPreviousWeekStart = (fromDate: string): string => {
    // Parse as local date to avoid timezone shift
    const [year, month, day] = fromDate.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    const previousWeek = new Date(baseDate);
    previousWeek.setDate(baseDate.getDate() - 7);
    return formatLocalDate(previousWeek);
  };

  const getNextWeekStart = (fromDate: string): string => {
    // Parse as local date to avoid timezone shift
    const [year, month, day] = fromDate.split('-').map(Number);
    const baseDate = new Date(year, month - 1, day);
    const nextWeek = new Date(baseDate);
    nextWeek.setDate(baseDate.getDate() + 7);
    return formatLocalDate(nextWeek);
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentWeekDisplay = (): string => {
    if (!weekStart) return '';

    // Parse as local date to avoid timezone shift
    const [year, month, day] = weekStart.split('-').map(Number);
    const startDate = new Date(year, month - 1, day);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Group positions by company for display when showing all companies
  const groupPositionsByCompany = (positions: ITimelineRow[]): ITimelineRow[] => {
    // Group positions by company
    const positionsByCompany = positions.reduce((acc, position) => {
      const companyId = position.position.company?.id;
      if (!companyId) return acc;

      if (!acc[companyId]) {
        acc[companyId] = {
          company: position.position.company,
          positions: []
        };
      }
      acc[companyId].positions.push(position);
      return acc;
    }, {} as Record<number, { company: any, positions: ITimelineRow[] }>);

    // Create a special "company header" row for each company
    const groupedRows: ITimelineRow[] = [];

    Object.values(positionsByCompany).forEach(({ company, positions: companyPositions }) => {
      // Add company header row
      const companyHeaderRow: ITimelineRow = {
        id: `company-${company.id}`,
        position: {
          id: -company.id, // Negative ID to distinguish from real positions
          name: company.name,
          company: company,
          status: true,
          scheduleTemplate: { id: 0, name: '', description: '', details: [] }
        },
        employees: []
      };
      groupedRows.push(companyHeaderRow);

      // Add positions for this company
      groupedRows.push(...companyPositions);
    });

    return groupedRows;
  };


  // Computed properties for button states
  const canAssignEmployee = selectedRows.length === 1 && !selectedRows[0]?.position.employeeCache;
  const canUnassignEmployee = selectedRows.length === 1 && !!selectedRows[0]?.position.employeeCache;
  const canAssociateTemplate = selectedRows.length === 1 && !!selectedRows[0]?.position.employeeCache;
  const canGenerateSchedules = selectedRows.length > 0;

  return {
    timelineData,
    companies,
    employees,
    leaveTypes,
    selectedCompanyId,
    selectedEmployeeId,
    selectedLeaveTypeId,
    selectedRows,
    loading,
    isGeneratingWeek,
    isGeneratingMonth,
    weekStart,
    handleCompanyChange,
    handleEmployeeChange,
    handleLeaveTypeChange,
    handleClearFilters,
    handleRowSelectionChange,
    handleCellClick,
    handleCreateCompany,
    handleCreatePosition,
    handleAssignEmployee,
    handleUnassignEmployee,
    handleMoveEmployee,
    handleLinkScheduleTemplate,
    handleChangeScheduleTemplate,
    handleGenerateSchedules,
    handleBulkGenerateSchedules,
    handleGenerateWeekFromPrevious,
    handleGenerateMonthFromPrevious,
    contextMenuModel,
    // Modal state
    showAssignEmployeeModal,
    setShowAssignEmployeeModal,
    handleAssignEmployeeConfirm,
    // Create company modal state
    showCreateCompanyModal,
    setShowCreateCompanyModal,
    handleCreateCompanyConfirm,
    // Create position modal state
    showCreatePositionModal,
    setShowCreatePositionModal,
    handleCreatePositionConfirm,
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
    // Time block manager modal state
    showTimeBlockManagerModal,
    setShowTimeBlockManagerModal,
    selectedPositionForManager,
    selectedDayForManager,
    handleTimeBlockEdit,
    handleTimeBlockCreateFromManager,
    // Utility functions
    getDayDate,
    loadTimelineData,
    // Button states
    canAssignEmployee,
    canUnassignEmployee,
    canAssociateTemplate,
    canGenerateSchedules,
    // Week navigation
    navigateToCurrentWeek,
    navigateToPreviousWeek,
    navigateToNextWeek,
    getCurrentWeekDisplay,
  };
}