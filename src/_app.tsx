import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./common/contexts/app.context";
import "./styles/_app.scss";
import "./styles/_theme-prime.css";
import "primereact/resources/primereact.min.css";
import ModalMessageComponent from "./common/components/modal-message.component";
import ApplicationProvider from "./application-provider";
import WorkerRoutes from "./features/worker/worker-routes";
import VacationRoutes from "./features/vacation/vacation-routes";
import IncapacityRoutes from "./features/incapacity/incapacity-routes";
import WithDrawalRoutes from "./features/withdrawal/withdrawal-routes";
import LicencesRoutes from "./features/Licences/licences-routes";
import SalaryIncrementRoutes from "./features/salaryincrement/salary-increment-routes";
import SuspensionContractRoutes from "./features/suspensioncontract/suspensioncontract-routes";
import DeductionsRoutes from "./features/deductions/deductions-routes";
import SpreadsSheetRoutes from "./features/spreadsheet/spreadsheet-routes";
import OtherIncomeRoutes from "./features/otherIncome/otherIncome-routes";
import IncomeDeductions from "./features/incomeDeductions/incomeDeductions-routes";
import useAppCominicator from "./common/hooks/app-communicator.hook";
import ChargeRoutes from "./features/charges/charge-routes";
import ReportRoutes from "./features/reports/report-routes";
import SpinnerComponent from "./common/components/spinner.component";

function App() {
  const { publish } = useAppCominicator();
  const HomePage = lazy(() => import("./common/components/home.page"));

  // Effect que comunica la aplicacion actual
  useEffect(() => {
    localStorage.setItem("currentAplication", process.env.aplicationId);
    setTimeout(
      () => publish("currentAplication", process.env.aplicationId),
      500
    );
  }, []);

  return (
    <AppContextProvider>
      <ModalMessageComponent />
      <SpinnerComponent />
      <ApplicationProvider>
        <Router>
          <Suspense fallback={<p>Loading...</p>}>
            <Routes>
              <Route path={"/nomina/"} element={<HomePage />} />;
              <Route
                path={"/nomina/trabajadores/*"}
                element={<WorkerRoutes />}
              />
              <Route
                path={"/nomina/vacaciones/*"}
                element={<VacationRoutes />}
              />
              <Route
                path={"/nomina/incapacidades/*"}
                element={<IncapacityRoutes />}
              />
              <Route
                path={"/nomina/licencias/*"}
                element={<LicencesRoutes />}
              />
              <Route path={"/nomina/retiro/*"} element={<WithDrawalRoutes />} />
              <Route
                path={"/nomina/incremento/salario/*"}
                element={<SalaryIncrementRoutes />}
              />
              <Route
                path={"/nomina/suspension/contrato/*"}
                element={<SuspensionContractRoutes />}
              />
              <Route
                path={"/nomina/deduccion/*"}
                element={<DeductionsRoutes />}
              />
              <Route
                path={"/nomina/planilla/*"}
                element={<SpreadsSheetRoutes />}
              />
              <Route
                path={"/nomina/ingresos/otros/*"}
                element={<OtherIncomeRoutes />}
              />
              <Route
                path={"/nomina/deduccion/renta/*"}
                element={<IncomeDeductions />}
              />
              <Route path={"/nomina/cargos/*"} element={<ChargeRoutes />} />
              <Route path={"/nomina/reportes/*"} element={<ReportRoutes />} />
            </Routes>
          </Suspense>
        </Router>
      </ApplicationProvider>
    </AppContextProvider>
  );
}

export default React.memo(App);
