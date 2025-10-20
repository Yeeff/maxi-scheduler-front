import React, { useState, useEffect } from "react";
import { Control, Controller, FormState, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  FormComponent,
  InputComponent,
  TextAreaComponent,
  ButtonComponent,
  SelectComponent,
} from "../../../common/components/Form";
import { Dialog } from "primereact/dialog";
import { RadioButton } from "primereact/radiobutton";

import { IScheduleTemplate, IShiftForm } from "../../../common/interfaces/schedule.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IPropsCreateUpdateScheduleForm {
  action: string;
  control: Control<IScheduleTemplate, any>;
  formState: FormState<IScheduleTemplate>;
  handleSubmitSchedule: (
    e?: React.BaseSyntheticEvent<object, any, any>
  ) => Promise<void>;
  redirectCancel: () => void;
  setValue: UseFormSetValue<IScheduleTemplate>;
  watch: UseFormWatch<IScheduleTemplate>;
  reset: any;
  isLoading: boolean;
}

const DAYS_OF_WEEK = [
  { key: "MONDAY", label: "Lunes" },
  { key: "TUESDAY", label: "Martes" },
  { key: "WEDNESDAY", label: "Miércoles" },
  { key: "THURSDAY", label: "Jueves" },
  { key: "FRIDAY", label: "Viernes" },
  { key: "SATURDAY", label: "Sábado" },
  { key: "SUNDAY", label: "Domingo" },
];

