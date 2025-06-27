import React, { useContext } from "react";
import {
  Control,
  FieldErrors,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
import {
  SelectComponent,
  InputComponent,
  LabelComponent,
  SwitchComponent,
} from "../../../common/components/Form";
import { DatePickerComponent } from "../../../common/components/Form/input-date.component";
import { AppContext } from "../../../common/contexts/app.context";
import { TextAreaComponent } from "../../../common/components/Form/input-text-area.component";
import { IVinculation } from "../../../common/interfaces/payroll.interfaces";
import { calculateDifferenceYear } from "../../../common/utils/helpers";
import { InputNumberComponent } from "../../../common/components/Form/input-number.component";
import { EDirection } from "../../../common/constants/input.enum";

interface IContractualInformationProp {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  control: Control<any>;
  setValueRegister: UseFormSetValue<any>;
  list: any[][];
  action: string;
  // changedData: number;
  getValueRegister: UseFormGetValues<IVinculation>;
  watch?: UseFormWatch<IVinculation>;
}

const ContractualInformationForm = ({
  register,
  errors,
  control,
  list,
  action,
  watch,
}: IContractualInformationProp) => {
  const { setDisabledFields, disabledFields } = useContext(AppContext);

  setDisabledFields(action == "view" ? true : false);

  const [startDate, endDate] = watch([
    "employment.startDate",
    "employment.endDate",
  ]);

  return (
    <div>
      <div className="grid-form-4-container gap-25 container-sections-forms ">
        <span className="text-black large bold grid-span-4-columns">
          Información contractual
        </span>

        {/* <SelectComponent
          idInput={"employment.idTypeContract"}
          control={control}
          errors={errors}
          data={list[0]}
          label={
            <>
              Tipo de vinculación <span>*</span>
            </>
          }
          className="select-basic medium"
          classNameLabel="text-black big bold"
          placeholder="Seleccione."
          disabled={disabledFields}
        />
        <InputComponent
          idInput="employment.contractNumber"
          typeInput="text"
          label={
            <>
              Nro de contrato / resolución <span>*</span>
            </>
          }
          register={register}
          errors={errors}
          classNameLabel="text-black big bold"
          className="input-basic medium"
          disabled={disabledFields}
        />*/}

        <SelectComponent
          idInput={"employment.state"}
          control={control}
          errors={errors}
          data={list[2]}
          label={
            <>
              Estado <span>*</span>
            </>
          }
          className="select-basic medium"
          classNameLabel="text-black big bold"
          placeholder="Seleccione."
          disabled={disabledFields}
        />
        {/*<SelectComponent
          idInput={"employment.codDependence"}
          control={control}
          errors={errors}
          data={list[3]}
          label={
            <>
              Dependencia <span>*</span>
            </>
          }
          className="select-basic medium"
          classNameLabel="text-black big bold"
          placeholder="Seleccione."
          disabled={disabledFields}
        />

        <SwitchComponent
          idInput="employment.isResponsibleForDependency"
          control={control}
          errors={errors}
          direction={EDirection.row}
          children={
            <LabelComponent
              value="Es reponsable de la Dependencia"
              className="text-black big bold"
              htmlFor="isResponsibleForDependency"
            />
          }
        />

        <SelectComponent
          idInput={"employment.idCharge"}
          control={control}
          errors={errors}
          data={list[1]}
          label={
            <>
              Cargo <span>*</span>
            </>
          }
          className="select-basic medium"
          classNameLabel="text-black big bold"
          placeholder="Seleccione."
          disabled={disabledFields}
        /> */}

        <DatePickerComponent
          idInput={"employment.startDate"}
          control={control}
          label={
            <>
              Fecha inicio <span>*</span>
            </>
          }
          errors={errors}
          classNameLabel="text-black big bold"
          className="dataPicker-basic  medium "
          disabled={disabledFields}
          placeholder="DD/MM/YYYY"
          dateFormat="dd/mm/yy"
        />

        <DatePickerComponent
          idInput={"employment.endDate"}
          control={control}
          label={
            <>
              Fecha de terminación{" "}
              {String(watch("employment.idTypeContract")) === "4" ? (
                <span>*</span>
              ) : (
                ""
              )}
            </>
          }
          errors={errors}
          classNameLabel="text-black big bold"
          className="dataPicker-basic  medium "
          //disabled={
          //  String(watch("employment.idTypeContract")) === "4"
          //    ? disabledFields
          //    : true
          //}
          placeholder="DD/MM/YYYY"
          dateFormat="dd/mm/yy"
          minDate={new Date(startDate)}
        />
        {action !== "new" ? (
          <InputComponent
            idInput="antiquity"
            typeInput="text"
            label="Antiguedad"
            errors={errors}
            value={`${startDate && endDate
              ? calculateDifferenceYear(startDate, endDate)
              : "0"
              }
  `}
            classNameLabel="text-black big bold"
            className="input-basic medium"
            disabled={true}
          />
        ) : (
          <></>
        )}

        {/* <InputComponent
          idInput="employment.institutionalMail"
          typeInput="email"
          label={
            <>
              Correo institucional <span>*</span>
            </>
          }
          register={register}
          errors={errors}
          classNameLabel="text-black big bold"
          className="input-basic medium"
          disabled={disabledFields}
        />
 

        
        <InputNumberComponent
          idInput="employment.salary"
          control={control}
          label={<>Valor mensual</>}
          errors={errors}
          classNameLabel="text-black big bold"
          className="inputNumber-basic medium"
          disabled={false}
          mode="currency"
          currency="COP"
          locale="es-CO"
          minFractionDigits={2}
          maxFractionDigits={2}
        />*/}

        {/*{String(watch("employment.idTypeContract")) === "4" && (*/}
        <InputNumberComponent
          idInput="employment.totalValue"
          control={control}
          //label={<>Valor total</>}
          label={<>Salario</>}
          errors={errors}
          classNameLabel="text-black big bold"
          className="inputNumber-basic medium"
          disabled={false}
          mode="currency"
          currency="COP"
          locale="es-CO"
          minFractionDigits={2}
          maxFractionDigits={2}
        />
        {/* )}  */}


        <InputNumberComponent
          idInput="employment.workStationBonusValue"
          control={control}
          //label={<>Valor total</>}
          label={<>Valor Bonificacion Puesto de trabajo</>}
          errors={errors}
          classNameLabel="text-black big bold"
          className="inputNumber-basic medium"
          disabled={false}
          mode="currency"
          currency="COP"
          locale="es-CO"
          minFractionDigits={2}
          maxFractionDigits={2}
        />
        {/*<TextAreaComponent
            label={"Obligaciones especificas"}
            idInput={"employment.specificObligations"}
            disabled={disabledFields}
            className="text-area-basic"
            classNameLabel="text-black big bold"
            register={register}
            errors={errors}
            rows={5}
          />
          
          <div className="text-right">
            <span className="text-span ">Max. {10000} carácteres</span>
          </div>
          <InputEditorComponent
            control={control}
            label={"Obligaciones especificas"}
            idInput={"employment.specificObligations"}
            readOnly={disabledFields}
            className="inputEditor-basic height-150"
            classNameLabel="text-black big bold"
          /> */}

        {/** {String(watch("employment.idTypeContract")) === "4" && (
          <div className="grid-span-4-columns">
            <TextAreaComponent
              label={"Objeto contractual"}
              idInput={"employment.contractualObject"}
              disabled={disabledFields}
              className="text-area-basic"
              classNameLabel="text-black big bold"
              register={register}
              errors={errors}
              rows={5}
            />
            <div className="text-right">
              <span className="text-span ">Max. {5000} carácteres</span>
            </div>
          </div>
        )}  */}

      </div>
      {/* {action !== "new" ? (
        <div className="container-sections-forms">
          <TableComponent
            url={`${process.env.urlApiPayroll}/api/v1/vinculation/employment/get-paginated`}
            ref={tableComponentRef}
            columns={tableColumns}
            actions={tableActions}
            isShowModal={false}
          />
        </div>
      ) : (
        <></>
      )} */}
    </div>
  );
};

export default React.memo(ContractualInformationForm);
