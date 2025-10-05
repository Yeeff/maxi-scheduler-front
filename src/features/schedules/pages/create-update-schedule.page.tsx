import React from "react";
import { CreateUpdateScheduleForm } from "../forms/create-update-schedule.form";
import useCreateUpdateScheduleHook from "../hooks/createUpdateSchedule.hook";

interface IPropsCreateUpdateSchedulePage {
  action: string;
}

const CreateUpdateSchedulePage = ({
  action,
}: IPropsCreateUpdateSchedulePage): React.JSX.Element => {
  const {
    control,
    formState,
    handleSubmitSchedule,
    redirectCancel,
    renderTitle,
    setValue,
    watch,
    reset,
    isLoading,
  } = useCreateUpdateScheduleHook({ action });

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">
            {renderTitle()}
          </label>
        </div>

        <CreateUpdateScheduleForm
          {...{
            action,
            control,
            formState,
            handleSubmitSchedule,
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

export default React.memo(CreateUpdateSchedulePage);