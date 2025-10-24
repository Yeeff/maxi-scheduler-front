import { useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ICompany,
  ICompanyFilter,
} from "../../../common/interfaces/company.interfaces";
import {
  ITableAction,
  ITableElement,
} from "../../../common/interfaces/table.interfaces";

import { useNavigate } from "react-router-dom";
import { AppContext } from "../../../common/contexts/app.context";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { IPagingData } from "../../../common/utils/api-response";

export default function useSearchCompanyHook() {
  // Context
  const { validateActionAccess, setMessage } = useContext(AppContext);

  // Custom hooks
  const { get, deleted } = useCrudService<ICompany>(process.env.urlApiScheduler);

  //states
  const [showTable, setshowTable] = useState(false);
  const [tableData, setTableData] = useState<IPagingData<ICompany>>({
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
    useForm<ICompanyFilter>({
      defaultValues: { name: "", nit: "" },
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

  const loadCompanies = async (filter?: ICompanyFilter) => {
    try {
      setLoading(true);
      console.log("Loading companies with filter:", filter);

      const response = await get<ICompany[]>("/api/companies");

      // The crud-service hook now properly handles ApiResponse format
      // and returns data directly in the ApiResponse.data field
      let companies: ICompany[] = [];
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        // Handle different response formats
        const responseData = (response as any).data?.data || (response as any).data || [];
        companies = Array.isArray(responseData) ? responseData : [];
        console.log("Data loaded successfully:", companies);
      } else {
        console.error("API returned error:", response.operation.message);
        setMessage({
          title: "Error",
          description: response.operation.message || "Error al cargar las empresas",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        return;
      }

      // Apply client-side filtering if filter is provided
      let filteredCompanies = companies;
      if (filter?.name) {
        filteredCompanies = companies.filter(company =>
          company.name?.toLowerCase().includes(filter.name.toLowerCase())
        );
      }
      if (filter?.nit) {
        filteredCompanies = filteredCompanies.filter(company =>
          company.nit?.toLowerCase().includes(filter.nit.toLowerCase())
        );
      }

      setTableData({
        array: filteredCompanies,
        meta: { total: filteredCompanies.length }
      });
      setshowTable(true);

    } catch (error) {
      console.error("Error loading companies:", error);
      setMessage({
        title: "Error",
        description: "Error al cargar las empresas",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = handleSubmit((data: ICompanyFilter) => {
    loadCompanies(data);
  });

  //variables
  const tableColumns: ITableElement<ICompany>[] = [
    {
      fieldName: "name",
      header: "Nombre",
      renderCell: (row) => {
        return <>{row.name}</>;
      },
    },
    {
      fieldName: "nit",
      header: "NIT",
      renderCell: (row) => {
        return <>{row.nit}</>;
      },
    },
    {
      fieldName: "email",
      header: "Correo electrónico",
      renderCell: (row) => {
        return <>{row.email || "-"}</>;
      },
    },
    {
      fieldName: "phone",
      header: "Teléfono",
      renderCell: (row) => {
        return <>{row.phone || "-"}</>;
      },
    },
  ];

  const handleDeleteCompany = (company: ICompany) => {
    setMessage({
      title: "Eliminar Empresa",
      description: `¿Estás seguro de que deseas eliminar la empresa "${company.name}"? Esta acción no se puede deshacer.`,
      show: true,
      OkTitle: "Eliminar",
      onOk: () => {
        performDelete(company);
        setMessage((prev) => ({ ...prev, show: false }));
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  };

  const performDelete = async (company: ICompany) => {
    try {
      console.log("Deleting company:", company.id);
      console.log("API URL:", process.env.urlApiScheduler);
      const response = await deleted(`/api/companies/${company.id}`);
      console.log("Delete API Response:", response);

      // Handle DELETE responses - they may return 204 No Content (empty response)
      // or ApiResponse format. If no error operation is present, assume success.
      if (!response || !(response as any).data || !(response as any).data.operation || (response as any).data.operation.code === EResponseCodes.OK) {
        console.log("Company deleted successfully");
      } else {
        console.log("Delete failed:", (response as any).data.operation);
        const errorMsg = (response as any).data.operation.message || 'Error al eliminar la empresa';
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
        title: "Empresa Eliminada",
        description: `La empresa "${company.name}" ha sido eliminada exitosamente.`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          // Reload the current filter to refresh the table
          const currentFilter = watch();
          loadCompanies(currentFilter.name || currentFilter.nit ? currentFilter : undefined);
          setMessage((prev) => ({ ...prev, show: false }));
        },
        background: true,
      });

    } catch (error) {
      console.error("Error deleting company:", error);
      setMessage({
        title: "Error",
        description: "Error al eliminar la empresa",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const tableActions: ITableAction<ICompany>[] = [
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
        handleDeleteCompany(row);
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