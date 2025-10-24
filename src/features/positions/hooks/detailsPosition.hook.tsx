import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { IPosition } from "../../../common/interfaces/position.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useCrudService from "../../../common/hooks/crud-service.hook";
import { ApiResponse } from "../../../common/utils/api-response";

const useDetailsPositionHook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setMessage } = useContext(AppContext);

  const [position, setPosition] = useState<IPosition | null>(null);
  const [loading, setLoading] = useState(true);

  const { get } = useCrudService<IPosition>(
    process.env.urlApiScheduler
  );

  useEffect(() => {
    if (id) {
      fetchPositionDetails();
    }
  }, [id]);

  const fetchPositionDetails = async () => {
    try {
      setLoading(true);
      const response = await get<IPosition>(`/api/positions/${id}`);

      if ((response as any).data.operation.code === EResponseCodes.OK) {
        setPosition((response as any).data.data);
      } else {
        handleError("Error al cargar los detalles del cargo");
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
    position,
    loading,
    redirectToEdit,
    redirectToList,
  };
};

export default useDetailsPositionHook;