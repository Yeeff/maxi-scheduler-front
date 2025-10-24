import React from "react";
import { CreateUpdatePositionForm } from "../forms/create-update-position.form";
import useCreateUpdatePositionHook from "../hooks/createUpdatePosition.hook";

interface IPropsCreateUpdatePositionPage {
  action: string;
}

const CreateUpdatePositionPage = ({
  action,
}: IPropsCreateUpdatePositionPage): React.JSX.Element => {
  const {
    control,
    formState,
    handleSubmitPosition,
    redirectCancel,
    renderTitle,
    setValue,
    watch,
    reset,
    isLoading,
  } = useCreateUpdatePositionHook({ action });

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">
            {renderTitle()}
          </label>
        </div>

        <CreateUpdatePositionForm
          {...{
            action,
            control,
            formState,
            handleSubmitPosition,
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

export default React.memo(CreateUpdatePositionPage);