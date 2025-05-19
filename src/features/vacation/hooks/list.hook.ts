import { useEffect, useState } from "react";
import { EResponseCodes } from "../../../common/constants/api.enum";
import { ApiResponse } from "../../../common/utils/api-response";
import { useGenericListService } from "../../../common/hooks/generic-list-service.hook";
import { IGenericList } from "../../../common/interfaces/global.interface";
import usePayrollService from "../../../common/hooks/payroll-service.hook";
import {
  IEmployment,
  IEmploymentWorker,
  IFormPeriod,
  IIncapacityTypes,
  IReasonsForWithdrawal,
  IVacationPeriods,
  IWorker,
} from "../../../common/interfaces/payroll.interfaces";
import useIncapacityService from "../../../common/hooks/incapacity-service.hook";
import useVacationService from "../../../common/hooks/vacation-service.hook";
import { IDropdownProps } from "../../../common/interfaces/select.interface";


export default function useListData(includeTemporary?) {
  const [listPeriods, setListPeriods] = useState([]);
  const [activeWorkerList, setActiveWorkerList] = useState([]);
  const [inactiveWorkerList, setInactiveWorkerList] = useState([]);
  const [activeContractorsList, setActiveContractorsList] = useState([]);
  const [allContractorsList, setAllContractorsList] = useState([]);
  const [typesIncapacityList, setTypesIncapacityList] = useState([]);
  const [vacationPeriods, setVacationPeriods] = useState<IVacationPeriods[]>(
    []
  );
  const [reasonsForWithdrawal, setReasonsForWithdrawal] = useState([]);
  const [periodsList, setPeriodsList] = useState([]);
  const [periodsListBiweeklyAuthorized, setPeriodsListBiweeklyAuthorized] =
    useState([]);
  const [periodsListVacationAuthorized, setPeriodsListVacationAuthorized] =
    useState([]);
  const [workerInfo, setWorkerInfo] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [workerActives, setWorkerActives] = useState([]);
  const [workerActivesInfo, setWorkerActivesInfo] = useState<IEmployment[]>([]);
  const [typesSpreadSheetList, setTypesSpreadSheetList] = useState([]);
  const stateSpreadSheetList = [
    {
      name: "Pendientes",
      value: "Pendiente",
    },
    {
      name: "Generadas",
      value: "Generada",
    },
    {
      name: "Autorizadas",
      value: "Autorizada",
    },
  ];
  const monthList = [
    {
      value: 1,
      name: "Enero",
    },
    {
      value: 2,
      name: "Febrero",
    },
    {
      value: 3,
      name: "Marzo",
    },
    {
      value: 4,
      name: "Abril",
    },
    {
      value: 5,
      name: "Mayo",
    },
    {
      value: 6,
      name: "Junio",
    },
    {
      value: 7,
      name: "Julio",
    },
    {
      value: 8,
      name: "Agosto",
    },
    {
      value: 9,
      name: "Septiembre",
    },
    {
      value: 10,
      name: "Octubre",
    },
    {
      value: 11,
      name: "Noviembre",
    },
    {
      value: 12,
      name: "Diciembre",
    },
  ];

  const { getListByGrouper } = useGenericListService();
  const {
    getWorkers,
    getReasonsForWithdrawal,
    getPeriods,
    getTypeSpreadSheet,
    getContractors,
    getInactiveWorkers,
    getVacationPeriods,
    getAllWorkers,
    getAllActives,
  } = usePayrollService();
  const { typeIncapacity } = useIncapacityService();
  const { getPeriodVacationByEmployment } = useVacationService();

  useEffect(() => {
    const yearList: IDropdownProps[] = [];
    for (let year = 2023; year <= new Date().getFullYear() + 1; year++) {
      yearList.push({ name: String(year), value: year });
    }
    setListPeriods(yearList)
  }, []);

  const getWorkersActive = async () => {
    await getWorkers(includeTemporary ?? false)
      .then((response: ApiResponse<IWorker[]>) => {
        if (response.operation.code === EResponseCodes.OK) {
          setWorkerInfo(response.data);
          setActiveWorkerList(
            response.data.map((item) => {
              const list = {
                name: `${
                  item.numberDocument +
                  " - " +
                  item.firstName +
                  " " +
                  item.surname
                }`,
                value: item.employment.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getAllWorkers()
      .then((response: ApiResponse<IEmploymentWorker[]>) => {
        if (response.operation.code === EResponseCodes.OK) {
          setAllWorkers(
            response.data.map((item) => {
              const list = {
                name: `${
                  item.worker.numberDocument +
                  " - " +
                  item.worker.firstName +
                  " " +
                  item.worker.surname
                }`,
                value: item.worker.employment.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, []);

  const getAllWorkersActives = async () => {
    getAllActives()
      .then((response: ApiResponse<IEmployment[]>) => {
        if (response.operation.code === EResponseCodes.OK) {
          setWorkerActivesInfo(response.data);
          setWorkerActives(
            response.data.map((item) => {
              return {
                name: `${
                  item.worker.numberDocument +
                  " - " +
                  item.worker.firstName +
                  " " +
                  item.worker.surname
                }`,
                value: item.id,
              };
            })
          );
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getAllWorkersActives();
  }, []);

  useEffect(() => {
    getWorkersActive();
  }, []);

  useEffect(() => {
    getInactiveWorkers()
      .then((response: ApiResponse<IWorker[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setInactiveWorkerList(
            response.data.map((item) => {
              const list = {
                name: `${
                  item.numberDocument +
                  " - " +
                  item.firstName +
                  " " +
                  item.surname
                }`,
                value: item.employment.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  }, []);
  useEffect(() => {
    getPeriodVacationByEmployment()
      .then((response: ApiResponse<IVacationPeriods[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setVacationPeriods(response.data);
        }
      })
      .catch((err) => {});
  }, []);

  const getContractorsActive = () => {
    getContractors()
      .then((response: ApiResponse<IWorker[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setWorkerInfo(response.data);
          setActiveContractorsList(
            response.data
              .map((item) => {
                if (item.employment.state == "1") {
                  const list = {
                    name: `${
                      item.numberDocument +
                      " - " +
                      item.firstName +
                      " " +
                      item.surname
                    }`,
                    value: item.employment.id,
                  };
                  return list;
                }
              })
              .filter((i) => i)
          );
          setAllContractorsList(
            response.data.map((item) => {
              const list = {
                name: `${
                  item.numberDocument +
                  " - " +
                  item.firstName +
                  " " +
                  item.surname
                }`,
                value: item.id,
              };
              return list;
            })
          );
        }
      })
      .catch((err) => {});
  };

  useEffect(() => {
    getContractorsActive();
  }, []);
  useEffect(() => {
    getReasonsForWithdrawal()
      .then((response: ApiResponse<IReasonsForWithdrawal[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setReasonsForWithdrawal(
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
    getTypeSpreadSheet()
      .then((response) => {
        const { data, operation } = response;

        if (operation.code === EResponseCodes.OK) {
          const listSpreadSheet = data.map((item) => {
            return {
              name: item.name,
              value: item.id,
            };
          });

          setTypesSpreadSheetList(listSpreadSheet);
        } else {
          setTypesSpreadSheetList([]);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    getPeriods()
      .then((response: ApiResponse<IFormPeriod[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setPeriodsList(
            response.data.map((item) => {
              const list = {
                name: `${item.dateStart} - ${item.dateEnd} - ${item.formsType[0].name}`,
                value: item.id,
              };
              return list;
            })
          );

          setPeriodsListBiweeklyAuthorized(
            response.data
              .map((item) => {
                if (item.state === "Autorizada" && item.idFormType === 1) {
                  const list = {
                    name: `${item.dateStart} - ${item.dateEnd} - ${item.formsType[0].name}`,
                    value: item.id,
                  };
                  return list;
                }
              })
              .filter((i) => i)
          );
        }
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    getVacationPeriods()
      .then((response: ApiResponse<IFormPeriod[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setPeriodsList(
            response.data.map((item) => {
              const list = {
                name: `${item.dateStart} - ${item.dateEnd}`,
                value: item.id,
              };
              return list;
            })
          );

          setPeriodsListVacationAuthorized(
            response.data
              .map((item) => {
                if (item.state === "Autorizada") {
                  const list = {
                    name: `${item.dateStart} - ${item.dateEnd} - ${item.formsType[0].name}`,
                    value: item.id,
                  };
                  return list;
                }
              })
              .filter((i) => i)
          );
        }
      })
      .catch((err) => {});
  }, []);

  useEffect(() => {
    typeIncapacity()
      .then((response: ApiResponse<IIncapacityTypes[]>) => {
        if (response && response?.operation?.code === EResponseCodes.OK) {
          setTypesIncapacityList(
            response.data.map((item) => {
              return { name: item.name, value: item.id };
            })
          );
        }
      })
      .catch((err) => {});
  }, []);

  return {
    activeWorkerList,
    activeContractorsList,
    inactiveWorkerList,
    listPeriods,
    typesIncapacityList,
    reasonsForWithdrawal,
    periodsList,
    vacationPeriods,
    typesSpreadSheetList,
    stateSpreadSheetList,
    monthList,
    getWorkersActive,
    workerInfo,
    periodsListBiweeklyAuthorized,
    periodsListVacationAuthorized,
    allWorkers,
    setAllWorkers,
    workerActives,
    workerActivesInfo,
    allContractorsList,
  };
}
