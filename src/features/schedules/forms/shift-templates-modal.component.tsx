import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ButtonComponent } from "../../../common/components/Form";
import { InputComponent } from "../../../common/components/Form";
import { TextAreaComponent } from "../../../common/components/Form";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { IShift } from "../../../common/interfaces/schedule.interfaces";

interface IShiftTemplatesModalProps {
  visible: boolean;
  onHide: () => void;
}

export const ShiftTemplatesModal = ({ visible, onHide }: IShiftTemplatesModalProps): React.JSX.Element => {
  const { get, post, put, deleted } = useCrudService<any>(process.env.urlApiScheduler);
  const [shifts, setShifts] = useState<IShift[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingShift, setEditingShift] = useState<IShift | null>(null);
  const [shiftForm, setShiftForm] = useState<IShift>({
    name: "",
    startTime: "",
    endTime: "",
    lunchDescription: "",
    lunchTimeInit: "",
    lunchTimeEnd: "",
  });
  const [shiftFormErrors, setShiftFormErrors] = useState<Partial<IShift>>({});

  // Load shift templates on mount and when modal opens
  useEffect(() => {
    if (visible) {
      loadShiftTemplates();
    }
  }, [visible]);

  const loadShiftTemplates = async () => {
    setLoading(true);
    try {
      const response = await get<any[]>("/api/shifts/all");
      if (response.operation.code === EResponseCodes.SUCCESS || response.operation.code === EResponseCodes.OK) {
        const shiftsArray = (response as any).data?.data || (response as any).data || [];
        // Filter only templates
        const templates = Array.isArray(shiftsArray) ? shiftsArray.filter((s: any) => s.isTemplate) : [];
        setShifts(templates);
      } else {
        console.error("Error loading shift templates:", response.operation.message);
      }
    } catch (error) {
      console.error("Error loading shift templates:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateShiftForm = (): boolean => {
    const errors: Partial<IShift> = {};
    if (!shiftForm.name.trim()) {
      errors.name = "El nombre del turno es obligatorio";
    }
    if (!shiftForm.startTime) {
      errors.startTime = "La hora de inicio es obligatoria";
    }
    if (!shiftForm.endTime) {
      errors.endTime = "La hora de fin es obligatoria";
    }
    setShiftFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveShiftTemplate = async () => {
    if (!validateShiftForm()) return;

    try {
      const payload = {
        name: shiftForm.name,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        lunchDescription: shiftForm.lunchDescription || undefined,
        lunchTimeInit: shiftForm.lunchTimeInit || undefined,
        lunchTimeEnd: shiftForm.lunchTimeEnd || undefined,
        isTemplate: true,
      };

      let response;
      if (editingShift) {
        response = await put(`/api/shifts/${editingShift.id}`, payload);
      } else {
        response = await post("/api/shifts", payload);
      }

      if (response.operation.code === EResponseCodes.SUCCESS || response.operation.code === EResponseCodes.OK) {
        loadShiftTemplates();
        setShowForm(false);
        setEditingShift(null);
        resetForm();
      } else {
        console.error("Error saving shift template:", response.operation.message);
      }
    } catch (error) {
      console.error("Error saving shift template:", error);
    }
  };

  const deleteShiftTemplate = async (shift: IShift) => {
    if (!shift.id) return;
    try {
      const response = await deleted(`/api/shifts/${shift.id}`);
      if (response.operation.code === EResponseCodes.SUCCESS || response.operation.code === EResponseCodes.OK) {
        loadShiftTemplates();
      } else {
        console.error("Error deleting shift template:", response.operation.message);
      }
    } catch (error) {
      console.error("Error deleting shift template:", error);
    }
  };

  const resetForm = () => {
    setShiftForm({
      name: "",
      startTime: "",
      endTime: "",
      lunchDescription: "",
      lunchTimeInit: "",
      lunchTimeEnd: "",
    });
    setShiftFormErrors({});
  };

  const openCreateForm = () => {
    setEditingShift(null);
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (shift: IShift) => {
    setEditingShift(shift);
    setShiftForm({
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      lunchDescription: shift.lunchDescription || "",
      lunchTimeInit: shift.lunchTimeInit || "",
      lunchTimeEnd: shift.lunchTimeEnd || "",
    });
    setShiftFormErrors({});
    setShowForm(true);
  };

  const renderActions = (row: IShift) => {
    return (
      <div className="flex gap-5">
        <ButtonComponent
          value="Editar"
          className="button-secondary small"
          type="button"
          action={() => openEditForm(row)}
        />
        <ButtonComponent
          value="Eliminar"
          className="button-danger small"
          type="button"
          action={() => deleteShiftTemplate(row)}
        />
      </div>
    );
  };

  return (
    <Dialog
      visible={visible}
      style={{ width: "80%" }}
      header="Administrar Plantillas de Turnos"
      onHide={onHide}
      footer={
        <div className="flex-end gap-10">
          <ButtonComponent
            value="Cerrar"
            className="button-clean"
            type="button"
            action={onHide}
          />
        </div>
      }
    >
      <div className="p-15">
        <div className="flex-between m-bottom-15">
          <h3 className="text-black large bold">Plantillas de Turnos</h3>
          <ButtonComponent
            value="Crear Nueva Plantilla"
            className="button-primary"
            type="button"
            action={openCreateForm}
          />
        </div>

        <DataTable
          value={shifts}
          loading={loading}
          emptyMessage="No hay plantillas de turnos."
          scrollable
          className="p-datatable-sm"
        >
          <Column field="name" header="Nombre" sortable />
          <Column field="startTime" header="Inicio" sortable />
          <Column field="endTime" header="Fin" sortable />
          <Column
            field="lunchDescription"
            header="Descanso"
            body={(row) => row.lunchDescription ? `${row.lunchDescription} (${row.lunchTimeInit} - ${row.lunchTimeEnd})` : "Sin descanso"}
          />
          <Column header="Acciones" body={renderActions} />
        </DataTable>

        {showForm && (
          <Dialog
            visible={showForm}
            style={{ width: "500px" }}
            header={editingShift ? "Editar Plantilla de Turno" : "Crear Plantilla de Turno"}
            onHide={() => setShowForm(false)}
            footer={
              <div className="flex-end gap-10">
                <ButtonComponent
                  value="Cancelar"
                  className="button-clean"
                  type="button"
                  action={() => setShowForm(false)}
                />
                <ButtonComponent
                  value="Guardar"
                  className="button-save"
                  type="button"
                  action={saveShiftTemplate}
                  disabled={!shiftForm.name.trim() || !shiftForm.startTime || !shiftForm.endTime}
                />
              </div>
            }
          >
            <div className="grid-form-1-container gap-15">
              <InputComponent
                idInput="shiftName"
                label="Nombre del turno *"
                typeInput="text"
                value={shiftForm.name}
                onChange={(e) => {
                  setShiftForm({ ...shiftForm, name: e.target.value });
                  if (shiftFormErrors.name) {
                    setShiftFormErrors({ ...shiftFormErrors, name: undefined });
                  }
                }}
                className={`input-basic medium ${shiftFormErrors.name ? 'input-error' : ''}`}
                classNameLabel="text-black big bold"
              />
              {shiftFormErrors.name && (
                <p className="text-error small m-top-5">{shiftFormErrors.name}</p>
              )}

              <div className="grid-form-2-container gap-15">
                <InputComponent
                  idInput="startTime"
                  label="Hora inicio *"
                  typeInput="time"
                  value={shiftForm.startTime}
                  onChange={(e) => {
                    setShiftForm({ ...shiftForm, startTime: e.target.value });
                    if (shiftFormErrors.startTime) {
                      setShiftFormErrors({ ...shiftFormErrors, startTime: undefined });
                    }
                  }}
                  className={`input-basic medium ${shiftFormErrors.startTime ? 'input-error' : ''}`}
                  classNameLabel="text-black big bold"
                />
                {shiftFormErrors.startTime && (
                  <p className="text-error small m-top-5">{shiftFormErrors.startTime}</p>
                )}

                <InputComponent
                  idInput="endTime"
                  label="Hora fin *"
                  typeInput="time"
                  value={shiftForm.endTime}
                  onChange={(e) => {
                    setShiftForm({ ...shiftForm, endTime: e.target.value });
                    if (shiftFormErrors.endTime) {
                      setShiftFormErrors({ ...shiftFormErrors, endTime: undefined });
                    }
                  }}
                  className={`input-basic medium ${shiftFormErrors.endTime ? 'input-error' : ''}`}
                  classNameLabel="text-black big bold"
                />
                {shiftFormErrors.endTime && (
                  <p className="text-error small m-top-5">{shiftFormErrors.endTime}</p>
                )}
              </div>

              <h4 className="text-black medium bold m-top-15">Descanso (Opcional)</h4>

              <InputComponent
                idInput="lunchDescription"
                label="Descripción del descanso"
                typeInput="text"
                value={shiftForm.lunchDescription}
                onChange={(e) => setShiftForm({ ...shiftForm, lunchDescription: e.target.value })}
                className="input-basic medium"
                classNameLabel="text-black big bold"
              />

              <div className="grid-form-2-container gap-15">
                <InputComponent
                  idInput="lunchTimeInit"
                  label="Hora inicio descanso"
                  typeInput="time"
                  value={shiftForm.lunchTimeInit}
                  onChange={(e) => setShiftForm({ ...shiftForm, lunchTimeInit: e.target.value })}
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                />

                <InputComponent
                  idInput="lunchTimeEnd"
                  label="Hora fin descanso"
                  typeInput="time"
                  value={shiftForm.lunchTimeEnd}
                  onChange={(e) => setShiftForm({ ...shiftForm, lunchTimeEnd: e.target.value })}
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                />
              </div>
            </div>
          </Dialog>
        )}
      </div>
    </Dialog>
  );
};