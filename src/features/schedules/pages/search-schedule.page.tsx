import React, { useState } from "react";
import useSearchScheduleHook from "../hooks/searchSchedule.hook";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";

import { FilterScheduleForm } from "../forms/filter-schedule.form";
import { ShiftTemplatesModal } from "../forms/shift-templates-modal.component";
import { ButtonComponent } from "../../../common/components/Form";

const SearchSchedulePage = (): React.JSX.Element => {
  const {
    control,
    formState,
    showTable,
    formValues,
    tableData,
    loading,
    tableColumns,
    tableActions,
    onSubmit,
    redirectCreate,
    clearFields,
    register
  } = useSearchScheduleHook();

  const [showShiftTemplatesModal, setShowShiftTemplatesModal] = useState(false);

  const renderActions = (row: IScheduleTemplate) => {
    return (
      <div className="spc-table-action-button">
        {tableActions.map((action, index) => (
          <div
            key={index}
            style={{ display: action.hide ? "none" : "block" }}
            onClick={() => action.onClick(row)}
          >
            {action.icon === "Edit" && <span>✏️</span>}
            {action.icon === "Detail" && <span>👁️</span>}
            {action.icon === "Delete" && <span>🗑️</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <div className="flex-between">
            <label className="text-black extra-large bold">Horarios</label>
            <ButtonComponent
              value="Administrar Plantillas de Turnos"
              className="button-secondary"
              type="button"
              action={() => setShowShiftTemplatesModal(true)}
            />
          </div>
        </div>

        <FilterScheduleForm
          {...{
            control,
            formState,
            formValues,
            onSubmit,
            redirectCreate,
            clearFields,
            register
          }}
        />

        {showTable && (
          <div className="container-sections-forms">
            <DataTable
              className="spc-table full-height"
              value={tableData.array}
              loading={loading}
              scrollable={true}
              emptyMessage="No hay resultados."
            >
              {tableColumns.map((col) => (
                <Column
                  key={col.fieldName}
                  field={col.fieldName}
                  header={col.header}
                  body={col.renderCell}
                  sortable={col.sorteable}
                />
              ))}

              {tableActions && tableActions.length > 0 && (
                <Column
                  className="spc-table-actions"
                  header={
                    <div>
                      <div className="spc-header-title">Acciones</div>
                    </div>
                  }
                  body={renderActions}
                />
              )}
            </DataTable>
          </div>
        )}

        <ShiftTemplatesModal
          visible={showShiftTemplatesModal}
          onHide={() => setShowShiftTemplatesModal(false)}
        />
      </div>
    </div>
  );
};

export default React.memo(SearchSchedulePage);