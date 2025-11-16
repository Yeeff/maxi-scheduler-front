import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { ITimeBlock } from "../../../common/interfaces/timeline.interfaces";

interface ITimeBlockEditorModalProps {
  visible: boolean;
  onHide: () => void;
  onSave: (timeBlockId: number, startTime: string, endTime: string) => void;
  timeBlock?: ITimeBlock;
}

const TimeBlockEditorModal = ({
  visible,
  onHide,
  onSave,
  timeBlock,
}: ITimeBlockEditorModalProps): React.JSX.Element => {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && timeBlock) {
      setStartTime(timeBlock.startTime || "");
      setEndTime(timeBlock.endTime || "");
    }
  }, [visible, timeBlock]);

  const handleSave = async () => {
    console.log("handleSave called - timeBlock:", timeBlock, "startTime:", startTime, "endTime:", endTime);
    if (timeBlock && timeBlock.id) {
      setLoading(true);
      try {
        console.log("Calling onSave with:", timeBlock.id, startTime, endTime);
        await onSave(timeBlock.id, startTime, endTime);
        onHide();
      } catch (error) {
        console.error("Error saving time block:", error);
      } finally {
        setLoading(false);
      }
    } else {
      console.error("TimeBlock or ID missing:", { timeBlock, id: timeBlock?.id });
    }
  };

  const handleHide = () => {
    setStartTime("");
    setEndTime("");
    onHide();
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
        style={{
          background: 'transparent',
          border: '1px solid #6c757d',
          color: '#6c757d',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#5a6268';
          e.currentTarget.style.color = '#5a6268';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#6c757d';
          e.currentTarget.style.color = '#6c757d';
        }}
      />
      <Button
        label="Guardar Cambios"
        icon="pi pi-check"
        onClick={handleSave}
        loading={loading}
        style={{
          background: '#094a90',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#138496';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#094a90';
        }}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{
        width: "400px",
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      header="Editar Horario"
      modal
      className="p-fluid"
      footer={footer}
      onHide={handleHide}
      headerStyle={{
        backgroundColor: '#094a90',
        color: 'white',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        padding: '16px 24px',
        fontSize: '18px',
        fontWeight: '600'
      }}
      contentStyle={{
        padding: '24px',
        backgroundColor: '#ffffff'
      }}
    >
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="startTime" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Hora de Inicio:
        </label>
        <InputText
          id="startTime"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#094a90'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="endTime" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Hora de Fin:
        </label>
        <InputText
          id="endTime"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            fontSize: '14px',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => e.target.style.borderColor = '#094a90'}
          onBlur={(e) => e.target.style.borderColor = '#dee2e6'}
        />
      </div>

      {timeBlock && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          color: '#1565c0',
          fontSize: '14px'
        }}>
          <strong>Información del bloque:</strong><br />
          Empleado: {timeBlock.employeeName}<br />
          Tipo: {timeBlock.type === 'work' ? 'Trabajo' : timeBlock.type}
        </div>
      )}
    </Dialog>
  );
};

export default TimeBlockEditorModal;