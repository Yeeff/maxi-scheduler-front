import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  IPosition,
  IPositionFilter,
  ICompany,
} from "../../../common/interfaces/position.interfaces";
import {
  ITableAction,
  ITableElement,
} from "../../../common/interfaces/table.interfaces";

import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../common/contexts/app.context";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { IPagingData } from "../../../common/utils/api-response";

export default function useSearchPositionHook() {
  // Context
  const { validateActionAccess, setMessage } = useContext(AppContext);

  // Custom hooks
  const { get, deleted } = useCrudService<IPosition>(process.env.urlApiScheduler);

  //states
  const [showTable, setshowTable] = useState(false);
  const [tableData, setTableData] = useState<IPagingData<IPosition>>({
    array: [],
    meta: { total: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);

  //ref
  const tableComponentRef = useRef(null);

  //react-router-dom
  const navigate = useNavigate();

  //react-hook-form
  const { formState, control, handleSubmit, reset, watch, register } =
    useForm<IPositionFilter>({
      defaultValues: { name: "", companyId: undefined },
      mode: "all",
    });

  const formValues = watch();

  // Load companies on component mount
  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await get<ICompany[]>("/api/companies");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const companiesData = (response as any).data?.data || (response as any).data || [];
        setCompanies(Array.isArray(companiesData) ? companiesData : []);
      }
    } catch (error) {
      console.error("Error loading companies:", error);
    } finally {
      setLoadingCompanies(false);
    }
  };

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

  const loadPositions = async (filter?: IPositionFilter) => {
    try {
      setLoading(true);
      console.log("Loading positions with filter:", filter);

      const response = await get<IPosition[]>("/api/positions");

      // The crud-service hook now properly handles ApiResponse format
      // and returns data directly in the ApiResponse.data field
      let positions: IPosition[] = [];
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Handle different response formats
        const responseData = (response as any).data?.data || (response as any).data || [];
        positions = Array.isArray(responseData) ? responseData : [];
        console.log("Data loaded successfully:", positions);
      } else {
        console.error("API returned error:", response.operation.message);
        setMessage({
          title: "Error",
          description: response.operation.message || "Error al cargar los cargos",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        return;
      }

      // Apply client-side filtering if filter is provided
      let filteredPositions = positions;
      if (filter?.name) {
        filteredPositions = positions.filter(position =>
          position.name?.toLowerCase().includes(filter.name.toLowerCase())
        );
      }
      if (filter?.companyId) {
        filteredPositions = filteredPositions.filter(position =>
          position.company.id === filter.companyId
        );
      }

      setTableData({
        array: filteredPositions,
        meta: { total: filteredPositions.length }
      });
      setshowTable(true);

    } catch (error) {
      console.error("Error loading positions:", error);
      setMessage({
        title: "Error",
        description: "Error al cargar los cargos",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit((data: IPositionFilter) => {
    loadPositions(data);
  });

  //variables
  const tableColumns: ITableElement<IPosition>[] = [
    {
      fieldName: "name",
      header: "Nombre",
      renderCell: (row) => {
        return <>{row.name}</>;
      },
    },
    {
      fieldName: "location",
      header: "Ubicación",
      renderCell: (row) => {
        return <>{row.location || "-"}</>;
      },
    },
    {
      fieldName: "company",
      header: "Empresa",
      renderCell: (row) => {
        return <>{row.company.name}</>;
      },
    },
    {
      fieldName: "scheduleTemplate",
      header: "Plantilla de horario",
      renderCell: (row) => {
        return <>{row.scheduleTemplate.name}</>;
      },
    },
  ];

  const handleDeletePosition = (position: IPosition) => {
    setMessage({
      title: "Eliminar Cargo",
      description: `¿Estás seguro de que deseas eliminar el cargo "${position.name}"? Esta acción no se puede deshacer.`,
      show: true,
      OkTitle: "Eliminar",
      onOk: () => {
        performDelete(position);
        setMessage((prev) => ({ ...prev, show: false }));
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  };

  const performDelete = async (position: IPosition) => {
    try {
      console.log("Deleting position:", position.id);
      console.log("API URL:", process.env.urlApiScheduler);
      const response = await deleted(`/api/positions/${position.id}`);
      console.log("Delete API Response:", response);

      // Handle DELETE responses - they may return 204 No Content (empty response)
      // or ApiResponse format. If no error operation is present, assume success.
      if (!response || !(response as any).data || !(response as any).data.operation || (response as any).data.operation.code === EResponseCodes.OK) {
        console.log("Position deleted successfully");
      } else {
        console.log("Delete failed:", (response as any).data.operation);
        const errorMsg = (response as any).data.operation.message || 'Error al eliminar el cargo';
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
        title: "Cargo Eliminado",
        description: `El cargo "${position.name}" ha sido eliminado exitosamente.`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          // Reload the current filter to refresh the table
          const currentFilter = watch();
          loadPositions(currentFilter.name || currentFilter.companyId ? currentFilter : undefined);
          setMessage((prev) => ({ ...prev, show: false }));
        },
        background: true,
      });

    } catch (error) {
      console.error("Error deleting position:", error);
      setMessage({
        title: "Error",
        description: "Error al eliminar el cargo",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const tableActions: ITableAction<IPosition>[] = [
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
        handleDeletePosition(row);
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
    companies,
    loadingCompanies,
  };
}