import React from "react";
import { CreateUpdateCompanyForm } from "../forms/create-update-company.form";
import useCreateUpdateCompanyHook from "../hooks/createUpdateCompany.hook";

interface IPropsCreateUpdateCompanyPage {
  action: string;
}

const CreateUpdateCompanyPage = ({
  action,
}: IPropsCreateUpdateCompanyPage): React.JSX.Element => {
  const {
    control,
    formState,
    handleSubmitCompany,
    redirectCancel,
    renderTitle,
    setValue,
    watch,
    reset,
    isLoading,
  } = useCreateUpdateCompanyHook({ action });

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">
            {renderTitle()}
          </label>
        </div>

        <CreateUpdateCompanyForm
          {...{
            action,
            control,
            formState,
            handleSubmitCompany,
            redirectCancel,
            setValue,
            watch,
            reset,
            isLoading,
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(CreateUpdateCompanyPage);