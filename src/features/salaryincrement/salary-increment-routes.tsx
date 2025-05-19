import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function SalaryIncrementRoutes() {
  const SearchIncrementSalary = lazy(
    () => import("./pages/search-incrementsalary.page")
  );

  const CreateUpdateIncrementSalary = lazy(
    () => import("./pages/create-update-incrementsalary.page")
  );

  return (
    <Routes>
      <Route
        path={"/consultar"}
        element={
          <PrivateRoute
            element={<SearchIncrementSalary />}
            allowedAction={"NMN_CONSULTAR_NOVEDADES"}
          />
        }
      />

      <Route
        path={"/crear"}
        element={
          <PrivateRoute
            element={<CreateUpdateIncrementSalary action={"new"} />}
            allowedAction={"NMN_CONSULTAR_NOVEDADES"}
          />
        }
      />

      <Route
        path={"/edit/:id"}
        element={
          <PrivateRoute
            element={<CreateUpdateIncrementSalary action={"edit"} />}
            allowedAction={"NMN_CONSULTAR_NOVEDADES"}
          />
        }
      />
    </Routes>
  );
}

export default React.memo(SalaryIncrementRoutes);
