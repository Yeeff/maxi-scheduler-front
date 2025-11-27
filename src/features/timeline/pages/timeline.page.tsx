import React from "react";
import { Button } from "primereact/button";
import { TimelineGrid } from "../components/timeline-grid.component";
import { TimelineActions } from "../components/timeline-actions.component";
import AssignEmployeeModal from "../components/assign-employee-modal.component";
import ChangeScheduleTemplateModal from "../components/change-schedule-template-modal.component";
import TimeBlockEditorModal from "../components/time-block-editor-modal.component";
import TimeBlockManagerModal from "../components/time-block-manager-modal.component";
import useTimelineHook from "../hooks/use-timeline.hook";

const TimelinePage = (): React.JSX.Element => {
  const {
    timelineData,
    companies,
    selectedCompanyId,
    selectedRows,
    loading,
    isGeneratingWeek,
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
    handleGenerateWeekFromPrevious,
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
    showTimeBlockManagerModal,
    setShowTimeBlockManagerModal,
    selectedPositionForManager,
    selectedDayForManager,
    handleTimeBlockEdit,
    handleTimeBlockCreateFromManager,
    canAssignEmployee,
    canUnassignEmployee,
    canAssociateTemplate,
    canGenerateSchedules,
  } = useTimelineHook();

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="text-black extra-large bold">Timeline de Horarios</label>
          <Button
            label="Generar semana actual"
            icon="pi pi-copy"
            onClick={handleGenerateWeekFromPrevious}
            loading={isGeneratingWeek}
            className="p-button-primary"
            style={{ marginLeft: 'auto' }}
          />
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
          selectedDate={selectedDateForTimeBlock || selectedTimeBlock?.date}
          positionName={selectedRowForTimeBlock?.position.name || selectedRows[0]?.position.name}
          positionId={selectedRowForTimeBlock?.position.id || selectedRows[0]?.position.id}
          companyId={selectedCompanyId}
        />

        <TimeBlockManagerModal
          visible={showTimeBlockManagerModal}
          onHide={() => setShowTimeBlockManagerModal(false)}
          positionId={selectedPositionForManager || 0}
          positionName={timelineData.find(row => row.position.id === selectedPositionForManager)?.position.name || ''}
          date={(() => {
            if (!selectedDayForManager) return '';
            const daysMap: { [key: string]: number } = {
              'MONDAY': 0, 'TUESDAY': 1, 'WEDNESDAY': 2, 'THURSDAY': 3,
              'FRIDAY': 4, 'SATURDAY': 5, 'SUNDAY': 6
            };
            const dayIndex = daysMap[selectedDayForManager];
            if (dayIndex === undefined) return '';
            const selectedDate = new Date();
            const today = new Date();
            const dayOfWeek = today.getDay();
            const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            selectedDate.setDate(today.getDate() + mondayOffset + dayIndex);
            return selectedDate.toISOString().split('T')[0];
          })()}
          dayKey={selectedDayForManager || ''}
          companyId={selectedCompanyId || 0}
        />
      </div>
    </div>
  );
};

export default React.memo(TimelinePage);