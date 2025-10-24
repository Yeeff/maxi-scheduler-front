import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function PositionRoutes() {
  const SearchPositionPage = lazy(
    () => import("./pages/search-position.page")
  );

  const CreateUpdatePositionPage = lazy(
    () => import("./pages/create-update-position.page")
  );

  const DetailsPositionPage = lazy(
    () => import("./pages/details-position.page")
  );

  return (
    <Routes>
      <Route
        path={"/consultar"}
        element={<SearchPositionPage />}
      />

      <Route
        path={"/crear"}
        element={<CreateUpdatePositionPage action={"new"} />}
      />

      <Route
        path={"/edit/:id"}
        element={<CreateUpdatePositionPage action={"edit"} />}
      />

      <Route
        path={"/detalles/:id"}
        element={<DetailsPositionPage />}
      />
    </Routes>
  );
}

export default React.memo(PositionRoutes);