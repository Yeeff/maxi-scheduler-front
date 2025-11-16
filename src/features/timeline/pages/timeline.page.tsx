import React from "react";
import { TimelineGrid } from "../components/timeline-grid.component";
import { TimelineActions } from "../components/timeline-actions.component";
import AssignEmployeeModal from "../components/assign-employee-modal.component";
import ChangeScheduleTemplateModal from "../components/change-schedule-template-modal.component";
import TimeBlockEditorModal from "../components/time-block-editor-modal.component";
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
    showTimeBlockEditorModal,
    setShowTimeBlockEditorModal,
    selectedTimeBlock,
    selectedRowForTimeBlock,
    selectedDateForTimeBlock,
    handleTimeBlockSave,
    handleTimeBlockCreate,
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

        {/* Selected items info - positioned above the table */}
        {selectedRows.length > 0 && (
          <div style={{
            margin: '12px 0',
            padding: '8px 16px',
            backgroundColor: '#e3f2fd',
            border: '1px solid #2196f3',
            borderRadius: '4px',
            color: '#1565c0',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            <span className="text-black">
              {selectedRows.length} cargo{selectedRows.length > 1 ? 's' : ''} seleccionado{selectedRows.length > 1 ? 's' : ''}
            </span>
          </div>
        )}

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

        <TimeBlockEditorModal
          visible={showTimeBlockEditorModal}
          onHide={() => setShowTimeBlockEditorModal(false)}
          onSave={handleTimeBlockSave}
          onCreate={handleTimeBlockCreate}
          timeBlock={selectedTimeBlock}
          selectedRow={selectedRowForTimeBlock || (selectedRows.length > 0 ? selectedRows[0] : undefined)}
          selectedDate={selectedDateForTimeBlock || selectedTimeBlock?.date}
          positionName={selectedRowForTimeBlock?.position.name || selectedRows[0]?.position.name}
          employeeName={selectedTimeBlock?.employeeName || selectedRowForTimeBlock?.position.employeeCache?.name || selectedRows[0]?.position.employeeCache?.name}
        />
      </div>
    </div>
  );
};

export default React.memo(TimelinePage);