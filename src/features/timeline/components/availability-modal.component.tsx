import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";

import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IEmployeeCache {
  id: number;
  name: string;
  document: string;
  status: boolean;
}

interface IAvailabilityModalProps {
  visible: boolean;
  onHide: () => void;
}

const AvailabilityModal = ({
  visible,
  onHide,
}: IAvailabilityModalProps): React.JSX.Element => {
  // Initialize with next day
  const getDefaultDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  // Convert Date to YYYY-MM-DD for API and input value
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // State for input value (YYYY-MM-DD format)
  const [dateInputValue, setDateInputValue] = useState<string>(formatDateForInput(getDefaultDate()));
  const [startTime, setStartTime] = useState("06:00");
  const [endTime, setEndTime] = useState("22:00");
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employees, setEmployees] = useState<IEmployeeCache[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployeeCache[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const { get } = useCrudService(process.env.urlApiScheduler);

  // Reset state when modal opens
  useEffect(() => {
    if (visible) {
      setDateInputValue(formatDateForInput(getDefaultDate()));
      setStartTime("06:00");
      setEndTime("22:00");
      setEmployees([]);
      setSearchTerm("");
      setFilteredEmployees([]);
      setHasSearched(false);
    }
  }, [visible]);

  // Filter employees based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.document.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, searchTerm]);

  const loadAvailableEmployees = async () => {
    if (!dateInputValue || !startTime || !endTime) {
      return;
    }

    // Use dateInputValue directly (already in YYYY-MM-DD format)
    const apiDate = dateInputValue;

    try {
      setLoadingEmployees(true);
      const url = `/api/daily-schedules/available-employees?date=${apiDate}&start=${startTime}&end=${endTime}`;

      const response = await get<IEmployeeCache[]>(url);

      if (
        response.operation.code === EResponseCodes.OK ||
        response.operation.code === EResponseCodes.SUCCESS
      ) {
        const employeesData =
          (response as any).data?.data || (response as any).data || [];
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
        setHasSearched(true);
      } else {
        console.error(
          "Error loading available employees:",
          response.operation.message
        );
        setEmployees([]);
        setHasSearched(true);
      }
    } catch (error) {
      console.error("Error loading available employees:", error);
      setEmployees([]);
      setHasSearched(true);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSearch = () => {
    if (dateInputValue && startTime && endTime) {
      loadAvailableEmployees();
    }
  };

  const handleHide = () => {
    setDateInputValue(formatDateForInput(getDefaultDate()));
    setStartTime("06:00");
    setEndTime("22:00");
    setEmployees([]);
    setSearchTerm("");
    setFilteredEmployees([]);
    setHasSearched(false);
    onHide();
  };

  const isFormValid = dateInputValue && startTime && endTime;

  const statusBodyTemplate = (rowData: IEmployeeCache) => {
    return (
      <span
        style={{
          color: rowData.status ? "#28a745" : "#dc3545",
          fontWeight: "500",
        }}
      >
        {rowData.status ? "Activo" : "Inactivo"}
      </span>
    );
  };

  const footer = (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
      <Button
        label="Cerrar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
      />
      <Button
        label="Buscar"
        icon="pi pi-search"
        onClick={handleSearch}
        disabled={!isFormValid}
        loading={loadingEmployees}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "600px" }}
      header="Ver Disponibilidad de Empleados"
      modal
      footer={footer}
      onHide={handleHide}
    >
      <div className="p-fluid">
        {/* Date Selection */}
        <div className="field">
          <label htmlFor="date">Fecha:</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <InputText
              id="date"
              type="date"
              value={dateInputValue}
              onChange={(e) => {
                setDateInputValue(e.target.value);
              }}
              style={{ width: "200px" }}
              onClick={(e) => {
                // Select all text when clicked for easy editing
                (e.target as HTMLInputElement).select();
              }}
            />
            <Button
              icon="pi pi-calendar"
              className="p-button-outlined p-button-secondary"
              onClick={() => document.getElementById("date")?.click()}
              tooltip="Abrir selector de fecha"
              tooltipOptions={{ position: "top" }}
            />
          </div>
          <small style={{ color: "#6c757d" }}>
            Formato: AAAA-MM-DD (use el selector o escriba la fecha)
          </small>
        </div>

        {/* Time Range */}
        <div style={{ display: "flex", gap: "16px", marginTop: "16px" }}>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="startTime">Hora Inicio:</label>
            <InputText
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label htmlFor="endTime">Hora Fin:</label>
            <InputText
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Search Input */}
        {hasSearched && (
          <div className="field" style={{ marginTop: "16px" }}>
            <InputText
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o documento..."
              disabled={loadingEmployees}
            />
          </div>
        )}

        {/* Results */}
        {loadingEmployees && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <ProgressSpinner />
          </div>
        )}

        {hasSearched && !loadingEmployees && (
          <>
            {filteredEmployees.length > 0 ? (
              <DataTable
                value={filteredEmployees}
                paginator
                rows={5}
                style={{ marginTop: "16px" }}
              >
                <Column field="id" header="ID" style={{ width: "80px" }} />
                <Column field="name" header="Nombre" />
                <Column field="document" header="Documento" />
                <Column
                  field="status"
                  header="Estado"
                  body={statusBodyTemplate}
                />
              </DataTable>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px",
                  color: "#6c757d",
                }}
              >
                <p>
                  No se encontraron empleados disponibles para el rango
                  especificado
                </p>
              </div>
            )}
          </>
        )}

        {!hasSearched && !loadingEmployees && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#6c757d",
              backgroundColor: "#f8f9fa",
              borderRadius: "8px",
              marginTop: "16px",
            }}
          >
            <p>
              Seleccione una fecha y rango horario para buscar empleados
              disponibles
            </p>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default React.memo(AvailabilityModal);
