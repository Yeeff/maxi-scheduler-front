import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { ITimelineRow, ITimelineData } from "../../../common/interfaces/timeline.interfaces";
import { ICompany } from "../../../common/interfaces/position.interfaces";
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

  // Services
  const { get, put } = useCrudService(process.env.urlApiScheduler);

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

      // Get current week start (Monday)
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
      const weekStart = monday.toISOString().split('T')[0]; // Format as YYYY-MM-DD

      const params = new URLSearchParams({
        companyId: selectedCompanyId.toString(),
        weekStart: weekStart
      });
      const response = await get<ITimelineData>(`/api/daily-schedules/timeline?${params.toString()}`);

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const timelineDataResponse = (response as any).data?.data || (response as any).data || { positions: [] };
        setTimelineData(timelineDataResponse.positions || []);
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

  const handleCellClick = (row: ITimelineRow, day: string) => {
    // TODO: Open time block editor modal
    console.log("Cell clicked:", { row, day });
  };

  // Action handlers
  const handleAssignEmployee = () => {
    // TODO: Open employee assignment modal
    console.log("Assign employee to positions:", selectedRows);
  };

  const handleUnassignEmployee = async () => {
    try {
      // Unassign employees from all selected positions
      for (const row of selectedRows) {
        if (row.position.employeeCache) {
          console.log("Unassigning employee from position:", row.position.id);
          await put(`/api/positions/${row.position.id}/unassign-employee`, {});
        }
      }

      // Show success message
      setMessage({
        title: "Puestos Liberados",
        description: `Se han liberado ${selectedRows.filter(row => row.position.employeeCache).length} puesto(s) exitosamente.`,
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
      console.error("Error unassigning employees:", error);
      setMessage({
        title: "Error",
        description: "Error al liberar los puestos",
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

  const handleChangeScheduleTemplate = () => {
    // TODO: Open schedule template change modal
    console.log("Change schedule template for positions:", selectedRows);
  };

  const handleGenerateSchedules = () => {
    // TODO: Generate schedules from templates
    console.log("Generate schedules for positions:", selectedRows);
  };

  const handleBulkGenerateSchedules = () => {
    // TODO: Bulk generate schedules
    console.log("Bulk generate schedules for positions:", selectedRows);
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
  };
}