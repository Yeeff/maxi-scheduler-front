import { useRef, useContext, useState, useEffect } from "react";

import { useForm } from "react-hook-form";
import {
  ITableAction,
  ITableElement,
} from "../../../common/interfaces/table.interfaces";
import {
  ICharge,
  IFilterVinculation,
  IGetVinculation,
  IGetVinculationEmployment,
  ITypesContracts,
} from "../../../common/interfaces/payroll.interfaces";
import { useNavigate } from "react-router-dom";
import useEmploymentsData from "./employment.hook";
import {
  calculateDifferenceYear,
  removeEmptySpace,
} from "../../../common/utils/helpers";
import { AppContext } from "../../../common/contexts/app.context";
import { EResponseCodes } from "../../../common/constants/api.enum";
import * as XLSX from "xlsx";
import usePayrollService from "../../../common/hooks/payroll-service.hook";
import { useGenericListService } from "../../../common/hooks/generic-list-service.hook";
import { IDropdownProps } from "../../../common/interfaces/select.interface";
import { ApiResponse } from "../../../common/utils/api-response";
import useDependenceService from "../../../common/hooks/dependencies-service.hook";
export default function useRecordsData() {
  const { typesContracts, activeWorker } = useEmploymentsData({});
  const tableComponentRef = useRef(null);
  const navigate = useNavigate();

  const { setMessage, validateActionAccess } = useContext(AppContext);
  const { getReport } = usePayrollService();
  const { getListByGroupers } = useGenericListService();
  const { getCharges, getTypesContracts } = usePayrollService();

  const { getDependences } = useDependenceService();
  //estados
  const [genderList, setGenderList] = useState<IDropdownProps[]>([]);
  const [chargesInfo, setChargesInfo] = useState<ICharge[]>([]);
  const [dependencesList, setDependencesList] = useState<IDropdownProps[]>([]);
  const [typeDocumentList, setTypeDocumentList] = useState<IDropdownProps[]>(
    []
  );
  const [deparmentList, setDeparmentList] = useState<IDropdownProps[]>([]);
  const [nacionality, setNacionality] = useState<IDropdownProps[]>([]);
  const [townList, setTownList] = useState<IDropdownProps[]>([]);
  const [neighborhoodList, setNeighborhoodList] = useState<IDropdownProps[]>(
    []
  );
  const [socioEconomicStatus, setSocioEconomicStatus] = useState<
    IDropdownProps[]
  >([]);
  const [bloodType, setBloodType] = useState<IDropdownProps[]>([]);
  const [relationship, setRelationship] = useState<IDropdownProps[]>([]);
  const [housingType, setHousingType] = useState<IDropdownProps[]>([]);
  const [typesChargesList, setTypesChargesList] = useState<IDropdownProps[]>(
    []
  );
  const [epsList, setEpsList] = useState<IDropdownProps[]>([]);
  const [arlList, setArlList] = useState<IDropdownProps[]>([]);
  const [pensionList, setPensionList] = useState<IDropdownProps[]>([]);
  const [layoffList, setLayoffList] = useState<IDropdownProps[]>([]);
  const [levelRiskList, setLevelRiskList] = useState<IDropdownProps[]>([]);
  const [accountType, setAccountType] = useState<IDropdownProps[]>([]);
  const [bankList, setBankList] = useState<IDropdownProps[]>([]);
  const [stateWorker, setStateWorker] = useState<IDropdownProps[]>([]);
  const [typesVinculation, setTypesVinculation] = useState<IDropdownProps[]>(
    []
  );
  const [relationShip, setRelationShip] = useState<IDropdownProps[]>([]);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 1000,
  });

  async function loadInitList(): Promise<void> {
    const groupers = [
      "GENEROS",
      "TIPOS_DOCUMENTOS",
      "TIPO_SANGUINEO",
      "ESTRATO",
      "PARENTESCO",
      "TIPO_VIVIENDA",
      "PAISES",
      "EPS",
      "ARL",
      "FONDO_PENSIONES",
      "FONDO_CESANTIAS",
      "RIESGO_LABORAL",
      "ESTADO_TRABAJADOR",
      "TIPO_CUENTA",
      "BANCO",
      "BARRIOS",
      "MUNICIPIOS",
      "DEPARTAMENTOS",
      "PARENTESCO",
    ];

    const response = await getListByGroupers(groupers);

    if (response.operation.code === EResponseCodes.OK) {
      setTypeDocumentList(
        response.data
          .filter((grouper) => grouper.grouper == "TIPOS_DOCUMENTOS")
          .map((item) => {
            const list = {
              name: item.itemCode,
              value: item.itemCode,
            };
            return list;
          })
      );
      setGenderList(
        response.data
          .filter((grouper) => grouper.grouper == "GENEROS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setBloodType(
        response.data
          .filter((grouper) => grouper.grouper == "TIPO_SANGUINEO")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setSocioEconomicStatus(
        response.data
          .filter((grouper) => grouper.grouper == "ESTRATO")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setRelationship(
        response.data
          .filter((grouper) => grouper.grouper == "PARENTESCO")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setHousingType(
        response.data
          .filter((grouper) => grouper.grouper == "TIPO_VIVIENDA")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setNacionality(
        response.data
          .filter((grouper) => grouper.grouper == "PAISES")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setDeparmentList(
        response.data
          .filter((grouper) => grouper.grouper == "DEPARTAMENTOS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setTownList(
        response.data
          .filter((grouper) => grouper.grouper == "MUNICIPIOS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setNeighborhoodList(
        response.data
          .filter((grouper) => grouper.grouper == "BARRIOS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setEpsList(
        response.data
          .filter((grouper) => grouper.grouper == "EPS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setArlList(
        response.data
          .filter((grouper) => grouper.grouper == "ARL")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setPensionList(
        response.data
          .filter((grouper) => grouper.grouper == "FONDO_PENSIONES")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setLayoffList(
        response.data
          .filter((grouper) => grouper.grouper == "FONDO_CESANTIAS")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setLevelRiskList(
        response.data
          .filter((grouper) => grouper.grouper == "RIESGO_LABORAL")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setStateWorker(
        response.data
          .filter((grouper) => grouper.grouper == "ESTADO_TRABAJADOR")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setAccountType(
        response.data
          .filter((grouper) => grouper.grouper == "TIPO_CUENTA")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setBankList(
        response.data
          .filter((grouper) => grouper.grouper == "BANCO")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
      setRelationShip(
        response.data
          .filter((grouper) => grouper.grouper == "PARENTESCO")
          .map((item) => {
            const list = {
              name: item.itemDescription,
              value: item.itemCode,
            };
            return list;
          })
      );
    }
  }

  useEffect(() => {
    getCharges()
      .then((response: ApiResponse<ICharge[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTypesChargesList(
            response.data
              .filter((charge) => charge.state)
              .map((item) => {
                const list = {
                  name: item?.name,
                  value: item.id,
                };
                return list;
              })
          );

          setChargesInfo(response.data);
        }
      })
      .catch((err) => {});

    loadDependences();
    loadInitList();
  }, []);

  useEffect(() => {
    getTypesContracts()
      .then((response: ApiResponse<ITypesContracts[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTypesVinculation(
            response.data.map((item) => {
              const list = {
                name: item?.name,
                value: item.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, []);
  const loadDependences = async (): Promise<void> => {
    const { data, operation } = await getDependences();

    if (operation.code === EResponseCodes.OK) {
      const dependencesList = data.map((dependence) => {
        return { name: dependence?.name, value: dependence.id };
      }) as IDropdownProps[];

      setDependencesList(dependencesList);
    } else {
      setDependencesList([]);
    }
  };
  const {
    handleSubmit,
    register,
    formState: { errors },
    control,
    reset,
    getValues,
  } = useForm<IFilterVinculation>();
  const tableColumns: ITableElement<IGetVinculationEmployment>[] = [
    {
      fieldName: "numberDocument",
      header: "Tipo y # documento",
      renderCell: (row) => {
        return <>{row.worker.typeDocument + " " + row.worker.numberDocument}</>;
      },
    },
    {
      fieldName: "firstName",
      header: "Nombres y Apellidos",
      renderCell: (row) => {
        return (
          <>
            {row.worker.firstName +
              " " +
              row.worker.secondName +
              " " +
              row.worker.surname +
              " " +
              row.worker.secondSurname}
          </>
        );
      },
    },
    {
      fieldName: "employment.typesContracts",
      header: "Tipo de vinculación",
      renderCell: (row) => {
        return <>{row?.typesContracts[0]?.name}</>;
      },
    },
    {
      fieldName: "employment.startDate",
      header: "Fecha inicio",
      renderCell: (row) => {
        return <>{row.startDate}</>;
      },
    },
    {
      fieldName: "employment.endDate",
      header: "Fecha fin",
      renderCell: (row) => {
        return <>{row.endDate}</>;
      },
    },
    {
      fieldName: "employment.retirementDate",
      header: "Fecha retiro",
      renderCell: (row) => {
        return (
          <>{row.retirementDate ? row.retirementDate : "Sin fecha de retiro"}</>
        );
      },
    },
    {
      fieldName: "employment.state",
      header: "Estado",
      renderCell: (row) => {
        return <>{row.state !== "0" ? "Activo" : "Inactivo"}</>;
      },
    },
  ];
  const tableActions: ITableAction<IGetVinculationEmployment>[] = [
    {
      icon: "Detail",
      onClick: (row) => {
        navigate(`./view/${row.id}`);
      },
      hide: !validateActionAccess("NMN_CONSULTAR_TRABAJADOR"),
    },
    {
      icon: "Edit",
      onClick: (row) => {
        if (row.state !== "0") {
          navigate(`./edit/${row.id}`);
        } else if (validateActionAccess("HABILITAR_EXPEDIENTE")) {
          navigate(`./edit/${row.id}`);
        } else {
          setMessage({
            title: "Vinculación inactiva",
            description: `No se permite editar la vinculación debido a su estado inactiva.`,
            show: true,
            OkTitle: "Aceptar",
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
        }
      },
      hide: !validateActionAccess("NMN_TRABAJADOR_CONTRATAR"),
    },
  ];

  function loadTableData(searchCriteria?: object): void {
    if (tableComponentRef.current) {
      tableComponentRef.current.loadData(searchCriteria);
    }
  }

  async function exportDataVinculation() {
    try {
      const res = await getReport(filters);

      if (res && res.operation?.code === EResponseCodes.OK) {
        const excelData = res.data.array
          .map((row) => {
            const principalData = {
              "tipo de documento":
                typeDocumentList.find((i) => i.value == row.worker.typeDocument)
                  ?.name ?? "",
              "número de documento": row.worker.numberDocument,
              "código fiscal": row.worker.fiscalIdentification ?? "",
              "primer nombre": row.worker.firstName,
              "segundo nombre": row.worker.secondName,
              "primer apellido": row.worker.surname,
              "segundo apellido": row.worker.secondSurname,
              RH:
                bloodType.find((i) => i.value == row.worker.bloodType)?.name ??
                "",
              género:
                genderList.find((i) => i.value == row.worker.gender)?.name ??
                "",
              "fecha nacimiento": row.worker.birthDate,
              nacionalidad:
                nacionality.find((i) => i.value == row.worker.nationality)
                  ?.name ?? "",
              departamento:
                deparmentList.find((i) => i.value == row.worker.department)
                  ?.name ?? "",
              municipio:
                townList.find((i) => i.value == row.worker.municipality)
                  ?.name ?? "",
              barrio: row.worker.neighborhood ?? "",
              dirección: row.worker.address,
              estrato:
                socioEconomicStatus.find(
                  (i) => i.value == row.worker.socioEconomic
                )?.name ?? "",
              "tipo de vivienda":
                housingType.find((i) => i.value == row.worker.housingType)
                  ?.name ?? "",
              "numero de contacto": row.worker.contactNumber,
              "correo electrónico": row.worker.email,
              "tipo de vinculación":
                typesVinculation.find((i) => i.value == row.idTypeContract)
                  ?.name ?? "",
              "número contracto / resolución": row.contractNumber,
              estado: stateWorker.find((i) => i.value == row.state)?.name ?? "",
              dependencia:
                dependencesList.find((i) => i.value == row.codDependence)
                  ?.name ?? "",
              cargo:
                chargesInfo.find((i) => Number(i.id) == Number(row.idCharge))
                  ?.name ?? "",
              "fecha inicio": row.startDate,
              "fecha fin": row.endDate,
              antigüedad: calculateDifferenceYear(
                row.startDate,
                row.endDate ?? new Date()
              ),
              "correo institucional": row.institutionalMail,
              "valor total": row.totalValue,
              "valor mensual":
                chargesInfo.find((i) => Number(i.id) == Number(row.idCharge))
                  .baseSalary ?? 0,
              "objeto contractual": row.contractualObject,
              eps: epsList.find((i) => i.value == row.worker.eps)?.name ?? "",
              "fondo de pensión":
                pensionList.find((i) => i.value == row.worker.fundPension)
                  ?.name ?? "",
              arl: arlList.find((i) => i.value == row.worker.arl)?.name ?? "",
              "nivel de riesgo":
                levelRiskList.find((i) => i.value == row.worker.riskLevel)
                  ?.name ?? "",
              "fondo de cesantías":
                layoffList.find((i) => i.value == row.worker.severanceFund)
                  ?.name ?? "",
              "numero de cuenta": row.worker.accountBankNumber,
              "tipo de cuenta":
                accountType.find((i) => i.value == row.worker.accountBankType)
                  ?.name ?? "",
              banco:
                bankList.find((i) => i.value == row.worker.bank)?.name ?? "",
            };

            if (row.worker.relatives && row.worker.relatives.length > 0) {
              const relativesData = row.worker.relatives.map((relative) => ({
                ...principalData,
                "nombre familiar": relative.name,
                parentesco:
                  relationShip.find((el) => el.value == relative.relationship)
                    ?.name ?? "",
                "tipo de documento del familiar": relative.typeDocument,
                "numero de documento": relative.numberDocument,
                género:
                  genderList.find((el) => el.value == relative.gender)?.name ??
                  "",
                "fecha de nacimiento": relative.birthDate,
                dependiente: relative.dependent ? "Si" : "No",
              }));

              // Concatenar los datos de relatives al array principalData
              return [...relativesData];
            } else {
              // No hay relatives, devolver solo los datos de principalData
              return [principalData];
            }
          })
          .flat(); // Utilizar flat para aplanar el array de arrays

        const book = XLSX.utils.book_new();
        const sheet = XLSX.utils.json_to_sheet(excelData);
        XLSX.utils.book_append_sheet(book, sheet, `expedientes`);

        await new Promise<void>((resolve) => {
          XLSX.writeFile(book, `expedientes.xlsx`);
          resolve();
        });

        setMessage({
          title: "Descargar",
          description: "Información descargada exitosamente",
          OkTitle: "Cerrar",
          show: true,
          type: EResponseCodes.OK,
          background: true,
          onOk() {
            setMessage({});
          },
          onClose() {
            setMessage({});
          },
        });
      }
    } catch (error) {
      setMessage({
        title: "Error al Descargar",
        description: "Ocurrio un error en la descarga",
        OkTitle: "Cerrar",
        show: true,
        type: EResponseCodes.OK,
        background: true,
        onOk() {
          setMessage({});
        },
        onClose() {
          setMessage({});
        },
      });
      console.error("Error en la exportación de datos:", error);
      // Manejar el error según tus necesidades
    }
  }

  const onSubmit = handleSubmit(async (data: IFilterVinculation) => {
    const names = removeEmptySpace(data?.name);
    const surNames = removeEmptySpace(data.lastName);
    const datafilter = {
      ...data,
      firtsName: names.length > 0 ? names[0] : "",
      secondName: names.length > 1 ? names[1] : "",
      surname: surNames.length > 0 ? surNames[0] : "",
      secondSurname: surNames.length > 1 ? surNames[0] : "",
    };
    loadTableData(datafilter);
    setFilters({ ...datafilter, page: 1, perPage: 1000 });
  });
  return {
    onSubmit,
    register,
    errors,
    control,
    activeWorker,
    typesContracts,
    exportDataVinculation,
    reset,
    tableComponentRef,
    tableColumns,
    tableActions,
  };
}
