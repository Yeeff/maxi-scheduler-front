import React from "react";
import useDetailsPositionHook from "../hooks/detailsPosition.hook";
import { ButtonComponent } from "../../../common/components/Form";

const DetailsPositionPage = (): React.JSX.Element => {
  const { position, loading, redirectToEdit, redirectToList } = useDetailsPositionHook();

  if (loading) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles del Cargo</label>
          </div>
          <div className="container-sections-forms">
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!position) {
    return (
      <div className="main-page">
        <div className="card-table">
          <div className="title-area">
            <label className="text-black extra-large bold">Detalles del Cargo</label>
          </div>
          <div className="container-sections-forms">
            <p>No se encontró el cargo solicitado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black extra-large bold">Detalles del Cargo</label>
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
          {/* Position Details */}
          <div className="position-details">
            <div className="grid-form-2-container gap-25">
              <div>
                <label className="text-black big bold">Nombre:</label>
                <p className="text-black medium">{position.name}</p>
              </div>
              <div>
                <label className="text-black big bold">Ubicación:</label>
                <p className="text-black medium">{position.location || 'No especificada'}</p>
              </div>
              <div>
                <label className="text-black big bold">Empresa:</label>
                <p className="text-black medium">{position.company.name}</p>
              </div>
              <div>
                <label className="text-black big bold">Plantilla de horario:</label>
                <p className="text-black medium">{position.scheduleTemplate.name}</p>
              </div>
              <div>
                <label className="text-black big bold">Estado:</label>
                <p className="text-black medium">{position.status ? 'Activo' : 'Inactivo'}</p>
              </div>
              {position.idUser && (
                <div>
                  <label className="text-black big bold">ID Usuario:</label>
                  <p className="text-black medium">{position.idUser}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(DetailsPositionPage);