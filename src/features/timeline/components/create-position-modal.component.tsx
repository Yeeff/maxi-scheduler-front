import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { useForm, Controller } from "react-hook-form";
import { InputComponent } from "../../../common/components/Form";
import { IScheduleTemplate } from "../../../common/interfaces/schedule.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface ICreatePositionModalProps {
  visible: boolean;
  onHide: () => void;
  onCreate: (positionData: { name: string; companyId: number }) => void;
  selectedCompanyId?: number;
  selectedCompanyName?: string;
  isLoading?: boolean;
}

export const CreatePositionModal = ({
  visible,
  onHide,
  onCreate,
  selectedCompanyId,
  selectedCompanyName,
  isLoading = false,
}: ICreatePositionModalProps): React.JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<{ name: string }>({
    defaultValues: {
      name: "",
    },
    mode: "all",
  });

  const [scheduleTemplates, setScheduleTemplates] = useState<IScheduleTemplate[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);

  const { get } = useCrudService(process.env.urlApiScheduler);

  // Load schedule templates on component mount
  useEffect(() => {
    if (visible) {
      loadScheduleTemplates();
    }
  }, [visible]);

  const loadScheduleTemplates = async () => {
    try {
      setLoadingSchedules(true);
      const response = await get<IScheduleTemplate[]>("/api/schedules");
      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const schedulesData = (response as any).data?.data || (response as any).data || [];
        setScheduleTemplates(Array.isArray(schedulesData) ? schedulesData : []);
      }
    } catch (error) {
      console.error("Error loading schedule templates:", error);
    } finally {
      setLoadingSchedules(false);
    }
  };

  const onSubmit = (data: { name: string }) => {
    if (!selectedCompanyId) {
      return; // Should not happen since button is disabled when no company selected
    }

    // Use first available schedule template as default
    const defaultScheduleTemplate = scheduleTemplates.length > 0 ? scheduleTemplates[0] : null;
    if (!defaultScheduleTemplate) {
      // Handle case where no schedule templates exist
      return;
    }

    onCreate({
      name: data.name,
      companyId: selectedCompanyId,
    });
  };

  const handleHide = () => {
    reset();
    onHide();
  };

  const footer = (
    <div className="flex justify-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        disabled={isLoading}
      />
      <Button
        label="Crear Posición"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={handleSubmit(onSubmit)}
        disabled={!isValid || !selectedCompanyId || scheduleTemplates.length === 0 || isLoading}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      header="Crear Nueva Posición"
      visible={visible}
      onHide={handleHide}
      footer={footer}
      style={{ width: "500px" }}
      closable={!isLoading}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="text-black big bold block mb-2">Empresa Seleccionada:</label>
          <p className="text-gray-700">{selectedCompanyName || "Ninguna empresa seleccionada"}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            control={control}
            name="name"
            rules={{
              required: "El nombre de la posición es obligatorio",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres",
              },
            }}
            render={({ field }) => (
              <InputComponent
                idInput={field.name}
                errors={errors}
                onChange={field.onChange}
                onBlur={field.onBlur}
                value={field.value}
                label={
                  <>
                    Nombre de la posición <span>*</span>
                  </>
                }
                className="input-basic medium"
                classNameLabel="text-black big bold"
                typeInput=""
                placeholder="Ingrese el nombre de la posición"
              />
            )}
          />

          {scheduleTemplates.length === 0 && !loadingSchedules && (
            <div className="text-red-600 text-sm">
              Error: No hay plantillas de horario disponibles. Debe crear al menos una plantilla de horario primero.
            </div>
          )}

          {loadingSchedules && (
            <div className="text-gray-600 text-sm">
              Cargando plantillas de horario...
            </div>
          )}
        </form>
      </div>
    </Dialog>
  );
};