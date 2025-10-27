import React, { lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PrivateRoute from "../../common/utils/auth-private-guard";

function TimelineRoutes() {
  const TimelinePage = lazy(
    () => import("./pages/timeline.page")
  );

  return (
    <Routes>
      <Route
        path="/"
        element={<TimelinePage />}
      />
    </Routes>
  );
}

export default React.memo(TimelineRoutes);