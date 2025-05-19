import {
  ButtonComponent,
  FormComponent,
  InputComponent,
  SelectComponent,
} from "../../../common/components/Form";
import { Controller, useForm } from "react-hook-form";
import { DatePickerComponent } from "../../../common/components/Form/input-date.component";
import { TextAreaComponent } from "../../../common/components/Form/input-text-area.component";
import {
  addBusinessDays,
  calculateBusinessDays,
} from "../../../common/utils/helpers";
import { ResponsiveTable } from "../../../common/components/Form/table-detail.component";
import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { AppContext } from "../../../common/contexts/app.context";
import {
  useCitizenAttentionService,
  IDaysParametrization,
} from "../../../common/hooks/citizen-attention-service.hook";
import useYupValidationResolver from "../../../common/hooks/form-validator.hook";
import useVacationService from "../../../common/hooks/vacation-service.hook";
import {
  IVacation,
  IWorkersVacation,
} from "../../../common/interfaces/payroll.interfaces";
import { searchRecord } from "../../../common/schemas";
import { ApiResponse } from "../../../common/utils/api-response";
import useListData from "../hooks/list.hook";

const createVacationPage = () => {
  // Servicios
  const navigate = useNavigate();
  const resolver = useYupValidationResolver(searchRecord);
  const { setMessage } = useContext(AppContext);
  const { activeWorkerList, listPeriods } = useListData(false);
  const { getWorkerVacatioByParam, createVacation } = useVacationService();
  const { getDayParametrization } = useCitizenAttentionService();
  const form = useForm<IWorkersVacation>({ resolver });

  // States
  const [pendingDays, setPendingDays] = useState<string>("0");
  const [holidays, setHolidays] = useState([]);
  const [vacation, setVacation] = useState<IVacation>(null);


  // Constantes
  const [checkEnjoyedDays, checkCompensatoryDays] = form.watch([
    "checkEnjoyedDays",
    "checkCompensatoryDays",
  ]);
  const [startVacation, endVacation, compensatoryDays, totalDaysEnjoyed] =
    form.watch([
      "startDate",
      "endDate",
      "totalCompensatoryDays",
      "totalDaysEnjoyed",
    ]);
  const vacationData = [
    { title: "Saldo anterior", value: `${vacation?.periodFormer ?? 0}` },
    { title: "Días ganados", value: `${vacation?.days ?? 0}` },
    {
      title: "Saldo actual",
      value: `${vacation?.available ?? 0}`,
    },
  ];



  // Effects

  useEffect(() => {
    getDayParametrization()
    .then((res) => {
      const hdays = res.data.flatMap(
        (item) =>
          item.daysParametrizationDetails?.map(
            (detail) => detail.detailDate
          ) || []
      );
      setHolidays(hdays);
    })
  }, []);

  useEffect(() => {
    if (!checkEnjoyedDays) {
      form.setValue("startDate", "");
      form.setValue("endDate", "");
      form.setValue("totalDaysEnjoyed", 0);
    }

    if (!checkCompensatoryDays) {
      form.setValue("startDateCompensatedDays", "");
      form.setValue("totalCompensatoryDays", 0);
      form.setValue("pendingDays", 0);
    }
  }, [checkEnjoyedDays, checkCompensatoryDays]);

  useEffect(() => {
    let daysFormated = 0;

    if (startVacation && endVacation) {
      const days = calculateBusinessDays(startVacation, endVacation, holidays);
      daysFormated = days === 0 ? 1 : days;
    }

    form.setValue("totalDaysEnjoyed", Number(`${daysFormated}`));
    if (compensatoryDays > vacation?.available - totalDaysEnjoyed) {
      form.setValue("totalCompensatoryDays", 0);
    }
  }, [endVacation]);

  useEffect(() => {
    form.setValue("endDate", "");
  }, [startVacation]);

  useEffect(() => {
    const totalDaysEnjoyedValue = totalDaysEnjoyed ?? 0;
    const compensatoryDaysValue = compensatoryDays ?? 0;
    const availableDays = vacation?.available
      ? Number(vacation?.available) +
        Number(vacation?.periodFormer ?? 0) +
        Number(vacation?.refund ?? 0)
      : 0;
    if (compensatoryDays > availableDays - totalDaysEnjoyed) {
      form.setValue("totalCompensatoryDays", 0);
    }
    setPendingDays(
      `${
        Number(availableDays) -
        (Number(compensatoryDaysValue) + Number(totalDaysEnjoyedValue))
      }`
    );
  }, [compensatoryDays]);

  // Metodos

  const onSubmit = form.handleSubmit(async (data: IWorkersVacation) => {
    const params = {
      workerId: data.idWorker,
      period: parseInt(data.period),
    };
    form.setValue("startDateCompensatedDays", "");
    form.setValue("startDate", "");
    form.setValue("endDate", "");
    form.setValue("totalCompensatoryDays", 0);
    form.setValue("totalCompensatoryDays", 0);
    await getWorkerVacatioByParam(params)
      .then((response: ApiResponse<IVacation>) => {
        if (
          response &&
          response?.operation?.code === EResponseCodes.OK &&
          response?.data
        ) {
          setVacation(response.data);
        } else {
          setMessage({
            type: EResponseCodes.FAIL,
            title: "Crear periodo de vacaciones.",
            description: "No hay resultado para la búsqueda",
            show: true,
            OkTitle: "Aceptar",
            background: true,
          });
          setVacation({} as IVacation);
        }
      })
      .catch((err) => {
        setMessage({
          type: EResponseCodes.FAIL,
          title: "Crear período de vacaciones.",
          description:
            "Se ha presentado un error, por favor vuelve a intentarlo.",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
      });
  });

  const handleModal = () => {
    setMessage({
      title: "Cancelar periodo de vacaciones",
      description: `¿Segur@ que deseas cancelar el periodo de vacaciones?`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        navigate("../consultar");
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      cancelTitle: "Cancelar",
      onCancel: () => {
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      background: true,
    });
  };

  const calculateVacationDays = (data) => {
    const dataVacationDays = [];

    if (data.checkEnjoyedDays) {
      dataVacationDays.push({
        codVacation: vacation.id,
        dateFrom: data.startDate,
        dateUntil: data.endDate,
        enjoyedDays: data.totalDaysEnjoyed,
        paid: false,
        observation: data.observation,
      });
    }

    if (data.checkCompensatoryDays) {
      dataVacationDays.push({
        codVacation: vacation.id,
        dateFrom: data.startDate,
        enjoyedDays: data.totalCompensatoryDays,
        paid: true,
        observation: data.checkEnjoyedDays ? "" : data.observation,
      });
    }

    return dataVacationDays;
  };

  const showMessage = (response) => {
    if (response && response?.operation?.code === EResponseCodes.OK) {
      setMessage({
        type: EResponseCodes.OK,
        title: "Vacaciones.",
        description: "periodo de vacaciones creado satisfactoriamente.",
        show: true,
        OkTitle: "Aceptar",
        onClose() {
          navigate("../consultar");
          setMessage((prev) => {
            return { ...prev, show: false };
          });
        },
        onOk() {
          navigate("../consultar");
          setMessage((prev) => {
            return { ...prev, show: false };
          });
        },
        background: true,
      });
    } else {
      setMessage({
        type: EResponseCodes.FAIL,
        title: "Error al crear periodo.",
        description:
          "Se ha presentado un error, por favor vuelve a intentarlo.",
        show: true,
        OkTitle: "Aceptar",
        background: true,
      });
    }
  };

  const handleCreateVacation = async (dataVacation) => {
    try {
      const response = await createVacation(dataVacation);
      showMessage(response);
    } catch (err) {
      showMessage({}); // Handle error here
    }
  };

  const onCreate = form.handleSubmit(async (data: IWorkersVacation) => {
    const totalDaysEnjoyed = Number(data?.totalDaysEnjoyed) || 0;
    const totalCompensatoryDays = Number(data?.totalCompensatoryDays) || 0;
    const totalEnjoyedDays = totalDaysEnjoyed + totalCompensatoryDays;
    let enjoyedDays = totalEnjoyedDays;
    let avaibleDays = Number(vacation?.available) || 0;
    let formedDays = Number(vacation?.periodFormer) || 0;
    let refundDays = Number(vacation?.refund) || 0;
    let days = Number(vacation?.days) || 0;

    // Restar los días de formedDays primero
    if (enjoyedDays >= formedDays) {
      enjoyedDays -= formedDays;
      formedDays = 0;
    } else {
      formedDays -= enjoyedDays;
      enjoyedDays = 0;
    }

    // Restar los días de refundDays si es necesario
    if (enjoyedDays >= refundDays) {
      enjoyedDays -= refundDays;
      refundDays = 0;
    } else {
      refundDays -= enjoyedDays;
      enjoyedDays = 0;
    }

    // Restar los días restantes de la categoría 'remainingDays'
    if (enjoyedDays >= days) {
      enjoyedDays -= days;
      days = 0;
    } else {
      days -= enjoyedDays;
      enjoyedDays = 0;
    }

    // La suma de los días disponibles es la suma que queda de todas las categorías
    avaibleDays = formedDays + refundDays + days;

    const dataVacation = {
      vacationDay: calculateVacationDays(data),
      enjoyedDays: totalEnjoyedDays,
      avaibleDays,
      refundDays,
      formedDays,
      days,
      periodId: vacation?.id,
    };

    setMessage({
      title: "Crear periodo de vacaciones",
      description: "¿Estás segur@ de crear el periodo de vacaciones?",
      show: true,
      OkTitle: "Aceptar",
      onOk() {
        handleCreateVacation(dataVacation);
      },
      background: true,
      cancelTitle: "cancelar",
    });
  });

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black biggest bold">
            Crear periodo de vacaciones
          </label>
        </div>
        <div className="container-sections-forms ">
          <div>
            <FormComponent
              id="searchWorkerForm"
              className="form-signIn"
              action={onSubmit}
            >
              <div className="grid-form-2-container gap-25">
                <SelectComponent
                  idInput={"idWorker"}
                  control={form.control}
                  errors={form.formState.errors}
                  data={activeWorkerList}
                  label={"Empleado"}
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione"
                  filter={true}
                />

                <SelectComponent
                  idInput={"period"}
                  control={form.control}
                  errors={form.formState.errors}
                  data={listPeriods}
                  label={"Periodo"}
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione"
                />
              </div>
              <div className="button-save-container-display">
                <ButtonComponent
                  value={"Buscar"}
                  className="button-save big disabled-black"
                />
              </div>
            </FormComponent>
          </div>

          <div className="container-table-result-responsive">
            <ResponsiveTable data={vacationData} />
          </div>
        </div>
        <FormComponent
          id="createVacationForm"
          className="form-signIn"
          action={onCreate}
        >
          <div className=" grid-form-3-container gap-25 container-sections-forms">
            <div className="grid-span-3-columns">
              <input
                {...form.register("checkEnjoyedDays")}
                type="checkbox"
                className="checkbox-basic"
                disabled={!vacation?.available}
              />{" "}
              <span className="text-black large bold">Dias disfrutados</span>
            </div>
            <DatePickerComponent
              idInput={"startDate"}
              control={form.control}
              label={"Desde"}
              errors={form.formState.errors}
              classNameLabel="text-black big break-line bold"
              className="dataPicker-basic  medium "
              disabled={!checkEnjoyedDays}
              disabledDates={holidays.map((i) => new Date(i + " 00:00:00"))}
              placeholder="DD/MM/YYYY"
              dateFormat="dd/mm/yy"
              disabledDays={[0, 6]}
            />
            <DatePickerComponent
              idInput={"endDate"}
              control={form.control}
              label={"Hasta"}
              errors={form.formState.errors}
              classNameLabel="text-black big break-line bold"
              className="dataPicker-basic  medium "
              disabled={!startVacation}
              placeholder="DD/MM/YYYY"
              dateFormat="dd/mm/yy"
              disabledDays={[0, 6]}
              disabledDates={holidays.map((i) => new Date(i + " 00:00:00"))}
              minDate={new Date(startVacation)}
              maxDate={addBusinessDays(
                startVacation || new Date(),
                Number(vacation?.available || 0) +
                  Number(vacation?.periodFormer || 0) +
                  (vacation?.refund || 0),
                holidays
              )}
            />
            <Controller
              control={form.control}
              name={"totalDaysEnjoyed"}
              defaultValue={0}
              render={({ field }) => {
                return (
                  <InputComponent
                    id={field.name}
                    idInput={field.name}
                    value={`${field.value}`}
                    className="input-basic medium"
                    typeInput="text"
                    classNameLabel="text-black big bold"
                    label="Total días"
                    register={form.register}
                    disabled={true}
                  />
                );
              }}
            />
          </div>

          <div className="grid-form-3-container gap-25 container-sections-forms">
            <div className="grid-span-3-columns">
              <input
                {...form.register("checkCompensatoryDays")}
                type="checkbox"
                className="checkbox-basic"
                disabled={!vacation?.available}
              />
              <span className="text-black large bold">Dias compensados</span>
            </div>
            <DatePickerComponent
              idInput={"startDateCompensatedDays"}
              control={form.control}
              label={"Días compensatorios"}
              errors={form.formState.errors}
              classNameLabel="text-black big break-line bold"
              className="dataPicker-basic  medium "
              disabled={!checkCompensatoryDays}
              placeholder="DD/MM/YYYY"
              dateFormat="dd/mm/yy"
              disabledDays={[0, 6]}
            />

            <Controller
              control={form.control}
              name={"totalCompensatoryDays"}
              defaultValue={0}
              render={({ field }) => {
                return (
                  <InputComponent
                    id={field.name}
                    idInput={field.name}
                    value={`${field.value}`}
                    className="input-basic medium"
                    typeInput="number"
                    classNameLabel="text-black big bold"
                    label="Total días compensatorios"
                    register={form.register}
                    onChange={field.onChange}
                    disabled={!checkCompensatoryDays}
                    errors={form.formState.errors}
                  />
                );
              }}
            />
            <InputComponent
              idInput={"pendingDays"}
              className="input-basic medium"
              typeInput="text"
              classNameLabel="text-black big bold"
              label="Días pendientes"
              disabled={true}
              errors={form.formState.errors}
              value={`${pendingDays}`}
            />
          </div>
          <div>
            <Controller
              control={form.control}
              name={"observation"}
              defaultValue={""}
              render={({ field }) => {
                return (
                  <TextAreaComponent
                    idInput={field.name}
                    className="text-area-basic"
                    classNameLabel="text-black big bold"
                    label="Observaciones"
                    register={form.register}
                    value={`${field.value}`}
                    onChange={field.onChange}
                    disabled={!checkCompensatoryDays && !checkEnjoyedDays}
                    errors={form.formState.errors}
                    rows={5}
                  />
                );
              }}
            />
          </div>
        </FormComponent>
      </div>
      <div className="button-save-container-display mr-24px ">
        <ButtonComponent
          value={"Cancelar"}
          type="button"
          className="button-clean bold"
          action={handleModal}
        />
        <ButtonComponent
          value={"Guardar"}
          disabled={!checkCompensatoryDays && !checkEnjoyedDays}
          type="submit"
          form="createVacationForm"
          className="button-save big disabled-black"
        />
      </div>
    </div>
  );
};

export default createVacationPage;
