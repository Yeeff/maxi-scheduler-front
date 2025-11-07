import React, { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";

import { ICompany } from "../../../common/interfaces/company.interfaces";
import useCrudService from "../../../common/hooks/crud-service.hook";
import { EResponseCodes } from "../../../common/constants/api.enum";

interface IAssignEmployeeModalProps {
  visible: boolean;
  onHide: () => void;
  onAssign: (employeeId: number) => void;
  positionId: number;
}

interface IEmployeeCache {
  id: number;
  name: string;
  document: string;
  status: boolean;
}

const AssignEmployeeModal = ({
  visible,
  onHide,
  onAssign,
  positionId,
}: IAssignEmployeeModalProps): React.JSX.Element => {
  const [employees, setEmployees] = useState<IEmployeeCache[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<IEmployeeCache[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<IEmployeeCache | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { get } = useCrudService(process.env.urlApiScheduler);

  useEffect(() => {
    if (visible) {
      loadAvailableEmployees();
    }
  }, [visible]);

  useEffect(() => {
    // Filter employees based on search term
    if (searchTerm.trim() === "") {
      setFilteredEmployees(employees);
    } else {
      const filtered = employees.filter(employee =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.document.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredEmployees(filtered);
    }
  }, [employees, searchTerm]);

  const loadAvailableEmployees = async () => {
    try {
      setLoading(true);
      const response = await get<IEmployeeCache[]>("/api/employees-cache/available");

      if (response.operation.code === EResponseCodes.OK || response.operation.code === EResponseCodes.SUCCESS) {
        const employeesData = (response as any).data?.data || (response as any).data || [];
        setEmployees(Array.isArray(employeesData) ? employeesData : []);
      } else {
        console.error("Error loading available employees:", response.operation.message);
      }
    } catch (error) {
      console.error("Error loading available employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = () => {
    if (selectedEmployee) {
      onAssign(selectedEmployee.id);
      setSelectedEmployee(null);
      setSearchTerm("");
    }
  };

  const handleHide = () => {
    setSelectedEmployee(null);
    setSearchTerm("");
    onHide();
  };

  const footer = (
    <div className="flex justify-content-end gap-2">
      <Button
        label="Cancelar"
        icon="pi pi-times"
        className="p-button-text"
        onClick={handleHide}
      />
      <Button
        label="Asignar Empleado"
        icon="pi pi-check"
        className="p-button-primary"
        onClick={handleAssign}
        disabled={!selectedEmployee}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{ width: "600px" }}
      header="Asignar Empleado a Posición"
      modal
      className="p-fluid"
      footer={footer}
      onHide={handleHide}
    >
      <div className="p-field mb-4">
        <label htmlFor="search" className="block text-900 font-medium mb-2">
          Buscar empleado:
        </label>
        <InputText
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o documento..."
          className="w-full"
        />
      </div>

      <DataTable
        value={filteredEmployees}
        selectionMode="single"
        selection={selectedEmployee}
        onSelectionChange={(e) => setSelectedEmployee(e.value)}
        dataKey="id"
        loading={loading}
        scrollable
        scrollHeight="300px"
        emptyMessage="No hay empleados disponibles para asignar"
        className="p-datatable-sm"
      >
        <Column field="name" header="Nombre" sortable />
        <Column field="document" header="Documento" sortable />
      </DataTable>

      {selectedEmployee && (
        <div className="mt-3 p-3 bg-blue-50 border-round">
          <strong>Empleado seleccionado:</strong> {selectedEmployee.name} ({selectedEmployee.document})
        </div>
      )}
    </Dialog>
  );
};

export default AssignEmployeeModal;