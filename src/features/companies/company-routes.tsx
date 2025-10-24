import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function CompanyRoutes() {
  const SearchCompanyPage = lazy(
    () => import("./pages/search-company.page")
  );

  const CreateUpdateCompanyPage = lazy(
    () => import("./pages/create-update-company.page")
  );

  const DetailsCompanyPage = lazy(
    () => import("./pages/details-company.page")
  );

  return (
    <Routes>
      <Route
        path={"/consultar"}
        element={<SearchCompanyPage />}
      />

      <Route
        path={"/crear"}
        element={<CreateUpdateCompanyPage action={"new"} />}
      />

      <Route
        path={"/edit/:id"}
        element={<CreateUpdateCompanyPage action={"edit"} />}
      />

      <Route
        path={"/detalles/:id"}
        element={<DetailsCompanyPage />}
      />
    </Routes>
  );
}

export default React.memo(CompanyRoutes);