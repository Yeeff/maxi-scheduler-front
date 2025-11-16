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
        label="Asignar Empleado"
        icon="pi pi-check"
        onClick={handleAssign}
        disabled={!selectedEmployee}
        style={{
          background: selectedEmployee ? '#094a90' : '#6c757d',
          border: 'none',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: selectedEmployee ? 'pointer' : 'not-allowed',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          if (selectedEmployee) {
            e.currentTarget.style.backgroundColor = '#073a70';
          }
        }}
        onMouseLeave={(e) => {
          if (selectedEmployee) {
            e.currentTarget.style.backgroundColor = '#094a90';
          }
        }}
      />
    </div>
  );

  return (
    <Dialog
      visible={visible}
      style={{
        width: "600px",
        borderRadius: '8px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
      }}
      header="Asignar Empleado a Posición"
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
        <label htmlFor="search" style={{
          display: 'block',
          color: '#094a90',
          fontWeight: '600',
          marginBottom: '8px',
          fontSize: '14px'
        }}>
          Buscar empleado:
        </label>
        <InputText
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por nombre o documento..."
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
        style={{
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <Column field="name" header="Nombre" sortable style={{ fontSize: '14px' }} />
        <Column field="document" header="Documento" sortable style={{ fontSize: '14px' }} />
      </DataTable>

      {selectedEmployee && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#e3f2fd',
          border: '1px solid #2196f3',
          borderRadius: '4px',
          color: '#1565c0',
          fontSize: '14px'
        }}>
          <strong>Empleado seleccionado:</strong> {selectedEmployee.name} ({selectedEmployee.document})
        </div>
      )}
    </Dialog>
  );
};

export default AssignEmployeeModal;