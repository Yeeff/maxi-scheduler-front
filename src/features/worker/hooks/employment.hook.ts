import React, { useContext, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";

import { AppContext } from "../../../common/contexts/app.context";
import { ApiResponse } from "../../../common/utils/api-response";

import {
  ICharge,
  IVinculation,
  ITypesContracts,
  IRelative,
  IWorker,
} from "../../../common/interfaces/payroll.interfaces";
import { IGenericList } from "../../../common/interfaces/global.interface";
import { EResponseCodes } from "../../../common/constants/api.enum";

import {
  formsPayroll,
  formsPayrollEdit,
} from "../../../common/schemas/employment-schema";

import { useGenericListService } from "../../../common/hooks/generic-list-service.hook";

import usePayrollService from "../../../common/hooks/payroll-service.hook";
import useDependenceService from "../../../common/hooks/dependencies-service.hook";
import {
  calculateDifferenceAdjustDays,
  calculateDifferenceDays,
  calculateDifferenceYear,
  calculateMonthBetweenDates,
} from "../../../common/utils/helpers";
import { IDropdownProps } from "../../../common/interfaces/select.interface";

interface IPropsUseEmployments {
  action?: string;
}

const useEmployments = ({ action }: IPropsUseEmployments) => {
  // react router dom
  const { id } = useParams();
  const navigate = useNavigate();

  // context
  const {
    step,
    setStep,
    setMessage,
    setSpinner,
    authorization,
    validateActionAccess,
  } = useContext(AppContext);

  // states
  const [genderList, setGenderList] = useState([]);
  const [chargesInfo, setChargesInfo] = useState<ICharge[]>([]);
  const [dependencesList, setDependencesList] = useState<IDropdownProps[]>([]);
  const [typeDocumentList, setTypeDocumentList] = useState([]);
  const [deparmentList, setDeparmentList] = useState([]);
  const [nacionality, setNacionality] = useState([]);
  const [townList, setTownList] = useState([]);
  const [neighborhoodList, setNeighborhoodList] = useState([]);
  const [sending, setSending] = useState(false);
  const [socioEconomicStatus, setSocioEconomicStatus] = useState([]);
  const [bloodType, setBloodType] = useState([]);
  const [relationship, setRelationship] = useState([]);
  const [housingType, setHousingType] = useState([]);
  const [typesChargesList, setTypesChargesList] = useState([]);
  const [epsList, setEpsList] = useState([]);
  const [arlList, setArlList] = useState([]);
  const [pensionList, setPensionList] = useState([]);
  const [layoffList, setLayoffList] = useState([]);
  const [levelRiskList, setLevelRiskList] = useState([]);
  const [typesContracts, setTypesContracts] = useState([]);
  const [activeWorker, setActiveWorker] = useState([]);
  const [accountType, setAccountType] = useState([]);
  const [bankList, setBankList] = useState([]);

  const [vinculation, setVinculation] = useState<IVinculation>({
    worker: {
      id: null,
      typeDocument: "",
      numberDocument: "",
      firstName: "",
      secondName: "",
      surname: "",
      secondSurname: "",
      gender: "",
      bloodType: "",
      birthDate: "",
      nationality: "",
      email: "",
      contactNumber: "",
      department: "",
      municipality: "",
      neighborhood: "",
      address: "",
      socioEconomic: "",
      eps: "",
      fundPension: "",
      severanceFund: "",
      arl: "",
      riskLevel: "",
      housingType: "",
      fiscalIdentification: "",
    },
    relatives: [],
    employment: {
      codDependence: null,
      idTypeContract: "",
      contractNumber: "",
      institutionalMail: "",
      specificObligations: "",
      contractualObject: "",
      startDate: "",
      endDate: "",
      idCharge: "",
      idReasonRetirement: "",
      state: "",
      settlementPaid: null,
    },
  } as IVinculation);

  //custom hooks
  const { getListByParent, getListByGroupers } = useGenericListService();
  const {
    getVinculationById,
    getCharges,
    getTypesContracts,
    createWorker,
    updateWorker,
    getWorkersByDocument,
  } = usePayrollService();

  const { getDependences } = useDependenceService();

  //react-hook-form
  const currentValidationSchema = action == "new" ? formsPayroll[step] : formsPayrollEdit[step];

  const {
    register,
    formState: { errors, isValid, dirtyFields },
    control,
    getValues: getValueRegister,
    handleSubmit,
    trigger,
    watch,
    setValue: setValueRegister,
    reset,
    getFieldState,
  } = useForm<IVinculation>({
    defaultValues: vinculation,
    //resolver: yupResolver(currentValidationSchema),
    mode: "all",
  });

  const [department, municipality, documentNumber] = watch([
    "worker.department",
    "worker.municipality",
    "worker.numberDocument",
  ]);

  const [idTypeContract, idCharge, startDate, endDate, totalValue, salary] =
    watch([
      "employment.idTypeContract",
      "employment.idCharge",
      "employment.startDate",
      "employment.endDate",
      "employment.totalValue",
      "employment.salary",
    ]);

  // useEffect

  //Validar tipo de contrato

  /*useEffect(() => {
    if (Number(idTypeContract) === 4) {
      if (idCharge) {
        const infoChargeSelected = chargesInfo.find(
          (i) => i.id === Number(idCharge)
        );

        setValueRegister(
          "employment.salary",
          Math.round(infoChargeSelected.baseSalary)
        );
      }

      if (startDate && endDate && salary) {
        const days = calculateDifferenceAdjustDays(startDate, endDate);

        // if (days > 30) {
        const salaryMonth = (salary / 30) * days;

        setValueRegister("employment.totalValue", Math.round(salaryMonth));
        // } else {
        //   setValueRegister("employment.totalValue", totalValue);
        // }
      } else {
        setValueRegister("employment.totalValue", 0);
      }
    } else {
      setValueRegister("employment.totalValue", 0);

      if (idCharge) {
        const infoChargeSelected = chargesInfo.find(
          (i) => i.id === Number(idCharge)
        );

        setValueRegister("employment.salary", infoChargeSelected.baseSalary);
      } else {
        setValueRegister("employment.salary", 0);
      }
    }
  }, [idTypeContract, idCharge, startDate, endDate, salary]);*/

  /*useEffect(() => {
    if (dirtyFields.employment?.idTypeContract) {
      setValueRegister("employment.endDate", null, { shouldValidate: true });
    }
  }, [idTypeContract]);*/

  useEffect(() => {
    const { worker } = getValueRegister();
 
    if (action == "new") {
      if (
        !getFieldState("worker.numberDocument").invalid &&
        !getFieldState("worker.numberDocument").error &&
        worker.numberDocument != ""
      ) {
        getWorkersByDocument(worker.numberDocument).then(
          ({ data, operation }: ApiResponse<IWorker[]>) => {
            if (operation.code === EResponseCodes.OK) {
              if (data.length && data[0].employment?.state == "1")
                setMessage({
                  title: `Usuario ya Registrado`,
                  show: true,
                  description:
                    "El número de documento ya tiene una vinculación vigente",
                  OkTitle: "Aceptar",
                  background: true,
                  type: EResponseCodes.WARN,
                });
              data.map((employee) => {
                setVinculation({
                  worker: {
                    id: employee.id,
                    typeDocument: employee.typeDocument,
                    numberDocument: worker.numberDocument,
                    firstName: employee.firstName,
                    secondName: employee.secondName,
                    surname: employee.surname,
                    secondSurname: employee.secondSurname,
                    gender: employee.gender,
                    bloodType: employee.bloodType,
                    birthDate: employee.birthDate,
                    nationality: employee.nationality,
                    email: employee.email,
                    contactNumber: employee.contactNumber,
                    department: employee.department,
                    municipality: employee.municipality,
                    neighborhood: employee.neighborhood,
                    address: employee.address,
                    socioEconomic: employee.socioEconomic,
                    eps: employee.eps,
                    fundPension: employee.fundPension,
                    severanceFund: employee.severanceFund,
                    arl: employee.arl,
                    riskLevel: employee.riskLevel,
                    housingType: employee.housingType,
                    fiscalIdentification: employee.fiscalIdentification,
                    bank: employee?.bank,
                    accountBankNumber: employee?.accountBankNumber,
                    accountBankType: employee?.accountBankType,
                  },
                  relatives: employee.relatives,
                  employment: {
                    codDependence: employee.employment.codDependence,
                    idTypeContract: employee.employment.idTypeContract,
                    contractNumber: employee.employment.contractNumber,
                    isResponsibleForDependency:
                      employee.employment.isResponsibleForDependency,
                    institutionalMail: employee.employment.institutionalMail,
                    specificObligations:
                      employee.employment.specificObligations,
                    contractualObject: employee.employment.contractualObject,
                    startDate: employee.employment.startDate,
                    endDate: employee.employment.endDate,
                    idCharge: employee.employment.idCharge,
                    idReasonRetirement: employee.employment.idReasonRetirement,
                    state: employee.employment.state,
                    settlementPaid: employee.employment.settlementPaid,
                  },
                } as IVinculation);
              });
            } else {
              setVinculation({
                worker: {
                  id: null,
                  typeDocument: "",
                  numberDocument: worker.numberDocument,
                  firstName: "",
                  secondName: "",
                  surname: "",
                  secondSurname: "",
                  gender: "",
                  bloodType: "",
                  birthDate: "",
                  nationality: "",
                  email: "",
                  contactNumber: "",
                  department: "",
                  municipality: "",
                  neighborhood: "",
                  address: "",
                  socioEconomic: "",
                  eps: "",
                  fundPension: "",
                  severanceFund: "",
                  arl: "",
                  riskLevel: "",
                  housingType: "",
                  fiscalIdentification: "",
                  bank: "",
                  accountBankNumber: "",
                  accountBankType: "",
                },
                relatives: [],
                employment: {
                  codDependence: null,
                  isResponsibleForDependency: false,
                  idTypeContract: "",
                  contractNumber: "",
                  institutionalMail: "",
                  specificObligations: "",
                  contractualObject: "",
                  startDate: "",
                  endDate: "",
                  idCharge: "",
                  idReasonRetirement: "",
                  state: "",
                  settlementPaid: null,
                },
              } as IVinculation);
            }
          }
        );
      } else {
        setVinculation({
          worker: {
            id: null,
            typeDocument: worker.typeDocument ?? "",
            numberDocument: worker.numberDocument,
            firstName: "",
            secondName: "",
            surname: "",
            secondSurname: "",
            gender: "",
            bloodType: "",
            birthDate: "",
            nationality: "",
            email: "",
            contactNumber: "",
            department: "",
            municipality: "",
            neighborhood: "",
            address: "",
            socioEconomic: "",
            eps: "",
            fundPension: "",
            severanceFund: "",
            arl: "",
            riskLevel: "",
            housingType: "",
            fiscalIdentification: "",
            bank: "",
            accountBankNumber: "",
            accountBankType: "",
          },
          relatives: [],
          employment: {
            codDependence: null,
            isResponsibleForDependency: false,
            idTypeContract: "",
            contractNumber: "",
            institutionalMail: "",
            specificObligations: "",
            contractualObject: "",
            startDate: "",
            endDate: "",
            idCharge: "",
            idReasonRetirement: "",
            state: "",
            settlementPaid: null,
          },
        } as IVinculation);
      }
    }
  }, [documentNumber]);

  // departments
  useEffect(() => {
    getListByParent({ grouper: "DEPARTAMENTOS", parentItemCode: "COL" })
      .then((response: ApiResponse<IGenericList[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setDeparmentList(
            response.data.map((item) => {
              const list = {
                name: item.itemDescription,
                value: item.itemCode,
              };
              return list;
            })
          );
        }
      })
      .catch((e) => {});
  }, []);

  useEffect(() => {
    if (dirtyFields.worker?.department) {
      setValueRegister("worker.municipality", "");
      setValueRegister("worker.neighborhood", "");
    }
    setTownList([]);
    setNeighborhoodList([]);

    getListByParent({ grouper: "MUNICIPIOS", parentItemCode: department })
      .then((response: ApiResponse<IGenericList[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTownList(
            response.data.map((item) => {
              const list = {
                name: item.itemDescription,
                value: item.itemCode,
              };

              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, [department]);

  useEffect(() => {
    if (dirtyFields.worker?.municipality) {
      setValueRegister("worker.neighborhood", "");
    }
    setNeighborhoodList([]);

    getListByParent({ grouper: "BARRIOS", parentItemCode: municipality })
      .then((response: ApiResponse<IGenericList[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setNeighborhoodList(
            response.data.map((item) => {
              const list = {
                name: item.itemDescription,
                value: item.itemCode,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, [municipality]);

  useEffect(() => {}, []);

  useEffect(() => {
    getTypesContracts()
      .then((response: ApiResponse<ITypesContracts[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTypesContracts(
            response.data.map((item) => {
              const list = {
                name: item.name,
                value: item.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    getCharges()
      .then((response: ApiResponse<ICharge[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTypesChargesList(
            response.data
              .filter((charge) => charge.state)
              .map((item) => {
                const list = {
                  name: item.name,
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
  }, []);

  useEffect(() => {
    if (idTypeContract) {
      setTypesChargesList(
        chargesInfo
          .filter(
            (charge) =>
              charge.codContractType == Number(idTypeContract) && charge.state
          )
          .map((item) => {
            const list = {
              name: item.name,
              value: item.id,
            };
            return list;
          })
      );
    }
  }, [idTypeContract]);

  useEffect(() => {
    loadInitList().then(() => {
      if (id) {
        getVinculationById(Number(id)).then(
          ({ data, operation }: ApiResponse<IVinculation>) => {
            if (operation.code === EResponseCodes.OK) {
              setVinculation(data);
            }
          }
        );
      } else {
        setVinculation({
          worker: {
            id: null,
            typeDocument: "",
            numberDocument: "",
            firstName: "",
            secondName: "",
            surname: "",
            secondSurname: "",
            gender: "",
            bloodType: "",
            birthDate: "",
            nationality: "",
            email: "",
            contactNumber: "",
            department: "",
            municipality: "",
            neighborhood: "",
            address: "",
            socioEconomic: "",
            eps: "",
            fundPension: "",
            severanceFund: "",
            arl: "",
            riskLevel: "",
            housingType: "",
            fiscalIdentification: "",
          },
          relatives: [],
          employment: {
            codDependence: null,
            isResponsibleForDependency: false,
            idTypeContract: "",
            contractNumber: "",
            institutionalMail: "",
            specificObligations: "",
            contractualObject: "",
            startDate: "",
            endDate: "",
            idCharge: "",
            idReasonRetirement: "",
            state: "",
            settlementPaid: null,
          },
        } as IVinculation);
      }
    });
  }, [id]);

  useEffect(() => {
    setStep(0);
  }, [action]);

  useEffect(() => {
    if (!vinculation) return;

    if (
      action === "edit" &&
      vinculation.employment?.state === "0" &&
      !validateActionAccess("HABILITAR_EXPEDIENTE")
    ) {
      setMessage({
        title: "Vinculación inactiva",
        description: `No se permite editar la vinculación debido a su estado inactiva.`,
        show: true,
        OkTitle: "Aceptar",
        onOk: () => {
          navigate("../expedientes");
          setMessage((prev) => {
            return { ...prev, show: false };
          });
        },
        onClose: () => {
          navigate("../expedientes");
          setMessage({});
        },
        background: true,
      });

      return;
    }

    if (vinculation.worker.id) {
      setValueRegister("worker", vinculation?.worker, { shouldValidate: true });
    } else {
      setValueRegister("worker", vinculation?.worker);
    }

    const relatives = vinculation?.relatives?.map((relative) => {
      return { ...relative, age: calculateDifferenceYear(relative.birthDate) };
    });

    setValueRegister("relatives", relatives);
    setValueRegister(
      "employment",
      vinculation?.employment[0] ?? vinculation?.employment
    );
  }, [vinculation]);

  /*Functions*/

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
      setActiveWorker(
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
    }
  }

  const loadDependences = async (): Promise<void> => {
    const { data, operation } = await getDependences();

    if (operation.code === EResponseCodes.OK) {
      const dependencesList = data.map((dependence) => {
        return { name: dependence.name, value: dependence.id };
      }) as IDropdownProps[];

      setDependencesList(dependencesList);
    } else {
      setDependencesList([]);
    }
  };

  const handleCreateWorker = async (data: IVinculation) => {
  
    data.worker.birthDate="1982/07/19";
    data.worker.gender="M";
    data.worker.municipality= "1";
    data.worker.department="5";
    data.worker.nationality="COL";
    data.worker.address="calle x # 5 -7"

    data.employment.idCharge="1";
    data.employment.codDependence=5;
    data.employment.isResponsibleForDependency=false;
    data.employment.contractNumber="123456";
    data.employment.idTypeContract= "3";
    data.employment.institutionalMail="testEntity@gmail.com";
    
    console.log(data);
    
    setSending(true);
    setSpinner({
      active: true,
      duration: ".5",
      hidden: false,
    });
    await createWorker(data)
      .then((response: ApiResponse<IVinculation>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          handleModal();
          setSpinner({
            active: false,
            duration: ".5",
            hidden: false,
          });
          setSending(false);
        } else {
          setMessage({
            type: EResponseCodes.FAIL,
            title: "Error al registrar la vinculación.",
            description:
              "Se ha presentado un error, por favor vuelve a intentarlo.",
            show: true,
            OkTitle: "Aceptar",
            background: true,
          });
          setSending(false);
          setSpinner({
            active: false,
            duration: ".5",
            hidden: false,
          });
        }
      })
      .catch((err) => {
        setMessage({
          type: EResponseCodes.FAIL,
          title: "Error al registrar la vinculación.",
          description:
            "Se ha presentado un error, por favor vuelve a intentarlo.",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        setSending(false);
        setSpinner({
          active: false,
          duration: ".5",
          hidden: false,
        });
      });
  };

  const handleUpdateWorker = async (data: IVinculation) => {
    setSending(true);
    setSpinner({
      active: true,
      duration: ".5",
      hidden: false,
    });
    /*await updateWorker(data)
      .then((response: ApiResponse<IVinculation>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          handleModal();
          setSending(false);
        } else {
          setMessage({
            type: EResponseCodes.FAIL,
            title: "Error al editar la vinculación.",
            description:
              "Se ha presentado un error, por favor vuelve a intentarlo.",
            show: true,
            OkTitle: "Aceptar",
            background: true,
          });
          setSending(false);
        }
        setSpinner({
          active: false,
          duration: ".5",
          hidden: false,
        });
      })
      .catch((err) => {
        setMessage({
          type: EResponseCodes.FAIL,
          title: "Error al editar la vinculación.",
          description:
            "Se ha presentado un error, por favor vuelve a intentarlo.",
          show: true,
          OkTitle: "Aceptar",
          background: true,
        });
        setSending(false);
        setSpinner({
          active: false,
          duration: ".5",
          hidden: false,
        });
      });*/
  };

  const handleModal = () => {
    setMessage({
      title: "Vincular Trabajador",
      description: `Trabajador ${
        id ? "editado" : "vinculado"
      } satisfactoriamente`,
      show: true,
      OkTitle: "Aceptar",
      onOk: () => {
        navigate("../expedientes/");
        setMessage((prev) => {
          return { ...prev, show: false };
        });
      },
      onClose: () => {
        navigate("../expedientes/");
        setMessage({});
      },
      background: true,
    });
  };

  return {
    genderList,
    dependencesList,
    typeDocumentList,
    authorization,
    deparmentList,
    townList,
    neighborhoodList,
    sending,
    bloodType,
    housingType,
    socioEconomicStatus,
    relationship,
    nacionality,
    typesChargesList,
    typesContracts,
    arlList,
    epsList,
    layoffList,
    pensionList,
    levelRiskList,
    activeWorker,
    vinculation,
    register,
    errors,
    isValid,
    trigger,
    control,
    handleSubmit,
    setValueRegister,
    step,
    setStep,
    handleCreateWorker,
    handleUpdateWorker,
    getValueRegister,
    watch,
    navigate,
    accountType,
    bankList,
    reset,
    setMessage,
    setSpinner,
  };
};

export default useEmployments;