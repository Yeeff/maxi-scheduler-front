import React from "react";
import useDetailsCompanyHook from "../hooks/detailsCompany.hook";
import { ButtonComponent } from "../../../common/components/Form";

const DetailsCompanyPage = (): React.JSX.Element => {
  const { company, loading, redirectToEdit, redirectToList } = useDetailsCompanyHook();

  if (loading) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles de la Empresa</label>
          </div>
          <div className="container-sections-forms">
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles de la Empresa</label>
          </div>
          <div className="container-sections-forms">
            <p>No se encontró la empresa solicitada.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Detalles de la Empresa</label>
          <div className="title-buttons">
            <ButtonComponent
              value={"Editar"}
              className="button-save medium"
              action={redirectToEdit}
            />
            <ButtonComponent
              value={"Volver"}
              className="button-clean medium"
              action={redirectToList}
            />
          </div>
        </div>

        <div className="container-sections-forms">
          {/* Company Details */}
          <div className="company-details">
            <div className="grid-form-2-container gap-25">
              <div>
                <label className="text-black big bold">Nombre:</label>
                <p className="text-black medium">{company.name}</p>
              </div>
              <div>
                <label className="text-black big bold">NIT:</label>
                <p className="text-black medium">{company.nit}</p>
              </div>
              <div>
                <label className="text-black big bold">Correo electrónico:</label>
                <p className="text-black medium">{company.email || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-black big bold">Teléfono:</label>
                <p className="text-black medium">{company.phone || 'No especificado'}</p>
              </div>
              <div className="grid-form-1-container">
                <label className="text-black big bold">Dirección:</label>
                <p className="text-black medium">{company.address || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-black big bold">Estado:</label>
                <p className="text-black medium">{company.status ? 'Activa' : 'Inactiva'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DetailsCompanyPage);