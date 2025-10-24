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
  SelectComponent,
} from "../../../common/components/Form";
import { IPositionFilter, ICompany } from "../../../common/interfaces/position.interfaces";

interface IPropsFilterPositionForm {
  control: Control<IPositionFilter, any>;
  formState: FormState<FieldValues>;
  formValues: IPositionFilter;
  redirectCreate: () => void;
  clearFields: () => void;
  onSubmit: () => Promise<void>;
  register: UseFormRegister<IPositionFilter>;
  companies: ICompany[];
  loadingCompanies: boolean;
}

export const FilterPositionForm = ({
  control,
  formState,
  formValues,
  redirectCreate,
  clearFields,
  onSubmit,
  register,
  companies,
  loadingCompanies,
}: IPropsFilterPositionForm): React.JSX.Element => {
  const { errors } = formState;

  const { name, companyId } = formValues;

  return (
    <div className="container-sections-forms">
      <div className="title-area">
        <label className="text-black extra-large bold">Consultar cargos</label>

        <div
          className="title-button text-main biggest pointer"
          onClick={redirectCreate}
        >
          Crear cargo <AiOutlinePlusCircle />
        </div>
      </div>

      <div>
        <FormComponent
          id="searchPosition"
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
                    label={<>Nombre del cargo</>}
                    className="input-basic medium"
                    classNameLabel="text-black big bold"
                    typeInput=""
                  />
                );
              }}
            />

            <Controller
              control={control}
              name={"companyId"}
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
                    label={<>Empresa</>}
                    className="select-basic medium"
                    classNameLabel="text-black big bold"
                    placeholder="Seleccione una empresa"
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