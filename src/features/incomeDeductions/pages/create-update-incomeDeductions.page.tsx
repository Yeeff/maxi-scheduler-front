import React from "react";
import useCreateAndUpdateIncomeDeductions from "../hooks/createAndUpdateIncomeDeductions.hook";
import { Controller } from "react-hook-form";
import {
  FormComponent,
  InputComponent,
  SelectComponent,
  InputNumberComponent,
  ButtonComponent,
} from "../../../common/components/Form";

interface IPropsCreateUpdateOtherIncomePage {
  action: string;
}

const CreateUpdateIncomeDeductionsPage = ({
  action,
}: IPropsCreateUpdateOtherIncomePage): React.JSX.Element => {
  const {
    workerActives,
    activeWorkerList,
    typeTaxDeduction,
    statesTaxDeductionList,
    monthList,
    typeVinculation,
    month,
    formState,
    control,
    renderTitleDeduction,
    redirectCancel,
    handleSubmitOtherIncome,
    validateStateField,
  } = useCreateAndUpdateIncomeDeductions({ action });

  const { errors, isValid } = formState;

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black biggest bold">
            {renderTitleDeduction()}
          </label>
        </div>
        <FormComponent className="form-signIn" action={handleSubmitOtherIncome}>
          <div className="container-sections-forms">
            <div className="grid gap-25">
              <div className="grid-form-3-container gap-25">
                <Controller
                  control={control}
                  name={"year"}
                  render={({ field }) => {
                    return (
                      <InputComponent
                        idInput={field.name}
                        errors={errors}
                        typeInput={"text"}
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        className="input-basic medium"
                        classNameLabel="text-black big bold"
                        disabled={action === "edit"}
                        label={
                          <>
                            Año <span>*</span>
                          </>
                        }
                      />
                    );
                  }}
                />
                {(typeVinculation || (month != null && action == "edit")) && (
                  <SelectComponent
                    idInput={"month"}
                    control={control}
                    errors={errors}
                    data={monthList}
                    label={
                      <>
                        Mes <span>*</span>
                      </>
                    }
                    className="select-basic medium"
                    classNameLabel="text-black big bold"
                    placeholder="Seleccione."
                  />
                )}

                <SelectComponent
                  idInput={"codEmployment"}
                  control={control}
                  errors={errors}
                  data={workerActives}
                  label={
                    <>
                      Documento - Nombre del empleado. <span>*</span>
                    </>
                  }
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione."
                  filter={true}
                  disabled={action === "edit"}
                />

                <SelectComponent
                  idInput={"type"}
                  control={control}
                  errors={errors}
                  data={typeTaxDeduction}
                  label={
                    <>
                      Tipo de deducción renta<span>*</span>
                    </>
                  }
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione."
                  disabled={action === "edit"}
                />

                <InputNumberComponent
                  idInput="value"
                  control={control}
                  label={
                    <>
                      Valor total del certificado <span>*</span>
                    </>
                  }
                  errors={errors}
                  classNameLabel="text-black big bold"
                  className="inputNumber-basic medium"
                  mode="currency"
                  currency="COP"
                  locale="es-CO"
                  minFractionDigits={2}
                  maxFractionDigits={2}
                />

                <SelectComponent
                  idInput={"state"}
                  control={control}
                  errors={errors}
                  data={statesTaxDeductionList}
                  label={
                    <>
                      Estado <span>*</span>
                    </>
                  }
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione."
                  disabled={validateStateField()}
                />
              </div>
            </div>
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
    </div>
  );
};

export default React.memo(CreateUpdateIncomeDeductionsPage);
