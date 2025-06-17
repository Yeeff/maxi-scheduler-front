import React from "react";

import usePublicReport from "../hooks/public-report.hook";
import { PublicReportForm } from "../forms/publicrRport.form";

interface IPropsReportPage {}

const ReportPublicPage = ({}: IPropsReportPage): React.JSX.Element => {
const {
    control,
    formState,
    periodsListBiweeklyAuthorized,
    handleSubmitOtherIncome,
    clearFields,
  } = usePublicReport({});

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black biggest bold">Reportes</label>
        </div>

        <PublicReportForm
          control={control}
          formState={formState}
          clearFields={clearFields}
          periodsListBiweeklyAuthorized={periodsListBiweeklyAuthorized}
          handleSubmitOtherIncome={handleSubmitOtherIncome}
        />
      </div>
    </div>
  );
};

export default ReportPublicPage;