import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../../common/contexts/app.context";
import { createOrUpdateTaxDeductible } from "../../../common/schemas";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { EStatesTaxDeduction } from "../../../common/constants/taxdeduction.enum";
import { useGenericListService } from "../../../common/hooks/generic-list-service.hook";
import useYupValidationResolver from "../../../common/hooks/form-validator.hook";
import useListData from "../../vacation/hooks/list.hook";
import { IDropdownProps } from "../../../common/interfaces/select.interface";
import { ITaxDeductible } from "../../../common/interfaces/payroll.interfaces";
import useTaxDeductionService from "../../../common/hooks/taxDeductions-service.hook";
import {
  ERentDeductions,
  ERentDeductionsId,
} from "../../../common/constants/deductions.enum";

interface IPropsUseCreateAndUpdateOtherIncome {
  action: string;
}

const useCreateAndUpdateIncomeDeduction = ({
  action,
}: IPropsUseCreateAndUpdateOtherIncome) => {
  //react router dom
  const navigate = useNavigate();

  const { id } = useParams();

  // hooks
  const { getListByGroupers } = useGenericListService();
  const { createTaxDeductible, updateTaxDeductible, getByIdTaxDeductible } =
    useTaxDeductionService();

  // Context
  const { setMessage } = useContext(AppContext);

  //useState
  const [typeTaxDeduction, setTypeTaxDeduction] = useState<IDropdownProps[]>(
    []
  );
  const [typeVinculation, setTypeVinculation] = useState<boolean>(false);
  const statesTaxDeductionList: IDropdownProps[] = [
    { name: "Pendiente", value: "Pendiente" },
    { name: "Finalizado", value: "Finalizado" },
    { name: "Anulado", value: "Anulado" },
  ];

  //custom hooks
  const { activeWorkerList, workerActives, workerActivesInfo, monthList } =
    useListData(false);

  //use form
  const resolver = useYupValidationResolver(createOrUpdateTaxDeductible);

  const { control, formState, handleSubmit, watch, getFieldState, setValue } =
    useForm<ITaxDeductible>({
      defaultValues: async () => loadDefaultValues(),
      mode: "all",
      resolver,
    });
  //watch
  const [state, valueIncome, employee, month] = watch([
    "state",
    "value",
    "codEmployment",
    "month",
  ]);

  //useEffect

  useEffect(() => {
    loadInitList();
  }, []);

  useEffect(() => {
    setValue("value", Math.round(valueIncome));
  }, [valueIncome]);

  useEffect(() => {
    if (action == "new") {
      const typeWorker = workerActivesInfo.find(
        (worker) => worker.id == employee
      )?.typesContracts[0]?.temporary;
      setTypeVinculation(typeWorker);
      let healthDeduction = null;
      let pensionDeduction = null;
      let arlDeduction = null;
      if (!typeWorker) {
        healthDeduction = typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D03
        );
        typeTaxDeduction.splice(healthDeduction, 1);
        pensionDeduction = typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D04
        );
        typeTaxDeduction.splice(pensionDeduction, 1);
        arlDeduction = typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D05
        );
        typeTaxDeduction.splice(arlDeduction, 1);
      } else if (
        typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D03
        ) == -1 &&
        typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D04
        ) == -1 &&
        typeTaxDeduction.findIndex(
          (tax) => tax.value == ERentDeductionsId.D05
        ) == -1
      ) {
        typeTaxDeduction.push({
          name: ERentDeductions.D03,
          value: ERentDeductionsId.D03,
        });
        typeTaxDeduction.push({
          name: ERentDeductions.D04,
          value: ERentDeductionsId.D04,
        });
        typeTaxDeduction.push({
          name: ERentDeductions.D05,
          value: ERentDeductionsId.D05,
        });
      }
    }
  }, [employee]);

  //functions
  const renderTitleDeduction = () => {
    return action === "edit"
      ? "Editar deducciones de renta"
      : "Crear deducciones de renta";
  };

  const validateStateField = (): boolean => {
    if (action === "new") {
      return true;
    }

    if (action === "edit") {
      const { isDirty } = getFieldState("state");

      if (!isDirty && state != EStatesTaxDeduction.Pendiente) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  };

  const loadInitList = async (): Promise<void> => {
    const groupers = ["TIPO_DEDUCCION_RENTA"];

    const { data, operation } = await getListByGroupers(groupers);

    if (EResponseCodes.OK === operation.code) {
      const optionsTypeTaxDeductions = data.map((item) => {
        return {
          name: item.itemDescription,
          value: item.itemCode,
        } as IDropdownProps;
      });

      setTypeTaxDeduction(optionsTypeTaxDeductions);
    } else {
      setTypeTaxDeduction([]);
    }
  };

  const loadDefaultValues = async (): Promise<ITaxDeductible> => {
    if (action === "new") {
      return {
        id: null,
        codEmployment: null,
        type: null,
        state: EStatesTaxDeduction.Pendiente,
        value: null,
        year: null,
      } as ITaxDeductible;
    }

    if (action === "edit") {
      const { data, operation } = await getByIdTaxDeductible(Number(id));

      if (operation.code === EResponseCodes.OK) {
        return {
          id: data.id,
          codEmployment: data.codEmployment,
          type: data.type,
          state: data.state,
          value: data.value,
          year: data.year,
          month: data.month ?? "",
        } as ITaxDeductible;
      } else {
        handleModalError("No se han cargado los datos");

        return {
          id: null,
          codEmployment: null,
          type: null,
          state: EStatesTaxDeduction.Pendiente,
          value: null,
          year: null,
          month: null,
        } as ITaxDeductible;
      }
    }
  };

  const redirectCancel = () => {
    setMessage({
      title: "Cancelar",
      description: `¿Estás segur@ que deseas 
      cancelar la deducción de renta?`,
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
    setMessage({
      title: ` ${action === "edit" ? "Editado" : "Guardado"}`,
      description: `Deducción de renta ${
        action === "edit" ? "editada" : "ejecutada"
      } exitosamente`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        navigate("../consultar");
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        navigate("../consultar");
        setMessage({});
      },
      background: true,
    });
  };

  const handleSubmitOtherIncome = handleSubmit((data: ITaxDeductible) => {
    setMessage({
      title: "Confirmación de deducción de renta",
      description: `¿Estás segur@ de ${
        action === "edit" ? "editar" : "ejecutar"
      }
      la deducción?`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        handleCreateOrUpdateOtherIncome(data);
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  });

  const handleCreateOrUpdateOtherIncome = async (data: ITaxDeductible) => {
    const res =
      action === "edit"
        ? await updateTaxDeductible(data)
        : await createTaxDeductible(data);

    if (res.operation.code === EResponseCodes.OK) {
      handleModalSuccess();
    } else {
      handleModalError(res.operation.message, false);
    }
  };

  return {
    control,
    formState,
    activeWorkerList,
    typeTaxDeduction,
    statesTaxDeductionList,
    monthList,
    renderTitleDeduction,
    redirectCancel,
    validateStateField,
    handleSubmitOtherIncome,
    workerActives,
    typeVinculation,
    month,
  };
};

export default useCreateAndUpdateIncomeDeduction;
