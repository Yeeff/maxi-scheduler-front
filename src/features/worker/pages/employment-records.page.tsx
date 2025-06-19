import React, { useState } from "react";
import TableComponent from "../../../common/components/table.component";
import { InputComponent } from "../../../common/components/Form/input.component";
import {
  ButtonComponent,
  FormComponent,
  SelectComponent,
} from "../../../common/components/Form";
import useRecordsData from "../hooks/records.hook";
import { Controller } from "react-hook-form";
import { RiFileExcel2Line } from "react-icons/ri";

const EmploymentRecordsPage = () => {
  const [tableView, setTableView] = useState<boolean>(false);
  const {
    onSubmit,
    register,
    errors,
    control,
    activeWorker,
    typesContracts,
    exportDataVinculation,
    reset,
    tableComponentRef,
    tableColumns,
    tableActions,
  } = useRecordsData();
  return (
    <div className="container-sections-forms m-24px">
      <div>
        <span className="text-black extra-large bold">
          Consultar Expediente
        </span>
      </div>
      <div>
        <FormComponent
          id="searchRecordForm"
          className="form-signIn"
          action={onSubmit}
        >
          <div className="container-sections-forms">
            <div className="grid-form-3-container gap-25">
              <Controller
                control={control}
                name={"documentNumber"}
                render={({ field }) => {
                  return (
                    <InputComponent
                      idInput={field.name}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      label={<>No. Documento</>}
                      typeInput={"text"}
                      register={register}
                      errors={errors}
                      className="input-basic medium"
                      classNameLabel="text-black big bold"
                    />
                  );
                }}
              />
              <SelectComponent
                idInput={"state"}
                control={control}
                errors={errors}
                data={activeWorker}
                label={<>Estado</>}
                className="select-basic medium"
                classNameLabel="text-black big bold"
                placeholder="Seleccione"
              />
              <SelectComponent
                idInput={"vinculationType"}
                control={control}
                errors={errors}
                data={typesContracts}
                label={<>Tipo de vinculación</>}
                className="select-basic medium"
                classNameLabel="text-black big bold"
                placeholder="Seleccione"
              />
            </div>
            <div className="grid-form-2-container gap-25">
              <Controller
                control={control}
                name={"name"}
                render={({ field }) => {
                  return (
                    <InputComponent
                      idInput={field.name}
                      label={<>Nombre</>}
                      typeInput={"text"}
                      register={register}
                      errors={errors}
                      className="input-basic medium"
                      classNameLabel="text-black big bold"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );
                }}
              />
              <Controller
                control={control}
                name={"lastName"}
                render={({ field }) => {
                  return (
                    <InputComponent
                      idInput={field.name}
                      label={<>Apellido</>}
                      typeInput={"text"}
                      register={register}
                      errors={errors}
                      className="input-basic medium"
                      classNameLabel="text-black big bold"
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  );
                }}
              />
            </div>
          </div>
          <div className="button-save-container-display">
            <ButtonComponent
              value={"Limpiar campos"}
              className="button-clean bold"
              type="button"
              action={() => {
                reset();
                tableComponentRef.current.emptyData();
                setTableView(false);
              }}
            />
            <ButtonComponent
              value={"Buscar"}
              className="button-save big"
              form="searchRecordForm"
              action={() => {
                setTableView(true);
              }}
              type="submit"
            />
          </div>
        </FormComponent>
      </div>
      {tableView && (
        <div className="container-sections-forms">
          <TableComponent
            ref={tableComponentRef}
            url={`${process.env.urlApiPayroll}/api/v1/vinculation/get-paginated-employment`}
            columns={tableColumns}
            actions={tableActions}
            isShowModal={false}
          />
        </div>
      )}
      {tableView && (
        <div className="button-save-container-display mr-8px mb-20px">
          <ButtonComponent
            value={
              <>
                <div className="p-container-buttonText">
                  <span>Descargar</span>
                  <RiFileExcel2Line color="#21A366" className="xlsxDownload" />
                </div>
              </>
            }
            className="p-button-download large "
            action={exportDataVinculation}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(EmploymentRecordsPage);