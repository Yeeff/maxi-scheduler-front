import React, { BaseSyntheticEvent } from "react";
import { Control, FormState } from "react-hook-form";
import {
  ButtonComponent,
  FormComponent,
  SelectComponent,
  InputNumberComponent
} from "../../../common/components/Form";

interface IPropsCreateUpdateDeductionsForm {
  control: Control<any, any>;
  formState: FormState<any>;
  periodsListBiweeklyAuthorized: any[];
  handleSubmitOtherIncome: (
    e?: BaseSyntheticEvent<object, any, any>
  ) => Promise<void>;
  clearFields: () => void;
}

export const PublicReportForm = ({
  control,
  formState,
  periodsListBiweeklyAuthorized,
  handleSubmitOtherIncome,
  clearFields,
}: IPropsCreateUpdateDeductionsForm): React.JSX.Element => {
  const { errors, isValid } = formState;

  return (
    <FormComponent className="form-signIn" action={handleSubmitOtherIncome}>
      <div className="container-sections-forms">
        <div className="grid gap-25">
          <div className="grid-form-2-container gap-25">

            <SelectComponent
              idInput={"period"}
              control={control}
              errors={errors}
              data={periodsListBiweeklyAuthorized}
              label={
                <>
                  Periodo. <span>*</span>
                </>
              }
              className="select-basic medium"
              classNameLabel="text-black big bold"
              placeholder="Seleccione."
              filter={true}
              disabled={false}
            />

            <InputNumberComponent
              idInput={"employeeId"}
              control={control}
              errors={errors}
              label={<>Documento</>}
              className="select-basic medium"
              classNameLabel="text-black big bold"
              placeholder="Seleccione."
              disabled={false}
            />


          </div>
        </div>
      </div>
      <div className="button-save-container-display m-top-20">
        <ButtonComponent
          value={"Limpiar campos"}
          className="button-clean bold"
          type="button"
          action={clearFields}
        />
        <ButtonComponent
          value={`Generar`}
          className="button-save large disabled-black"
          disabled={!isValid}
        />
      </div>
    </FormComponent>
  );
};
