import { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";

import { AppContext } from "../../../common/contexts/app.context";

import {
  IPublicReport,
} from "../../../common/interfaces/payroll.interfaces";

import { EResponseCodes } from "../../../common/constants/api.enum";

import {
  generatePublicReporSchema,
} from "../../../common/schemas";

import useListData from "../../vacation/hooks/list.hook";
import useYupValidationResolver from "../../../common/hooks/form-validator.hook";
import useReportService from "../../../common/hooks/report-service..hook";
import { descargarArchivo } from "../../../common/utils/helpers";
import usePayrollService from "../../../common/hooks/payroll-service.hook";
import { ETypeReport } from "../../../common/constants/report.enum";

interface IPropsUseReport {}

const useReport = ({}: IPropsUseReport) => {
  //react router dom
  const navigate = useNavigate();
  // Context
  const { setMessage, validateActionAccess } = useContext(AppContext);

  //custom hooks
  const {
    periodsListBiweeklyAuthorized,
  } = useListData(false);

  //useState
  const { getEmploymentsByPayroll, getAllWorkers } = usePayrollService();

  //use form

  const resolver = useYupValidationResolver(generatePublicReporSchema);

  const { control, formState, handleSubmit, reset, watch, setValue } =
    useForm<IPublicReport>({
      defaultValues: {
        period: "",
        employeeId: "",
      },
      mode: "all",
      resolver,
    });

  const [typeReport, period] = watch([
    "period",
    "employeeId",
  ]);

  const { generatePublicReport } = useReportService();

  //functions

  const clearFields = () => {
    const radios = document.getElementsByName(
      "typeReport"
    ) as NodeListOf<HTMLInputElement>;

    radios.forEach((e) => (e.checked = false));

    reset();
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

  const handleSubmitOtherIncome = handleSubmit((data: IPublicReport) => {
    setMessage({
      title: "Confirmación de reporte",
      description: `¿Estás segur@ de ejecutar el reporte?`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        handleGenerateReport(data);
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      cancelTitle: "Cancelar",
      background: true,
    });
  });

  const handleGenerateReport = async (report: IPublicReport) => {

    console.log(report);

    const { data, operation } = await generatePublicReport(report);
    if (operation.code === EResponseCodes.OK) {
      descargarArchivo(data.bufferFile.data, data.nameFile);
    } else {
      handleModalError(
        "Error al generar el reporte, puede no tener historicos de planilla asociado",
        false
      );
    }
  };

  return {
    control,
    formState,
    periodsListBiweeklyAuthorized,
    handleSubmitOtherIncome,
    clearFields,
  };
};

export default useReport;
