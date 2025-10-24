import React from "react";
import useSearchCompanyHook from "../hooks/searchCompany.hook";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ICompany } from "../../../common/interfaces/company.interfaces";
import { FiEdit, FiEye, FiTrash2 } from "react-icons/fi";

import { FilterCompanyForm } from "../forms/filter-company.form";

const SearchCompanyPage = (): React.JSX.Element => {
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
  } = useSearchCompanyHook();

  const renderActions = (row: ICompany) => {
    return (
      <div className="spc-table-action-button">
        {tableActions.map((action, index) => (
          <div
            key={index}
            style={{ display: action.hide ? "none" : "block" }}
            onClick={() => action.onClick(row)}
          >
            {action.icon === "Edit" && <FiEdit size={20} style={{ cursor: 'pointer', color: '#094a90' }} />}
            {action.icon === "Detail" && <FiEye size={20} style={{ cursor: 'pointer', color: '#094a90' }} />}
            {action.icon === "Delete" && <FiTrash2 size={20} style={{ cursor: 'pointer', color: '#dc3545' }} />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Empresas</label>
        </div>

        <FilterCompanyForm
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
      </div>
    </div>
  );
};

export default React.memo(SearchCompanyPage);