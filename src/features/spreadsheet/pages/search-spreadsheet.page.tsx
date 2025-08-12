import React, {useState} from "react";
import useSearchSpreadSheetHook from "../hooks/searchSpreadSheet.hook";
import TableComponent from "../../../common/components/table.component";
import { Dialog } from "primereact/dialog";
import MassiveFileUploader from "../../../common/components/MassiveFileUploader";
import { FilterSpreadSheetForm } from "../forms/filter-spreadsheet.form";
import { ButtonComponent } from "../../../common/components/Form";

const SearchSpreadSheetPage = (): React.JSX.Element => {
  const {
    control,
    formState,
    showTable,
    formValues,
    tableComponentRef,
    typesSpreadSheetList,
    stateSpreadSheetList,
    tableColumns,
    tableActions,
    onSubmit,
    redirectCreate,
    clearFields,
  } = useSearchSpreadSheetHook();

  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Planillas</label>
        </div>

        <Dialog
          visible={true}
          style={{ width: "100%", maxWidth: "80vh" }}
          header="Anexar nomina calculada"
          onHide={() => console.log("On Close")}
          pt={{
            headerTitle: {
              className: "text-title-modal text--black text-center",
            },
            closeButtonIcon: {
              className: "color--primary close-button-modal",
            },
          }}
        >
           <div style={{ marginTop: 20 }}>
            <MassiveFileUploader
              files={files}
              setFiles={setFiles}
              handleUpload={() => {
                console.log(files);
              }}
              messageFileIndex={false}
              setHideModalIndex={() => { }}
              setMessageFileIndex={() => { }}
              removePrevFiles={() => { }}
              prevFiles={[]}
              useDescriptionField={false}
              descriptionFieldRequired={false}
              onChangeDescription={(e) => {}}
              defaultDescriptionValue={""}
            />
            <div
              className="mt-10 flex flex-center"
              style={{ marginBottom: 20 }}
            >
              <ButtonComponent
                value="Cancelar"
                type="button"
                action={() =>console.log( "setHideModalIndex false")}
                disabled={false}
              />
            </div>
          </div>

        </Dialog>

        <FilterSpreadSheetForm
          {...{
            control,
            formState,
            formValues,
            typesSpreadSheetList,
            stateSpreadSheetList,
            onSubmit,
            redirectCreate,
            clearFields,
          }}
        />

        {showTable && (
          <div className="container-sections-forms">
            <TableComponent
              ref={tableComponentRef}
              url={`${process.env.urlApiPayroll}/api/v1/payroll/get-paginated`}
              columns={tableColumns}
              actions={tableActions}
              isShowModal={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchSpreadSheetPage);
