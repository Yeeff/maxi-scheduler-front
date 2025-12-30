import React from "react";
import { Button } from "primereact/button";
import { TimelineGrid } from "../components/timeline-grid.component";
import { TimelineActions } from "../components/timeline-actions.component";
import AssignEmployeeModal from "../components/assign-employee-modal.component";
import ChangeScheduleTemplateModal from "../components/change-schedule-template-modal.component";
import { CreateCompanyModal } from "../components/create-company-modal.component";
import { CreatePositionModal } from "../components/create-position-modal.component";
import TimeBlockEditorModal from "../components/time-block-editor-modal.component";
import TimeBlockManagerModal from "../components/time-block-manager-modal.component";
import useTimelineHook from "../hooks/use-timeline.hook";

// Add spinner animation
const spinnerStyle = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Inject the style
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = spinnerStyle;
  document.head.appendChild(style);
}

const TimelinePage = (): React.JSX.Element => {
  const {
    timelineData,
    companies,
    employees,
    leaveTypes,
    selectedCompanyId,
    selectedEmployeeId,
    selectedLeaveTypeId,
    selectedRows,
    loading,
    isGeneratingWeek,
    isGeneratingMonth,
    weekStart,
    handleCompanyChange,
    handleEmployeeChange,
    handleLeaveTypeChange,
    handleClearFilters,
    handleRowSelectionChange,
    handleCellClick,
    handleCreateCompany,
    handleCreatePosition,
    handleAssignEmployee,
    handleUnassignEmployee,
    handleMoveEmployee,
    handleLinkScheduleTemplate,
    handleChangeScheduleTemplate,
    handleGenerateSchedules,
    handleBulkGenerateSchedules,
    handleGenerateWeekFromPrevious,
    handleGenerateMonthFromPrevious,
    contextMenuModel,
    showAssignEmployeeModal,
    setShowAssignEmployeeModal,
    handleAssignEmployeeConfirm,
    showCreateCompanyModal,
    setShowCreateCompanyModal,
    handleCreateCompanyConfirm,
    showCreatePositionModal,
    setShowCreatePositionModal,
    handleCreatePositionConfirm,
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
    handleBlockClick,
    handleCreateBlockClick,
    handleCreateBlockDoubleClick,
    getDayDate,
    loadTimelineData,
    canAssignEmployee,
    canUnassignEmployee,
    canAssociateTemplate,
    canGenerateSchedules,
    navigateToCurrentWeek,
    navigateToPreviousWeek,
    navigateToNextWeek,
    getCurrentWeekDisplay,
    isCurrentOrFutureWeek,
  } = useTimelineHook();

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label className="text-black extra-large bold">Timeline de Horarios</label>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Button
              label="Crear empresa"
              icon="pi pi-plus"
              onClick={handleCreateCompany}
              className="p-button-secondary"
            />
            <Button
              label="Crear posición"
              icon="pi pi-plus"
              onClick={handleCreatePosition}
              disabled={!selectedCompanyId}
              className="p-button-secondary"
            />
            <Button
              label="Generar semana actual"
              icon="pi pi-copy"
              onClick={handleGenerateWeekFromPrevious}
              loading={isGeneratingWeek}
              className="p-button-primary"
            />
            <Button
              label="Generar mes actual"
              icon="pi pi-calendar"
              onClick={handleGenerateMonthFromPrevious}
              loading={isGeneratingMonth}
              className="p-button-primary"
            />
          </div>
        </div>

        <TimelineActions
          selectedRows={selectedRows}
          companies={companies}
          employees={employees}
          leaveTypes={leaveTypes}
          selectedCompanyId={selectedCompanyId ?? null}
          selectedEmployeeId={selectedEmployeeId ?? null}
          selectedLeaveTypeId={selectedLeaveTypeId ?? null}
          loading={loading}
          onCompanyChange={handleCompanyChange}
          onEmployeeChange={handleEmployeeChange}
          onLeaveTypeChange={handleLeaveTypeChange}
          onClearFilters={handleClearFilters}
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
          navigateToCurrentWeek={navigateToCurrentWeek}
          navigateToPreviousWeek={navigateToPreviousWeek}
          navigateToNextWeek={navigateToNextWeek}
          getCurrentWeekDisplay={getCurrentWeekDisplay}
          isCurrentOrFutureWeek={isCurrentOrFutureWeek}
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

        <div className="timeline-container" style={{ position: 'relative' }}>
          {loading && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #094a90',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{
                  color: '#094a90',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Cargando datos...
                </span>
              </div>
            </div>
          )}
          <TimelineGrid
            data={timelineData}
            selectedRows={selectedRows}
            onSelectionChange={handleRowSelectionChange}
            onCellClick={handleCellClick}
            onBlockClick={handleBlockClick}
            onCreateBlockClick={handleCreateBlockClick}
            onCreateBlockDoubleClick={handleCreateBlockDoubleClick}
            contextMenuModel={contextMenuModel}
            loading={loading}
            currentWeekStart={weekStart}
          />
        </div>

        <AssignEmployeeModal
          visible={showAssignEmployeeModal}
          onHide={() => setShowAssignEmployeeModal(false)}
          onAssign={handleAssignEmployeeConfirm}
          positionId={selectedRows.length > 0 ? selectedRows[0].position.id : 0}
        />

        <CreateCompanyModal
          visible={showCreateCompanyModal}
          onHide={() => setShowCreateCompanyModal(false)}
          onCreate={handleCreateCompanyConfirm}
        />

        <CreatePositionModal
          visible={showCreatePositionModal}
          onHide={() => setShowCreatePositionModal(false)}
          onCreate={handleCreatePositionConfirm}
          selectedCompanyId={selectedCompanyId}
          selectedCompanyName={companies.find(c => c.id === selectedCompanyId)?.name}
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
          onRefresh={() => loadTimelineData(weekStart)}
          positionId={selectedPositionForManager || 0}
          positionName={timelineData.find(row => row.position.id === selectedPositionForManager)?.position.name || ''}
          date={getDayDate(selectedDayForManager || '') || ''}
          dayKey={selectedDayForManager || ''}
          companyId={selectedCompanyId || 0}
        />
      </div>
    </div>
  );
};

export default React.memo(TimelinePage);