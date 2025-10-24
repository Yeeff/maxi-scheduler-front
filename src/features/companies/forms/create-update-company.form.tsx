import React from "react";
import { Control, Controller, FormState } from "react-hook-form";
import {
  FormComponent,
  InputComponent,
  ButtonComponent,
} from "../../../common/components/Form";

import { ICompany } from "../../../common/interfaces/company.interfaces";

interface IPropsCreateUpdateCompanyForm {
  action: string;
  control: Control<ICompany, any>;
  formState: FormState<ICompany>;
  handleSubmitCompany: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>;
  redirectCancel: () => void;
  isLoading: boolean;
}

export const CreateUpdateCompanyForm = ({
  action,
  control,
  formState,
  handleSubmitCompany,
  redirectCancel,
  isLoading,
}: IPropsCreateUpdateCompanyForm): React.JSX.Element => {
  const { errors, isValid } = formState;

  if (isLoading) {
    return (
      <div className="container-sections-forms">
        <div className="text-center p-20">
          <p>Cargando datos de la empresa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sections-forms">
      <FormComponent
        id="createOrUpdateCompany"
        className="form-signIn company-form"
        action={handleSubmitCompany}
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
                      Nombre de la empresa <span>*</span>
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
            name={"nit"}
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
                      NIT <span>*</span>
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
            name={"email"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label="Correo electrónico"
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput="email"
                />
              );
            }}
          />

          <Controller
            control={control}
            name={"phone"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label="Teléfono"
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput="tel"
                />
              );
            }}
          />

          <Controller
            control={control}
            name={"address"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label="Dirección"
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput=""
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