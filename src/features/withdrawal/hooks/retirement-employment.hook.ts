import { useContext } from "react";
import { AppContext } from "../../../common/contexts/app.context";
import { useForm } from "react-hook-form";
import useYupValidationResolver from "../../../common/hooks/form-validator.hook";
import {
  IEmploymentWorker,
  IRetirementEmployment,
} from "../../../common/interfaces/payroll.interfaces";
import { retirementEmploymentSchema } from "../../../common/schemas";
import { EResponseCodes } from "../../../common/constants/api.enum";
import usePayrollService from "../../../common/hooks/payroll-service.hook";

export default function useRetirementEmployment(
  dataEmployment: IEmploymentWorker[],
  clearEmployment?: () => void
) {
  const { retirementEmployment } = usePayrollService();

  const { setMessage } = useContext(AppContext);

  const resolver = useYupValidationResolver(retirementEmploymentSchema);

  const {
    handleSubmit,
    formState: {
      errors: errorRetirementEmployment,
      isValid: isValidRetirement,
    },
    control: controlRetirement,
    register: registerRetirement,
  } = useForm<IRetirementEmployment>({
    defaultValues: {
      idReasonRetirement: "",
      observation: "",
      state: "0",
      retirementDate: "",
      idEmployment: null,
    },
    resolver,
    mode: "all",
    shouldUnregister: true,
  });

  const handleModalSuccess = () => {
    setMessage({
      title: "Retiro de personal",
      description: `El retiro se realizó exitosamente`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        clearEmployment();
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        clearEmployment();
        setMessage({});
      },
      background: true,
    });
  };

  const handleModalError = (message: string) => {
    setMessage({
      title: `Error al retirar el personal`,
      description: `${message}, vuelve a intentarlo`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        setMessage({});
      },
      background: true,
    });
  };

  const onSubmitRetiretmentEmployment = async (data: IRetirementEmployment) => {
    const dataRetirement: IRetirementEmployment = {
      ...data,
      idEmployment: dataEmployment[0].id,
      state: "0",
    };

    const response = await retirementEmployment(dataRetirement);

    if (response.operation.code === EResponseCodes.OK) {
      handleModalSuccess();
    } else {
      handleModalError(response.operation.message);
    }
  };

  const onSubmitRetirement = handleSubmit(
    async (data: IRetirementEmployment) => {
      setMessage({
        title: "Confirmación de retiro",
        description: `¿Estás segur@ de ejecutar esta acción?`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          onSubmitRetiretmentEmployment(data);
          setMessage((prev) => {
            return { ...prev, show: false };
          });
        },
        cancelTitle: "Cancelar",
        background: true,
      });
    }
  );

  return {
    onSubmitRetirement,
    registerRetirement,
    errorRetirementEmployment,
    isValidRetirement,
    controlRetirement,
  };
}
