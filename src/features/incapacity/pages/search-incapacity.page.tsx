import React, { useContext, useRef, useState } from "react";
import TableComponent from "../../../common/components/table.component";
import { useForm } from "react-hook-form";
import {
  ButtonComponent,
  FormComponent,
  SelectComponent,
} from "../../../common/components/Form";
import {
  ITableAction,
  ITableElement,
} from "../../../common/interfaces/table.interfaces";
import {
  IFilterIncapacity,
  IGetIncapacity,
  IGetVinculation,
} from "../../../common/interfaces/payroll.interfaces";
import { useNavigate } from "react-router-dom";
import useListData from "../../vacation/hooks/list.hook";
import { AiOutlinePlusCircle } from "react-icons/ai";
import useViewIncapacityDetail from "../hooks/viewIncapacity.hook";
import { AppContext } from "../../../common/contexts/app.context";
import { EResponseCodes } from "../../../common/constants/api.enum";
import useIncapacityService from "../../../common/hooks/incapacity-service.hook";

const SearchIncapacity = () => {
  const { validateActionAccess, setMessage } = useContext(AppContext);
  const { activeWorkerList } = useListData(false);
  const { deleteIncapacity } = useIncapacityService();

  const { showDetailIncapacity } = useViewIncapacityDetail();

  const tableComponentRef = useRef(null);

  const navigate = useNavigate();

  const [showTable, setshowTable] = useState(false);

  const {
    handleSubmit,
    formState: { errors },
    control,
    reset,
    watch,
  } = useForm<IFilterIncapacity>({ defaultValues: { workerId: "" } });

  const handleModalSuccess = () => {
    setMessage({
      title: `Eliminar Incapacidad`,
      description: `Se ha eliminado la incapacidad con éxito`,
      // description: <div>{JSON.stringify(data)}</div>,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        reset();
        tableComponentRef.current?.emptyData();
        setshowTable(false);
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      // size: "extra-large",
    });
  };

  const handleModalError = (msg: string = "Error, algo fallo") => {
    setMessage({
      title: "Error",
      description: msg,
      show: true,
      OkTitle: "cerrar",
      onOk: () => {
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        setMessage({});
      },
      background: true,
    });
  };
  const workerId = watch("workerId");
  const tableColumns: ITableElement<IGetIncapacity>[] = [
    {
      fieldName: "numberDocument",
      header: "Numero de documento",
      renderCell: (row) => {
        return <>{row.employment.worker.numberDocument}</>;
      },
    },
    {
      fieldName: "firstName",
      header: "Nombres completo",
      renderCell: (row) => {
        return (
          <>
            {`${row.employment.worker?.firstName}
               ${row.employment.worker?.secondName} 
               ${row.employment.worker?.surname}
               ${row.employment.worker?.secondSurname}`}
          </>
        );
      },
    },
    {
      fieldName: "employment.typeIncapacity",
      header: "Origen incapacidad",
      renderCell: (row) => {
        return <>{row.typeIncapacity?.name}</>;
      },
    },
  ];

  const tableActions: ITableAction<IGetVinculation>[] = [
    {
      icon: "Detail",
      onClick: (row) => {
        showDetailIncapacity(row?.id);
      },
      hide: !validateActionAccess("INCAPACIDAD_CONSULTAR"),
    },
    {
      icon: "Edit",
      onClick: (row) => {
        navigate(`../edit/${row?.id}`);
      },
      hide: !validateActionAccess("INCAPACIDAD_EDITAR"),
    },
    {
      icon: "Delete",
      onClick: (row) => {
        setMessage({
          title: `Eliminar Incapacidad`,
          description: `¿Estás segur@ de eliminar
          la incapacidad ?`,
          show: true,
          OkTitle: "Aceptar",
          onOk: () => {
            deleteIncapacity(row.id)
              .then(({ data, operation }) => {
                if (operation.code === EResponseCodes.OK) {
                  handleModalSuccess();
                } else {
                  handleModalError(
                    "La incapacidad ya se encuentra en una planilla autorizada."
                  );
                }
              })
              .catch((err) => {
                handleModalError(err);
                console.log("algo fallo", err);
              });
          },
          cancelTitle: "Cancelar",
          background: true,
        });
      },
      hide: !validateActionAccess("INCAPACIDAD_ELIMINAR"),
    },
  ];

  function loadTableData(filterVinculation: IFilterIncapacity): void {
    if (tableComponentRef.current) {
      tableComponentRef.current.loadData(filterVinculation);
    }
  }

  const onSubmit = handleSubmit(async (data: IFilterIncapacity) => {
    setshowTable(true);
    loadTableData(data);
  });

  return (
    <div className="main-page">
      <div className="card-table">
        <div className="title-area">
          <label className="text-black biggest bold">Incapacidades</label>

          <div
            className="title-button text-main biggest pointer"
            onClick={() => {
              if (validateActionAccess("INCAPACIDAD_CREAR")) {
                navigate("../crear");
              } else {
                setMessage({
                  title: "Crear Incapacidad",
                  show: true,
                  OkTitle: "Aceptar",
                  description: "No tienes permisos para esta acción",
                  size: "large",
                  background: true,
                });
              }
            }}
          >
            Crear incapacidad <AiOutlinePlusCircle />
          </div>
        </div>
        <div>
          <FormComponent
            id="searchRecordForm"
            className="form-signIn"
            action={onSubmit}
          >
            <div className="container-sections-forms">
              <div className="grid-form-3-container gap-25">
                <SelectComponent
                  idInput={"workerId"}
                  control={control}
                  errors={errors}
                  data={activeWorkerList}
                  label={<>Documento - Nombre empleado</>}
                  className="select-basic medium"
                  classNameLabel="text-black big bold"
                  placeholder="Seleccione."
                  filter={true}
                />
              </div>
            </div>
            <div className="button-save-container-display">
              <ButtonComponent
                value={"Limpiar campos"}
                className="button-clean bold"
                type="button"
                action={() => {
                  setshowTable(false);
                  reset();
                }}
              />
              <ButtonComponent
                value={"Buscar"}
                className="button-save big disabled-black"
                disabled={!workerId}
              />
            </div>
          </FormComponent>
        </div>

        {showTable && (
          <div className="container-sections-forms">
            <TableComponent
              ref={tableComponentRef}
              url={`${process.env.urlApiPayroll}/api/v1/incapacity/get-paginated`}
              columns={tableColumns}
              actions={tableActions}
              isShowModal={true}
              titleMessageModalNoResult="Sin resultados."
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(SearchIncapacity);
