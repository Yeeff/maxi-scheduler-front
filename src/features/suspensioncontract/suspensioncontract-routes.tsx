import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function SuspensionContractRoutes() {
  const SearchSuspensionContract = lazy(
    () => import("./pages/search-suspensioncontract.page")
  );

  const CreateSuspensionContract = lazy(
    () => import("./pages/create-suspensioncontract.page")
  );

  return (
    <Routes>
      <Route
        path={"/crear/:idEmployment"}
        element={
          <PrivateRoute
            element={<CreateSuspensionContract />}
            allowedAction={"NMN_CONSULTAR_NOVEDADES"}
          />
        }
      />
      <Route
        path={"/consultar"}
        element={
          <PrivateRoute
            element={<SearchSuspensionContract />}
            allowedAction={"NMN_CONSULTAR_NOVEDADES"}
          />
        }
      />
    </Routes>
  );
}

export default React.memo(SuspensionContractRoutes);
