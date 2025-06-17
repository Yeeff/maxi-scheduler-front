import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";

function ReportPublicRoutes() {
  const ReportPublicPage = lazy(() => import("./pages/report.publicPage"));

  return (
    <Routes>
      <Route
        path={"/consult"}
        element={<ReportPublicPage />}
      />
    </Routes>
  );
}

export default React.memo(ReportPublicRoutes);
