import React, { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./common/contexts/app.context";
import "./styles/_app.scss";
import "./styles/_theme-prime.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import ModalMessageComponent from "./common/components/modal-message.component";
import ApplicationProvider from "./application-provider";
import useAppCominicator from "./common/hooks/app-communicator.hook";
import SpinnerComponent from "./common/components/spinner.component";
import ScheduleRoutes from "./features/schedules/schedule-routes";
import CompanyRoutes from "./features/companies/company-routes";
import PositionRoutes from "./features/positions/position-routes";
import TimelineRoutes from "./features/timeline/timeline-routes";

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
              <Route path={"/scheduler/"} element={<HomePage />} />
              <Route path={"/scheduler/horarios/*"} element={<ScheduleRoutes />} />
              <Route path={"/scheduler/empresas/*"} element={<CompanyRoutes />} />
              <Route path={"/scheduler/cargos/*"} element={<PositionRoutes />} />
              <Route path={"/scheduler/timeline/*"} element={<TimelineRoutes />} />
            </Routes>
          </Suspense>
        </Router>
      </ApplicationProvider>
    </AppContextProvider>
  );
}

export default React.memo(App);
