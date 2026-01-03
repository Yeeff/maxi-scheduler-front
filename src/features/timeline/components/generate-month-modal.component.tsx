import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";

interface IGenerateMonthModalProps {
  visible: boolean;
  onHide: () => void;
  onGenerate: (selectedDate: Date) => void;
  isLoading?: boolean;
}

export const GenerateMonthModal = ({
  visible,
  onHide,
  onGenerate,
  isLoading = false,
}: IGenerateMonthModalProps): React.JSX.Element => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Initialize with current month
  useEffect(() => {
    if (visible) {
      setSelectedDate(new Date());
    }
  }, [visible]);

  const handleGenerate = () => {
    if (selectedDate) {
      onGenerate(selectedDate);
    }
  };

  const handleHide = () => {
    setSelectedDate(null);
    onHide();
  };

  // Calculate max date (6 months from now)
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 6);

  // Min date is current month
  const minDate = new Date();
  minDate.setDate(1); // First day of current month

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
        label="Generar Mes"
        icon="pi pi-calendar"
        className="p-button-primary"
        onClick={handleGenerate}
        disabled={!selectedDate || isLoading}
        loading={isLoading}
      />
    </div>
  );

  return (
    <Dialog
      header="Seleccionar Mes a Generar"
      visible={visible}
      onHide={handleHide}
      footer={footer}
      style={{ width: "400px" }}
      closable={!isLoading}
    >
      <div className="p-4">
        <div className="mb-4">
          <label className="text-black big bold block mb-2">
            Seleccionar Mes y Año
          </label>
          <Calendar
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.value as Date)}
            view="month"
            dateFormat="mm/yy"
            yearNavigator
            yearRange={`${new Date().getFullYear()}:${new Date().getFullYear() + 1}`}
            minDate={minDate}
            maxDate={maxDate}
            placeholder="Seleccione mes"
            className="w-full"
            showIcon
          />
          <small className="text-gray-600">
            Solo se pueden generar meses hasta 6 meses en el futuro.
          </small>
        </div>
      </div>
    </Dialog>
  );
};