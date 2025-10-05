import React, { useState } from "react";
import { Control, Controller, FormState, UseFormSetValue, UseFormWatch } from "react-hook-form";
import {
  FormComponent,
  InputComponent,
  TextAreaComponent,
  ButtonComponent,
} from "../../../common/components/Form";
import { Dialog } from "primereact/dialog";

import { IScheduleTemplate, IShiftForm } from "../../../common/interfaces/schedule.interfaces";

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
  const [shiftForm, setShiftForm] = useState<IShiftForm>({
    name: "",
    startTime: "",
    endTime: "",
    breakDescription: "",
    breakStartTime: "",
    breakEndTime: "",
  });

  const watchedDetails = watch("details");

  const openShiftModal = (dayIndex: number, existingShift?: any) => {
    setCurrentDayIndex(dayIndex);
    if (existingShift) {
      setShiftForm({
        name: existingShift.name || "",
        startTime: existingShift.startTime || "",
        endTime: existingShift.endTime || "",
        breakDescription: existingShift.breakPeriods?.[0]?.description || "",
        breakStartTime: existingShift.breakPeriods?.[0]?.startTime || "",
        breakEndTime: existingShift.breakPeriods?.[0]?.endTime || "",
      });
    } else {
      setShiftForm({
        name: "",
        startTime: "",
        endTime: "",
        breakDescription: "",
        breakStartTime: "",
        breakEndTime: "",
      });
    }
    setShowShiftModal(true);
  };

  const saveShift = () => {
    if (currentDayIndex !== null) {
      const shiftData = {
        name: shiftForm.name,
        startTime: shiftForm.startTime,
        endTime: shiftForm.endTime,
        breakPeriods: shiftForm.breakDescription ? [{
          description: shiftForm.breakDescription,
          startTime: shiftForm.breakStartTime,
          endTime: shiftForm.breakEndTime,
        }] : [],
      };

      // Update the form data
      const currentDetails = watchedDetails || [];
      const updatedDetails = [...currentDetails];
      updatedDetails[currentDayIndex] = {
        ...updatedDetails[currentDayIndex],
        shifts: [shiftData],
      };

      setValue("details", updatedDetails);
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
          <h3 className="text-black large bold">Configuración por día</h3>
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
                    {shift.breakPeriods?.length > 0 && (
                      <p><strong>Descanso:</strong> {shift.breakPeriods[0].description} ({shift.breakPeriods[0].startTime} - {shift.breakPeriods[0].endTime})</p>
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
            disabled={!isValid}
          />
        </div>
      </FormComponent>

      <Dialog
        visible={showShiftModal}
        style={{ width: "500px" }}
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
            onChange={(e) => setShiftForm({ ...shiftForm, name: e.target.value })}
            className="input-basic medium"
            classNameLabel="text-black big bold"
          />

          <div className="grid-form-2-container gap-15">
            <InputComponent
              idInput="startTime"
              label="Hora inicio *"
              typeInput="time"
              value={shiftForm.startTime}
              onChange={(e) => setShiftForm({ ...shiftForm, startTime: e.target.value })}
              className="input-basic medium"
              classNameLabel="text-black big bold"
            />

            <InputComponent
              idInput="endTime"
              label="Hora fin *"
              typeInput="time"
              value={shiftForm.endTime}
              onChange={(e) => setShiftForm({ ...shiftForm, endTime: e.target.value })}
              className="input-basic medium"
              classNameLabel="text-black big bold"
            />
          </div>

          <h4 className="text-black medium bold m-top-15">Descanso (Opcional)</h4>

          <InputComponent
            idInput="breakDescription"
            label="Descripción del descanso"
            typeInput="text"
            value={shiftForm.breakDescription}
            onChange={(e) => setShiftForm({ ...shiftForm, breakDescription: e.target.value })}
            className="input-basic medium"
            classNameLabel="text-black big bold"
          />

          <div className="grid-form-2-container gap-15">
            <InputComponent
              idInput="breakStartTime"
              label="Hora inicio descanso"
              typeInput="time"
              value={shiftForm.breakStartTime}
              onChange={(e) => setShiftForm({ ...shiftForm, breakStartTime: e.target.value })}
              className="input-basic medium"
              classNameLabel="text-black big bold"
            />

            <InputComponent
              idInput="breakEndTime"
              label="Hora fin descanso"
              typeInput="time"
              value={shiftForm.breakEndTime}
              onChange={(e) => setShiftForm({ ...shiftForm, breakEndTime: e.target.value })}
              className="input-basic medium"
              classNameLabel="text-black big bold"
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};