import React from "react";
import { TimelineGrid } from "../components/timeline-grid.component";
import { TimelineActions } from "../components/timeline-actions.component";
import AssignEmployeeModal from "../components/assign-employee-modal.component";
import ChangeScheduleTemplateModal from "../components/change-schedule-template-modal.component";
import useTimelineHook from "../hooks/use-timeline.hook";

const TimelinePage = (): React.JSX.Element => {
  const {
    timelineData,
    companies,
    selectedCompanyId,
    selectedRows,
    loading,
    handleCompanyChange,
    handleRowSelectionChange,
    handleCellClick,
    handleAssignEmployee,
    handleUnassignEmployee,
    handleMoveEmployee,
    handleLinkScheduleTemplate,
    handleChangeScheduleTemplate,
    handleGenerateSchedules,
    handleBulkGenerateSchedules,
    contextMenuModel,
    showAssignEmployeeModal,
    setShowAssignEmployeeModal,
    handleAssignEmployeeConfirm,
    showChangeTemplateModal,
    setShowChangeTemplateModal,
    handleChangeTemplateConfirm,
    canAssignEmployee,
    canUnassignEmployee,
    canAssociateTemplate,
    canGenerateSchedules,
  } = useTimelineHook();

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Timeline de Horarios</label>
        </div>

        <TimelineActions
          selectedRows={selectedRows}
          companies={companies}
          selectedCompanyId={selectedCompanyId}
          onCompanyChange={handleCompanyChange}
          onAssignEmployee={handleAssignEmployee}
          onUnassignEmployee={handleUnassignEmployee}
          onMoveEmployee={handleMoveEmployee}
          onLinkScheduleTemplate={handleLinkScheduleTemplate}
          onChangeScheduleTemplate={handleChangeScheduleTemplate}
          onGenerateSchedules={handleGenerateSchedules}
          onBulkGenerateSchedules={handleBulkGenerateSchedules}
          canAssignEmployee={canAssignEmployee}
          canUnassignEmployee={canUnassignEmployee}
          canAssociateTemplate={canAssociateTemplate}
          canGenerateSchedules={canGenerateSchedules}
        />

        <div className="timeline-container">
          <TimelineGrid
            data={timelineData}
            selectedRows={selectedRows}
            onSelectionChange={handleRowSelectionChange}
            onCellClick={handleCellClick}
            contextMenuModel={contextMenuModel}
            loading={loading}
          />
        </div>

        <AssignEmployeeModal
          visible={showAssignEmployeeModal}
          onHide={() => setShowAssignEmployeeModal(false)}
          onAssign={handleAssignEmployeeConfirm}
          positionId={selectedRows.length > 0 ? selectedRows[0].position.id : 0}
        />

        <ChangeScheduleTemplateModal
          visible={showChangeTemplateModal}
          onHide={() => setShowChangeTemplateModal(false)}
          onChange={handleChangeTemplateConfirm}
          employeeId={selectedRows.length > 0 && selectedRows[0].position.employeeCache ? selectedRows[0].position.employeeCache.id : 0}
          currentScheduleTemplateId={selectedRows.length > 0 && selectedRows[0].position.employeeCache?.scheduleTemplate ? selectedRows[0].position.employeeCache.scheduleTemplate.id : undefined}
          key={selectedRows.length > 0 && selectedRows[0].position.employeeCache ? selectedRows[0].position.employeeCache.id : 0}
        />
      </div>
    </div>
  );
};

export default React.memo(TimelinePage);