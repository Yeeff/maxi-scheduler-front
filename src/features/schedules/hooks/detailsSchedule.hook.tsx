import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useCrudService from "../../../common/hooks/crud-service.hook";
import { ApiResponse } from "../../../common/utils/api-response";

const useDetailsScheduleHook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setMessage } = useContext(AppContext);

  const [schedule, setSchedule] = useState<IScheduleTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  const { get } = useCrudService<IScheduleTemplate>(
    process.env.urlApiScheduler
  );

  useEffect(() => {
    if (id) {
      fetchScheduleDetails();
    }
  }, [id]);

  const fetchScheduleDetails = async () => {
    try {
      setLoading(true);
      const response = await get<IScheduleTemplate>(`/api/schedules/${id}`);

      if (response.operation.code === EResponseCodes.OK) {
        setSchedule(response.data);
      } else {
        handleError("Error al cargar los detalles del horario");
      }
    } catch (error) {
      handleError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message: string) => {
    setMessage({
      title: "Error",
      description: message,
      show: true,
      OkTitle: "Aceptar",
      background: true,
    });
    navigate("../consultar");
  };

  const redirectToEdit = () => {
    navigate(`../edit/${id}`);
  };

  const redirectToList = () => {
    navigate("../consultar");
  };

  return {
    schedule,
    loading,
    redirectToEdit,
    redirectToList,
  };
};

export default useDetailsScheduleHook;