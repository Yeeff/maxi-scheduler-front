import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function ScheduleRoutes() {
  const SearchSchedulePage = lazy(
    () => import("./pages/search-schedule.page")
  );

  const CreateUpdateSchedulePage = lazy(
    () => import("./pages/create-update-schedule.page")
  );

  const DetailsSchedulePage = lazy(
    () => import("./pages/details-schedule.page")
  );

  return (
    <Routes>
      <Route
        path={"/consultar"}
        element={<SearchSchedulePage />}
      />

      <Route
        path={"/crear"}
        element={<CreateUpdateSchedulePage action={"new"} />}
      />

      <Route
        path={"/edit/:id"}
        element={<CreateUpdateSchedulePage action={"edit"} />}
      />

      <Route
        path={"/detalles/:id"}
        element={<DetailsSchedulePage />}
      />
    </Routes>
  );
}

export default React.memo(ScheduleRoutes);