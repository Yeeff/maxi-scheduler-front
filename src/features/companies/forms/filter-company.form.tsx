import React from "react";
import {
  Control,
  Controller,
  FieldValues,
  FormState,
  UseFormRegister,
} from "react-hook-form";
import { AiOutlinePlusCircle } from "react-icons/ai";
import {
  FormComponent,
  ButtonComponent,
  InputComponent,
} from "../../../common/components/Form";
import { ICompanyFilter } from "../../../common/interfaces/company.interfaces";

interface IPropsFilterCompanyForm {
  control: Control<ICompanyFilter, any>;
  formState: FormState<FieldValues>;
  formValues: ICompanyFilter;
  redirectCreate: () => void;
  clearFields: () => void;
  onSubmit: () => Promise<void>;
  register: UseFormRegister<ICompanyFilter>;
}

export const FilterCompanyForm = ({
  control,
  formState,
  formValues,
  redirectCreate,
  clearFields,
  onSubmit,
  register,
}: IPropsFilterCompanyForm): React.JSX.Element => {
  const { errors } = formState;

  const { name, nit } = formValues;

  return (
    <div className="container-sections-forms">
      <div className="title-area">
        <label className="text-black extra-large bold">Consultar empresas</label>

        <div
          className="title-button text-main biggest pointer"
          onClick={redirectCreate}
        >
          Crear empresa <AiOutlinePlusCircle />
        </div>
      </div>

      <div>
        <FormComponent
          id="searchCompany"
          className="form-signIn"
          action={onSubmit}
        >
          <div className="grid-form-2-container gap-25">
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
                    label={<>Nombre de la empresa</>}
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
                    label={<>NIT</>}
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
              value={"Limpiar campos"}
              className="button-clean bold"
              type="button"
              action={clearFields}
            />
            <ButtonComponent
              value={"Buscar"}
              className="button-save disabled-black big"
            />
          </div>
        </FormComponent>
      </div>
    </div>
  );
};