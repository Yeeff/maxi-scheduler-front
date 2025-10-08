import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IScheduleTemplate,
  IScheduleFilter,
} from "../../../common/interfaces/schedule.interfaces";
import {
  ITableAction,
  ITableElement,
} from "../../../common/interfaces/table.interfaces";

import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../common/contexts/app.context";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { IPagingData } from "../../../common/utils/api-response";

export default function useSearchScheduleHook() {
  // Context
  const { validateActionAccess, setMessage } = useContext(AppContext);

  // Custom hooks
  const { get, deleted } = useCrudService<IScheduleTemplate>(process.env.urlApiScheduler);

  //states
  const [showTable, setshowTable] = useState(false);
  const [tableData, setTableData] = useState<IPagingData<IScheduleTemplate>>({
    array: [],
    meta: { total: 0 }
  });
  const [loading, setLoading] = useState(false);

  //ref
  const tableComponentRef = useRef(null);

  //react-router-dom
  const navigate = useNavigate();

  //react-hook-form
  const { formState, control, handleSubmit, reset, watch, register } =
    useForm<IScheduleFilter>({
      defaultValues: { name: "" },
      mode: "all",
    });

  const formValues = watch();

  //functions
  const redirectCreate = () => {
    // Temporarily removed permission validation for testing
    navigate("../crear");
  };

  const clearFields = () => {
    reset();
    setTableData({ array: [], meta: { total: 0 } });
    setshowTable(false);
  };

  const loadSchedules = async (filter?: IScheduleFilter) => {
    try {
      setLoading(true);
      console.log("Loading schedules with filter:", filter);

      const response = await get<IScheduleTemplate[]>("/api/schedules");

      // Handle both ApiResponse format and direct array format
      let schedules: IScheduleTemplate[] = [];
      if (response && (response as any).data && (response as any).data.operation && (response as any).data.operation.code === EResponseCodes.OK) {
        schedules = (response as any).data.data as IScheduleTemplate[];
        console.log("Data loaded (ApiResponse format):", schedules);
      } else if (Array.isArray(response)) {
        schedules = response;
        console.log("Data loaded (direct array format):", schedules);
      } else if ((response as any)?.data?.id || (response as any)?.data?.name) {
        // Single object response
        schedules = [(response as any).data as unknown as IScheduleTemplate];
        console.log("Data loaded (single object):", schedules);
      }

      // Apply client-side filtering if filter is provided
      let filteredSchedules = schedules;
      if (filter?.name) {
        filteredSchedules = schedules.filter(schedule =>
          schedule.name?.toLowerCase().includes(filter.name.toLowerCase())
        );
      }

      setTableData({
        array: filteredSchedules,
        meta: { total: filteredSchedules.length }
      });
      setshowTable(true);

    } catch (error) {
      console.error("Error loading schedules:", error);
      setMessage({
        title: "Error",
        description: "Error al cargar los horarios",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit((data: IScheduleFilter) => {
    loadSchedules(data);
  });

  //variables
  const tableColumns: ITableElement<IScheduleTemplate>[] = [
    {
      fieldName: "name",
      header: "Nombre",
      renderCell: (row) => {
        return <>{row.name}</>;
      },
    },
    {
      fieldName: "description",
      header: "Descripción",
      renderCell: (row) => {
        return <>{row.description}</>;
      },
    },
  ];

  const handleDeleteSchedule = (schedule: IScheduleTemplate) => {
    setMessage({
      title: "Eliminar Horario",
      description: `¿Estás seguro de que deseas eliminar el horario "${schedule.name}"? Esta acción no se puede deshacer.`,
      show: true,
      OkTitle: "Eliminar",
      onOk: () => {
        performDelete(schedule);
        setMessage((prev) => ({ ...prev, show: false }));
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  };

  const performDelete = async (schedule: IScheduleTemplate) => {
    try {
      console.log("Deleting schedule:", schedule.id);
      console.log("API URL:", process.env.urlApiScheduler);
      const response = await deleted(`/api/schedules/${schedule.id}`);
      console.log("Delete API Response:", response);

      // Handle DELETE responses - they may return 204 No Content (empty response)
      // or ApiResponse format. If no error operation is present, assume success.
      if (!response || !(response as any).data || !(response as any).data.operation || (response as any).data.operation.code === EResponseCodes.OK) {
        console.log("Schedule deleted successfully");
      } else {
        console.log("Delete failed:", (response as any).data.operation);
        const errorMsg = (response as any).data.operation.message || 'Error al eliminar el horario';
        setMessage({
          title: "Error",
          description: errorMsg,
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        return;
      }

      // Show success message and reload data
      setMessage({
        title: "Horario Eliminado",
        description: `El horario "${schedule.name}" ha sido eliminado exitosamente.`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          // Reload the current filter to refresh the table
          const currentFilter = watch();
          loadSchedules(currentFilter.name ? currentFilter : undefined);
          setMessage((prev) => ({ ...prev, show: false }));
        },
        background: true,
      });

    } catch (error) {
      console.error("Error deleting schedule:", error);
      setMessage({
        title: "Error",
        description: "Error al eliminar el horario",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const tableActions: ITableAction<IScheduleTemplate>[] = [
    {
      icon: "Edit",
      onClick: (row) => {
        navigate(`../edit/${row.id}`);
      },
      // Temporarily removed permission validation
      hide: false,
    },
    {
      icon: "Detail",
      onClick: (row) => {
        navigate(`../detalles/${row.id}`);
      },
      // Temporarily removed permission validation
      hide: false,
    },
    {
      icon: "Delete",
      onClick: (row) => {
        console.log("Delete clicked for row:", row);
        handleDeleteSchedule(row);
      },
      hide: false,
    },
  ];

  return {
    formState,
    control,
    showTable,
    formValues,
    tableData,
    loading,
    tableColumns,
    tableActions,
    redirectCreate,
    onSubmit,
    clearFields,
    register,
  };
}