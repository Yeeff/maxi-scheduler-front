import React, { useState, useEffect } from "react";
import { Control, Controller, FormState } from "react-hook-form";
import {
  FormComponent,
  InputComponent,
  ButtonComponent,
  SelectComponent,
} from "../../../common/components/Form";

import { IPosition, ICompany } from "../../../common/interfaces/position.interfaces";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IPropsCreateUpdatePositionForm {
  action: string;
  control: Control<IPosition, any>;
  formState: FormState<IPosition>;
  handleSubmitPosition: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>;
  redirectCancel: () => void;
  isLoading: boolean;
}

export const CreateUpdatePositionForm = ({
  action,
  control,
  formState,
  handleSubmitPosition,
  redirectCancel,
  isLoading,
}: IPropsCreateUpdatePositionForm): React.JSX.Element => {
  const { errors, isValid } = formState;
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [scheduleTemplates, setScheduleTemplates] = useState<IScheduleTemplate[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const { get } = useCrudService(process.env.urlApiScheduler);

  // Load companies and schedule templates on component mount
  useEffect(() => {
    loadCompanies();
    loadScheduleTemplates();
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

  const loadScheduleTemplates = async () => {
    try {
      setLoadingSchedules(true);
      const response = await get<IScheduleTemplate[]>("/api/schedules");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const schedulesData = (response as any).data?.data || (response as any).data || [];
        setScheduleTemplates(Array.isArray(schedulesData) ? schedulesData : []);
      }
    } catch (error) {
      console.error("Error loading schedule templates:", error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container-sections-forms">
        <div className="text-center p-20">
          <p>Cargando datos del cargo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sections-forms">
      <FormComponent
        id="createOrUpdatePosition"
        className="form-signIn position-form"
        action={handleSubmitPosition}
      >
        <div className="grid-form-1-container gap-25">
          <Controller
            control={control}
            name={"name"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label={
                    <>
                      Nombre del cargo <span>*</span>
                    </>
                  }
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput=""
                />
              );
            }}
          />

          <Controller
            control={control}
            name={"location"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label="Ubicación"
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput=""
                />
              );
            }}
          />

          <Controller
            control={control}
            name={"company"}
            render={({ field }) => {
              return (
                <SelectComponent
                  idInput={field.name}
                  control={control}
                  errors={errors}
                  data={companies.map(company => ({
                    value: company.id.toString(),
                    name: company.name
                  }))}
                  label={
                    <>
                      Empresa <span>*</span>
                    </>
                  }
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione una empresa"
                  rules={{
                    setValueAs: (value: string) => {
                      if (!value || value === '') return undefined;
                      const selectedCompany = companies.find(c => c.id.toString() === value);
                      return selectedCompany ? { id: selectedCompany.id } : undefined;
                    }
                  }}
                />
              );
            }}
          />

          <Controller
            control={control}
            name={"scheduleTemplate"}
            render={({ field }) => {
              return (
                <SelectComponent
                  idInput={field.name}
                  control={control}
                  errors={errors}
                  data={scheduleTemplates.map(schedule => ({
                    value: schedule.id.toString(),
                    name: schedule.name
                  }))}
                  label={
                    <>
                      Plantilla de horario <span>*</span>
                    </>
                  }
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione una plantilla de horario"
                  rules={{
                    setValueAs: (value: string) => {
                      if (!value || value === '') return undefined;
                      const selectedSchedule = scheduleTemplates.find(s => s.id.toString() === value);
                      return selectedSchedule ? { id: selectedSchedule.id } : undefined;
                    }
                  }}
                />
              );
            }}
          />
        </div>

        <div className="button-save-container-display m-top-20">
          <ButtonComponent
            value={"Cancelar"}
            className="button-clean bold"
            type="button"
            action={redirectCancel}
          />
          <ButtonComponent
            value={`${action === "edit" ? "Editar" : "Guardar"}`}
            className="button-save large disabled-black"
            disabled={!isValid}
          />
        </div>
      </FormComponent>
    </div>
  );
};