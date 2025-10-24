import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";
import { ICompany } from "../../../common/interfaces/company.interfaces";
import { EResponseCodes } from "../../../common/constants/api.enum";

import useCrudService from "../../../common/hooks/crud-service.hook";
import { ApiResponse } from "../../../common/utils/api-response";

const useDetailsCompanyHook = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setMessage } = useContext(AppContext);

  const [company, setCompany] = useState<ICompany | null>(null);
  const [loading, setLoading] = useState(true);

  const { get } = useCrudService<ICompany>(
    process.env.urlApiScheduler
  );

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      const response = await get<ICompany>(`/api/companies/${id}`);

      if ((response as any).data.operation.code === EResponseCodes.OK) {
        setCompany((response as any).data.data);
      } else {
        handleError("Error al cargar los detalles de la empresa");
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
    company,
    loading,
    redirectToEdit,
    redirectToList,
  };
};

export default useDetailsCompanyHook;