export const CreateUpdateScheduleForm = ({
  action,
  control,
  formState,
  handleSubmitSchedule,
  redirectCancel,
  setValue,
  watch,
  reset,
  isLoading,
}: IPropsCreateUpdateScheduleForm): React.JSX.Element => {
  const { errors, isValid } = formState;
  const [showShiftModal, setShowShiftModal] = useState(false);
  const [currentDayIndex, setCurrentDayIndex] = useState<number | null>(null);
  const [shiftMode, setShiftMode] = useState<'create' | 'select'>('create');
  const [availableShifts, setAvailableShifts] = useState<any[]>([]);
  const [selectedShiftId, setSelectedShiftId] = useState<string>('');

  const { get } = useCrudService<any>(process.env.urlApiScheduler);

  const [shiftForm, setShiftForm] = useState<IShiftForm>({
    name: "",
    startTime: "",
    endTime: "",
    lunchDescription: "",
    lunchTimeInit: "",
    lunchTimeEnd: "",
  });

  const [shiftFormErrors, setShiftFormErrors] = useState<Partial<IShiftForm>>({});
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [shiftsError, setShiftsError] = useState<string | null>(null);

  const watchedDetails = watch("details");
  const watchedName = watch("name");

  // Load available shifts on component mount - only once
  useEffect(() => {
    let isMounted = true;

    const loadAvailableShifts = async () => {
      if (!isMounted) return;

      setIsLoadingShifts(true);
      setShiftsError(null);

      try {
        const response = await get<any[]>("/api/shifts/all");
        if (!isMounted) return;

        if (response.operation.code === EResponseCodes.SUCCESS || response.operation.code === EResponseCodes.OK) {
          // The API returns the data wrapped in another object, so we need to extract the actual array
          const shiftsArray = (response as any).data?.data || (response as any).data || [];
          setAvailableShifts(Array.isArray(shiftsArray) ? shiftsArray : []);
        } else {
          setShiftsError("Error al cargar los turnos disponibles");
          console.error("Error loading available shifts:", response.operation.message);
        }
      } catch (error) {
        if (!isMounted) return;
        setShiftsError("No se pudieron cargar los turnos disponibles");
        console.error("Error loading available shifts:", error);
      } finally {
        if (isMounted) {
          setIsLoadingShifts(false);
        }
      }
    };

    loadAvailableShifts();

    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  const openShiftModal = (dayIndex: number, existingShift?: any) => {
    setCurrentDayIndex(dayIndex);
    setShiftMode('create');
    setSelectedShiftId('');
    setShiftFormErrors({}); // Clear previous errors

    if (existingShift) {
      // Check if this is an existing shift from the database
      const isExistingShift = availableShifts.find(s => s.id === existingShift.id);
      if (isExistingShift) {
        setShiftMode('select');
        setSelectedShiftId(existingShift.id.toString());
      } else {
        setShiftMode('create');
        setShiftForm({
          name: existingShift.name || "",
          startTime: existingShift.startTime || "",
          endTime: existingShift.endTime || "",
          lunchDescription: existingShift.lunchDescription || "",
          lunchTimeInit: existingShift.lunchTimeInit || "",
          lunchTimeEnd: existingShift.lunchTimeEnd || "",
        });
      }
    } else {
      setShiftForm({
        name: "",
        startTime: "",
        endTime: "",
        lunchDescription: "",
        lunchTimeInit: "",
        lunchTimeEnd: "",
      });
    }
    setShowShiftModal(true);
  };

  const validateShiftForm = (): boolean => {
    const errors: Partial<IShiftForm> = {};

    if (shiftMode === 'create') {
      if (!shiftForm.name.trim()) {
        errors.name = "El nombre del turno es obligatorio";
      }
      if (!shiftForm.startTime) {
        errors.startTime = "La hora de inicio es obligatoria";
      }
      if (!shiftForm.endTime) {
        errors.endTime = "La hora de fin es obligatoria";
      }
    } else if (shiftMode === 'select') {
      if (!selectedShiftId) {
        // This would be handled by the select validation
      }
    }

    setShiftFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const saveShift = () => {
    if (!validateShiftForm()) {
      return;
    }

    if (currentDayIndex !== null) {
      let shiftData;

      if (shiftMode === 'select' && selectedShiftId) {
        // Use existing shift
        const selectedShift = availableShifts.find(s => s.id.toString() === selectedShiftId);
        if (selectedShift) {
          shiftData = {
            id: selectedShift.id,
            name: selectedShift.name,
            startTime: selectedShift.startTime,
            endTime: selectedShift.endTime,
            lunchDescription: selectedShift.lunchDescription,
            lunchTimeInit: selectedShift.lunchTimeInit,
            lunchTimeEnd: selectedShift.lunchTimeEnd,
          };
        }
      } else {
        // Create new shift
        shiftData = {
          name: shiftForm.name,
          startTime: shiftForm.startTime,
          endTime: shiftForm.endTime,
          lunchDescription: shiftForm.lunchDescription || undefined,
          lunchTimeInit: shiftForm.lunchTimeInit || undefined,
          lunchTimeEnd: shiftForm.lunchTimeEnd || undefined,
        };
      }

      if (shiftData) {
        // Update the form data
        const currentDetails = watchedDetails || [];
        const updatedDetails = [...currentDetails];
        updatedDetails[currentDayIndex] = {
          ...updatedDetails[currentDayIndex],
          shifts: [shiftData],
        };

        setValue("details", updatedDetails);
      }
    }
    setShowShiftModal(false);
  };

  const removeShift = (dayIndex: number) => {
    const currentDetails = watchedDetails || [];
    const updatedDetails = [...currentDetails];
    updatedDetails[dayIndex] = {
      ...updatedDetails[dayIndex],
      shifts: [],
    };

    setValue("details", updatedDetails);
  };

  // Validation functions
  const validateTemplate = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check if name is provided
    if (!watchedName || !watchedName.trim()) {
      errors.push("El nombre del horario es obligatorio");
    }

    // Check if at least one day has a shift
    const hasAtLeastOneShift = watchedDetails?.some(day => day.shifts && day.shifts.length > 0);
    if (!hasAtLeastOneShift) {
      errors.push("Debe configurar al menos un turno para algún día de la semana");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const isFormValid = () => {
    const templateValidation = validateTemplate();
    return templateValidation.isValid;
  };

  if (isLoading) {
    return (
      <div className="container-sections-forms">
        <div className="text-center p-20">
          <p>Cargando datos del horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-sections-forms">
      <FormComponent
        id="createOrUpdateSchedule"
        className="form-signIn"
        action={handleSubmitSchedule}
      >
        <div className="grid-form-2-container gap-25">
          <Controller
            control={control}
            name={"name"}
            render={({ field }) => {
              return (
                <InputComponent
                  idInput={field.name}
                  errors={errors}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                  label={
                    <>
                      Nombre del horario <span>*</span>
                    </>
                  }
                  className="input-basic medium"
                  classNameLabel="text-black big bold"
                  typeInput={""}
                />
              );
            }}
          />
          <Controller
            control={control}
            name={"description"}
            render={({ field }) => {
              return (
                <TextAreaComponent
                  idInput={field.name}
                  className="text-area-basic"
                  classNameLabel="text-black big bold"
                  label="Descripción"
                  errors={errors}
                  rows={3}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  value={field.value}
                />
              );
            }}
          />
        </div>

        <div className="m-top-20">
          <h3 className="text-black large bold">Configuración por día *</h3>
          <p className="text-gray small m-bottom-15">Debe configurar al menos un turno para algún día de la semana</p>
          {DAYS_OF_WEEK.map((day, index) => {
            const dayData = watchedDetails?.[index];
            const hasShift = dayData?.shifts?.length > 0;
            const shift = dayData?.shifts?.[0];

            return (
              <div key={day.key} className="day-section m-top-15 p-15 border-light">
                <div className="flex-between">
                  <h4 className="text-black medium bold">{day.label}</h4>
                  {hasShift ? (
                    <div>
                      <ButtonComponent
                        value="Editar turno"
                        className="button-secondary small"
                        type="button"
                        action={() => openShiftModal(index, shift)}
                      />
                      <ButtonComponent
                        value="Eliminar"
                        className="button-danger small m-left-10"
                        type="button"
                        action={() => removeShift(index)}
                      />
                    </div>
                  ) : (
                    <ButtonComponent
                      value="Agregar turno"
                      className="button-primary small"
                      type="button"
                      action={() => openShiftModal(index)}
                    />
                  )}
                </div>
                {hasShift && (
                  <div className="shift-info m-top-10 p-10 bg-light">
                    <p><strong>Turno:</strong> {shift.name}</p>
                    <p><strong>Horario:</strong> {shift.startTime} - {shift.endTime}</p>
                    {shift.lunchDescription && shift.lunchTimeInit && shift.lunchTimeEnd && (
                      <p><strong>Descanso:</strong> {shift.lunchDescription} ({shift.lunchTimeInit} - {shift.lunchTimeEnd})</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="button-save-container-display m-top-20">
          <ButtonComponent
            value={"Cancelar"}
            className="button-clean bold"
            type="button"
            action={redirectCancel}
          />
          <ButtonComponent
            value={`${action === "edit" ? "Editar" : "Guardar"}`}
            className="button-save large disabled-black"
            disabled={!isValid || !isFormValid()}
          />
        </div>

        {/* Validation Messages */}
        {!isFormValid() && (
          <div className="validation-messages m-top-15 p-15 bg-error-light border-error">
            <h4 className="text-error medium bold">Errores de validación:</h4>
            <ul className="text-error small m-top-10">
              {validateTemplate().errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </FormComponent>

      <Dialog
        visible={showShiftModal}
        style={{ width: "600px" }}
        header="Configurar Turno"
        onHide={() => setShowShiftModal(false)}
        footer={
          <div className="flex-end gap-10">
            <ButtonComponent
              value="Cancelar"
              className="button-clean"
              type="button"
              action={() => setShowShiftModal(false)}
            />
            <ButtonComponent
              value="Guardar"
              className="button-save"
              type="button"
              action={saveShift}
              disabled={shiftMode === 'create' && (!shiftForm.name.trim() || !shiftForm.startTime || !shiftForm.endTime)}
            />
          </div>
        }
      >
        <div className="grid-form-1-container gap-15">
          {/* Radio buttons to choose between creating new or selecting existing */}
          <div className="shift-mode-selection">
            <h4 className="text-black medium bold">Tipo de turno</h4>
            <div className="flex-start gap-20 m-top-10">
              <div className="flex-center gap-5">
                <RadioButton
                  inputId="createShift"
                  name="shiftMode"
                  value="create"
                  onChange={(e) => setShiftMode(e.value)}
                  checked={shiftMode === 'create'}
                />
                <label htmlFor="createShift" className="text-black medium">Crear nuevo turno</label>
              </div>
              <div className="flex-center gap-5">
                <RadioButton
                  inputId="selectShift"
                  name="shiftMode"
                  value="select"
                  onChange={(e) => setShiftMode(e.value)}
                  checked={shiftMode === 'select'}
                />
                <label htmlFor="selectShift" className="text-black medium">Seleccionar turno existente</label>
              </div>
            </div>
          </div>

          {shiftMode === 'select' ? (
            // Select existing shift
            <div className="existing-shift-selection">
              <div className="select-container">
                <label className="text-black big bold">Seleccionar turno existente *</label>
                {isLoadingShifts ? (
                  <div className="text-center p-10">
                    <p>Cargando turnos disponibles...</p>
                  </div>
                ) : shiftsError ? (
                  <div className="error-message p-10 bg-error-light border-error">
                    <p className="text-error">{shiftsError}</p>
                    <button
                      type="button"
                      className="button-link text-primary"
                      onClick={() => {
                        // Retry loading shifts
                        const loadAvailableShifts = async () => {
                          setIsLoadingShifts(true);
                          setShiftsError(null);
                          try {
                            const response = await get<any[]>("/api/shifts/all");
                            if (response.operation.code === EResponseCodes.SUCCESS) {
                              setAvailableShifts(response.data || []);
                            } else {
                              setShiftsError("Error al cargar los turnos disponibles");
                            }
                          } catch (error) {
                            setShiftsError("No se pudieron cargar los turnos disponibles");
                          } finally {
                            setIsLoadingShifts(false);
                          }
                        };
                        loadAvailableShifts();
                      }}
                    >
                      Reintentar
                    </button>
                  </div>
                ) : (
                  <select
                    value={selectedShiftId}
                    onChange={(e) => setSelectedShiftId(e.target.value)}
                    className="input-basic medium"
                    style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="">
                      {availableShifts.length === 0 ? "No hay turnos disponibles" : "Seleccione un turno existente"}
                    </option>
                    {availableShifts.map(shift => (
                      <option key={shift.id} value={shift.id.toString()}>
                        {shift.name} ({shift.startTime} - {shift.endTime})
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {selectedShiftId && (
                <div className="shift-preview m-top-15 p-10 bg-light">
                  {(() => {
                    const selectedShift = availableShifts.find(s => s.id.toString() === selectedShiftId);
                    return selectedShift ? (
                      <>
                        <p><strong>Nombre:</strong> {selectedShift.name}</p>
                        <p><strong>Horario:</strong> {selectedShift.startTime} - {selectedShift.endTime}</p>
                        {selectedShift.lunchDescription && selectedShift.lunchTimeInit && selectedShift.lunchTimeEnd && (
                          <p><strong>Descanso:</strong> {selectedShift.lunchDescription} ({selectedShift.lunchTimeInit} - {selectedShift.lunchTimeEnd})</p>
                        )}
                      </>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          ) : (
            // Create new shift
            <>
              <InputComponent
                idInput="shiftName"
                label="Nombre del turno *"
                typeInput="text"
                value={shiftForm.name}
                onChange={(e) => {
                  setShiftForm({ ...shiftForm, name: e.target.value });
                  // Clear error when user starts typing
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
                    // Clear error when user starts typing
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
                    // Clear error when user starts typing
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
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};