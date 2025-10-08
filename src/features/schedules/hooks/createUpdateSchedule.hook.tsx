import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useYupValidationResolver from "../../../common/hooks/form-validator.hook";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { ApiResponse } from "../../../common/utils/api-response";

interface IPropsUseCreateUpdateSchedule {
  action: string;
}

const useCreateUpdateScheduleHook = ({
  action,
}: IPropsUseCreateUpdateSchedule) => {
  //react router dom
  const navigate = useNavigate();
  const { id } = useParams();

  // Context
  const { setMessage } = useContext(AppContext);

  // State for loading
  const [isLoading, setIsLoading] = useState(action === "edit");

  //custom hooks
  const { post, put, get } = useCrudService<IScheduleTemplate>(
    process.env.urlApiScheduler
  );

  //use form
  const { control, formState, handleSubmit, setValue, watch, reset } =
    useForm<IScheduleTemplate>({
      defaultValues: {
        name: "",
        description: "",
        details: [
          { dayOfWeek: "MONDAY", shifts: [] },
          { dayOfWeek: "TUESDAY", shifts: [] },
          { dayOfWeek: "WEDNESDAY", shifts: [] },
          { dayOfWeek: "THURSDAY", shifts: [] },
          { dayOfWeek: "FRIDAY", shifts: [] },
          { dayOfWeek: "SATURDAY", shifts: [] },
          { dayOfWeek: "SUNDAY", shifts: [] },
        ],
      },
      mode: "all",
    });

  // Load data on mount for edit mode
  useEffect(() => {
    if (action === "edit" && id) {
      loadEditData();
    }
  }, [action, id]);

  //functions
  const renderTitle = () => {
    return action === "edit" ? "Editar horario" : "Crear horario";
  };

  const loadEditData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading schedule data for ID:", id);
      console.log("API URL:", process.env.urlApiScheduler);
      const response = await get<IScheduleTemplate>(`/api/schedules/${id}`);
      console.log("API Response:", response);

      // Check if response has operation property (ApiResponse format)
      if (response && (response as any).data && (response as any).data.operation && (response as any).data.operation.code === EResponseCodes.OK) {
        console.log("Data loaded successfully (ApiResponse format):", (response as any).data.data);
        reset((response as any).data.data);
      }
      // Check if response is direct data (no operation wrapper)
      else if (response && (response as any).data && (response as any).data.id && (response as any).data.name) {
        console.log("Data loaded successfully (direct format):", (response as any).data);
        reset((response as any).data as unknown as IScheduleTemplate);
      }
      else {
        console.log("API Error:", (response as any)?.data?.operation || response);
        const errorMsg = (response as any)?.data?.operation?.message || 'Unknown error';
        handleModalError(`No se han cargado los datos: ${errorMsg}`);
      }
    } catch (error) {
      console.error("Network/API Error:", error);
      handleModalError(`Error al cargar los datos: ${error.message || 'Network error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const redirectCancel = () => {
    setMessage({
      title: "Cancelar",
      description: `¿Estás segur@ que deseas cancelar?`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        navigate("../consultar");
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  };

  const handleModalError = (
    msg = `¡Ha ocurrido un error!`,
    navigateBoolean = true
  ) => {
    setMessage({
      title: "Error",
      description: msg,
      show: true,
      OkTitle: "cerrar",
      onOk: () => {
        if (navigateBoolean) {
          navigate("../consultar");
        }
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        if (navigateBoolean) {
          navigate("../consultar");
        }
        setMessage({});
      },
      background: true,
    });
  };

  const handleModalSuccess = () => {
    console.log("Showing success modal for action:", action);
    setMessage({
      title: ` ${action === "edit" ? "Editado" : "Guardado"}`,
      description: `Horario ${
        action === "edit" ? "editado" : "guardado"
      } exitosamente en el sistema`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        console.log("User clicked Aceptar, navigating to ../consultar");
        navigate("../consultar");
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        console.log("Modal closed, navigating to ../consultar");
        navigate("../consultar");
        setMessage({});
      },
      background: true,
    });
  };

  const handleSubmitSchedule = handleSubmit((data: IScheduleTemplate) => {
    setMessage({
      title: `${action === "edit" ? "Editar" : "Crear"} Horario`,
      description: `¿Estás segur@ de ${action === "edit" ? "editar" : "crear"}
      el horario?`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        handleCreateOrUpdateSchedule(data);
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  });

  const handleCreateOrUpdateSchedule = async (data: IScheduleTemplate) => {
    console.log("Creating/updating schedule with data:", data);
    const response =
      action === "edit"
        ? await put<IScheduleTemplate>(`/api/schedules/${id}`, data)
        : await post<IScheduleTemplate>("/api/schedules", data);

    console.log("API Response:", response);

    // Check if response has operation property (ApiResponse format)
    if (response && (response as any).data && (response as any).data.operation && (response as any).data.operation.code === EResponseCodes.OK) {
      console.log("API call successful (ApiResponse format), showing success modal");
      handleModalSuccess();
    }
    // Check if response is direct data (no operation wrapper) - assume success if we have data
    else if (response && (response as any).data && (response as any).data.id && (response as any).data.name) {
      console.log("API call successful (direct format), showing success modal");
      handleModalSuccess();
    }
    else {
      console.log("API call failed:", (response as any)?.data?.operation || response);
      const errorMsg = (response as any)?.data?.operation?.message || 'Unknown error';
      handleModalError(errorMsg, false);
    }
  };

  return {
    control,
    formState,
    renderTitle,
    redirectCancel,
    handleSubmitSchedule,
    setValue,
    watch,
    reset,
    isLoading,
  };
};

export default useCreateUpdateScheduleHook;