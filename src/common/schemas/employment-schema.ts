import * as yup from "yup";
import {
  calculateLimiteEdad,
  calculateMayorEdad,
  postRequest,
} from "../utils/helpers";
import { EIncomeType } from "../constants/otherincome.enum";
import { IParameter } from "../interfaces/payroll.interfaces";

const personalInformationLocalization = yup.object({
  worker: yup.object({
      //datospersonales
      typeDocument: yup.string().required("El campo es obligatorio"),
      numberDocument: yup
        .string()
        .required("El campo es obligatorio")
        .matches(/^[0-9]+$/, "Solo se permiten numeros")
        .min(5, "Ingrese al menos 5 caracteres")
      .max(15, "Solo se permiten 15 caracteres")

      // .test(
      //   "El Trabajador no ha sido creado aún",
      //   "El número de documento ya tiene una vinculación vigente",
      //   async (value, context) => {
      //     const { typeDocument } = context.parent;
      //     const verified = await postRequest(
      //       "/api/v1/vinculation/workerByDocument",
      //       { documentNumber: value, typeDocument }
      //     );
      //     if (
      //       verified.data &&
      //       verified.data.length > 0 &&
      //       verified.data[0]?.employment?.state != 0
      //     ) {
      //       return false;
      //     } else {
      //       return true;
      //     }
      //   }
      // ),
      ,
      firstName: yup
        .string()
        .required("El campo es obligatorio")
        .min(1, "Ingrese al menos 1 caracteres")
        .max(50, "Solo se permiten 50 caracteres"),
      secondName: yup
        .string()
        .optional()
        .nullable()
        .max(50, "Solo se permiten 50 caracteres"),
      surname: yup
        .string()
        .required("El campo es obligatorio")
        .min(1, "Ingrese al menos 1 caracteres")
        .max(50, "Solo se permiten 50 caracteres"),
      secondSurName: yup
        .string()
        .optional()
        .max(50, "Solo se permiten 50 caracteres"),
      /*gender: yup.string()
      //.required("El campo es obligatorio"),
      bloodType: yup.string().optional().nullable(),
      birthDate: yup
        .string()
        .required("El campo es obligatorio")
        .typeError("Fecha invalida")
        .test("mayor-edad", "Debe ser mayor de edad", calculateMayorEdad)
        .test("limite-edad", "Debe ser menor de 80 años", calculateLimiteEdad),
      nationality: yup.string().required("El campo es obligatorio"),
      //localizacion
      department: yup.string().required("El campo es obligatorio"),
      municipality: yup.string().required("El campo es obligatorio"),
      address: yup
        .string()
        .max(100, "Solo se permiten 100 caracteres")
        .required("El campo es obligatorio"),
      neighborhood: yup.string().optional().nullable(),
      contactNumber: yup
        .string()
        .matches(/^[0-9]+$/, "Solo se permiten numeros")
        .max(10, "Solo se permiten 10 caracteres")
        .required(),*/
    }),
});

const personalInformationLocalizationEdit = yup.object({
  worker: yup.object({
    //datospersonales
    typeDocument: yup.string().required("El campo es obligatorio"),
    numberDocument: yup
      .string()
      .required("El campo es obligatorio")
      .matches(/^[0-9]+$/, "Solo se permiten numeros")
      .min(5, "Ingrese al menos 5 caracteres")
      .max(15, "Solo se permiten 15 caracteres"),
    firstName: yup
      .string()
      .required("El campo es obligatorio")
      .min(1, "Ingrese al menos 1 caracteres")
      .max(50, "Solo se permiten 50 caracteres"),
    secondName: yup
      .string()
      .optional()
      .nullable()
      .max(50, "Solo se permiten 50 caracteres"),
    surname: yup
      .string()
      .required("El campo es obligatorio")
      .min(1, "Ingrese al menos 1 caracteres")
      .max(50, "Solo se permiten 50 caracteres"),
    secondSurName: yup
      .string()
      .optional()
      .max(50, "Solo se permiten 50 caracteres"),
    gender: yup.string().required("El campo es obligatorio"),
    bloodType: yup.string().optional().nullable(),
    birthDate: yup
      .string()
      .required("El campo es obligatorio")
      .typeError("Fecha invalida")
      .test("mayor-edad", "Debe ser mayor de edad", calculateMayorEdad)
      .test("limite-edad", "Debe ser menor de 80 años", calculateLimiteEdad),
    nationality: yup.string().required("El campo es obligatorio"),
    //localizacion
    department: yup.string().required("El campo es obligatorio"),
    municipality: yup.string().required("El campo es obligatorio"),
    address: yup
      .string()
      .max(100, "Solo se permiten 100 caracteres")
      .required("El campo es obligatorio"),
    neighborhood: yup.string().optional().nullable(),
    contactNumber: yup
      .string()
      .matches(/^[0-9]+$/, "Solo se permiten numeros")
      .max(10, "Solo se permiten 10 caracteres")
      .optional(),
  }),
});

export const familiarValidator = yup.object({
  relatives: yup.array().of(
    yup.object().shape({
      name: yup
        .string()
        .required("El campo es obligatorio")
        .min(8, "Ingrese al menos 8 caracteres"),
      relationship: yup.string().required("El campo es obligatorio"),
      gender: yup.string().required("El campo es obligatorio"),
      age: yup.number().required("El campo es obligatorio"),
      birthDate: yup.string().required("El campo es obligatorio"),
      dependent: yup.boolean().typeError("El campo es obligatorio"),
      typeDocument: yup.string().required("El campo es obligatorio"),
      numberDocument: yup
        .string()
        .max(15, "Solo se permiten 15 caracteres")
        .required("El campo es obligatorio"),
    })
  ),
});

const contractualInformation = yup.object({
  employment: yup.object({
    /*idTypeContract: yup.string().required("El campo es obligatorio"),
    contractNumber: yup
      .string()
      .required("El campo es obligatorio")
      .max(10, "Solo se permiten 10 caracteres"),*/
    state: yup.string().required("El campo es obligatorio"),
    //idCharge: yup.string().required("El campo es obligatorio"),
    startDate: yup
      .string()
      .required("El campo es obligatorio")
      .typeError("Fecha invalida"),
    endDate: yup
      .string()
      //.when("idTypeContract", ([idTypeContract], schema) => {
      //  if (idTypeContract === "4") {
      //    return schema.required("El campo es obligatorio");
      //  } else {
      //    return schema.nullable();
      //  }
      //})
      .typeError("Fecha invalida"),
    /*specificObligations: yup
      .string()
      .nullable()
      .optional()
      .max(10000, "Solo se permiten 10000 caracteres"),
    contractualObject: yup
      .string()
      .nullable()
      .optional()
      .max(5000, "Solo se permiten 5000 caracteres"),
    institutionalMail: yup
      .string()
      .required("El campo es obligatorio")
      .email("El correo es invalido"),*/
    //totalValue: yup.number().optional().nullable(),
    totalValue: yup.number().required(),
    //idReasonRetirement: yup.string().optional(),
    //codDependence: yup.number().optional(),
  }),
});

const afiliaciones = yup.object({
  worker: yup.object({
    //eps: yup.string().required("El campo es obligatorio"),
    //fundPension: yup.string().required("El campo es obligatorio"),
    //arl: yup.string().required("El campo es obligatorio"),
    //riskLevel: yup.string().required("El campo es obligatorio"),
    //severanceFund: yup.string().required("El campo es obligatorio"),
  }),
});

export const searchRecord = yup.object({
  idWorker: yup.number().required("Seleccionar colaborador es obligatorio"),
  period: yup.number().required("Seleccionar un periodo es obligatorio"),
});

export const formsPayroll = [
  personalInformationLocalization,
  familiarValidator,
  contractualInformation,
  //afiliaciones,
];

export const formsPayrollEdit = [
  personalInformationLocalizationEdit,
  familiarValidator,
  contractualInformation,
  //afiliaciones,
];

export const createAndUpdateIncapacity = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
  codIncapacityType: yup.string().required("El campo es obligatorio"),
  dateInitial: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  dateFinish: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  // comments: yup.string().required("El campo es obligatorio"),
});

export const createLicenceSchema = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
  idLicenceType: yup.string().required("El campo es obligatorio"),
  dateStart: yup.string().required("El campo es obligatorio"),
  dateEnd: yup.string().required("El campo es obligatorio"),
  licenceState: yup.string().required("El campo es obligatorio"),
  resolutionNumber: yup
    .string()
    .required("El campo es obligatorio")
    .max(50, "máximo 50 carácteres"),
  observation: yup.string().optional().max(500, "máximo 500 carácteres"),
});
// comments: yup.string().required("El campo es obligatorio"),
export const searchStaff = yup.object({
  workerId: yup.string().required("El campo es obligatorio"),
});

export const retirementEmploymentSchema = yup.object({
  idReasonRetirement: yup.string().required("El campo es obligatorio"),
  retirementDate: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  observation: yup
    .string()
    .required("El campo es obligatorio")
    .min(3, "Ingrese al menos 3 caracteres")
    .max(1000, "Solo se permiten 1000 caracteres"),
});

export const filterIncrementSalarySchema = yup.object({
  numberActApproval: yup.string().required("El campo es obligatorio"),
});

export const createUpdateIncrementSalarySchema = yup.object({
  codCharge: yup.string().required("El campo es obligatorio"),
  previousSalary: yup.string(),
  numberActApproval: yup
    .string()
    .required("El campo es obligatorio")
    .max(100, "Solo se permiten 100 caracteres"),
  newSalary: yup
    .string()
    .required("El campo es obligatorio")
    .test(
      "mayor-salaryActual",
      "El nuevo salario debe ser mayor al salario actual",
      (value, context) => {
        const { previousSalary } = context.parent;
        if (value && previousSalary) {
          return parseFloat(value) >= parseFloat(previousSalary);
        }
        return true;
      }
    ),
  effectiveDate: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  incrementValue: yup
    .string()
    .required("El campo es obligatorio")
    .test(
      "incremento-valido",
      "Debe existir un incremento valido",
      (value, context) => {
        if (value) {
          return Number(value) <= 0 ? false : true;
        }
        return true;
      }
    ),
  observation: yup.string().max(500, "Solo se permiten 500 caracteres"),
});

export const filterSuspensionContractSchema = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
});

export const createSuspensionContractSchema = yup.object({
  dateStartSuspension: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  dateEndSuspension: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  observation: yup
    .string()
    .required("El campo es obligatorio")
    .max(500, "Solo se permiten 500 caracteres"),
});

export const createDeductionOneSchema = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
  typeDeduction: yup.string().required("El campo es obligatorio"),
});

export const createDeductionTwoSchema = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
  typeDeduction: yup.string().required("El campo es obligatorio"),
  codDeductionType: yup.string().required("El campo es obligatorio"),
  codFormsPeriod: yup.string().required("El campo es obligatorio"),
  value: yup.number().required("El campo es obligatorio"),
  observation: yup.string().max(500, "Solo se permiten 500 caracteres"),
});

export const createDeductionThreeSchema = yup.object({
  codEmployment: yup.string().required("El campo es obligatorio"),
  typeDeduction: yup.string().required("El campo es obligatorio"),
  codDeductionType: yup.string().required("El campo es obligatorio"),
  codFormsPeriod: yup.string().required("El campo es obligatorio"),
  value: yup.number().required("El campo es obligatorio"),
  observation: yup.string().max(500, "Solo se permiten 500 caracteres"),
});

export const formDeduction = [
  createDeductionOneSchema,
  createDeductionTwoSchema,
  createDeductionThreeSchema,
];

export const createOrUpdateSpreadSheetSchema = yup.object({
  idFormType: yup.string().required("El campo es obligatorio"),
  dateStart: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  dateEnd: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  paidDate: yup
    .date()
    .required("El campo es obligatorio")
    .typeError("Fecha invalida"),
  month: yup
    .number()
    .typeError("El campo debe ser obligatorio")
    .required("El campo es obligatorio"),
  year: yup
    .number()
    .test("is-year-actual", "El año debe ser el actual", (value) => {
      const yearActual = new Date().getFullYear();

      if (value === yearActual || value === yearActual - 1) {
        return true;
      }

      return false;
    })
    .typeError("El valor debe ser un numero")
    .required("El campo debe ser obligatorio"),
  observation: yup.string().max(500, "Solo se permiten 500 caracteres"),
});

export const createOrUpdateTaxDeductible = yup.object({
  year: yup
    .string()
    .required("El campo es obligatorio")
    .max(4, "Solo se permiten 4 caracteres"),
  codEmployment: yup.string().required("El campo es obligatorio"),
  type: yup.string().required("El campo es obligatorio"),
  value: yup.number().required("El campo es obligatorio"),
});

export const createOrUpdateOtherIncome = yup.object({
  codPayroll: yup.string().required("El campo es obligatorio"),
  codEmployment: yup.string().required("El campo es obligatorio"),
  codTypeIncome: yup.string().required("El campo es obligatorio"),
  valuesMax: yup.array(),
  value: yup
    .number()
    .test(
      "tope-year",
      "El  valor sobrepasa el tope esperado",
      async (value, context) => {
        const { codTypeIncome, valuesMax } = context.parent;

        if (codTypeIncome === String(EIncomeType.AprovechamientoTiempoLibre)) {
          const valueMax = valuesMax.find(
            (i: IParameter) => i.id === "TOPE_APROVECHAMIENTO_LIBRE"
          ) as IParameter;

          if (Number(value) > Number(valueMax.value)) {
            return false;
          }

          return true;
        }

        if (codTypeIncome === String(EIncomeType.ApoyoEstudiantil)) {
          if (Number(value) > 5000000) {
            return false;
          }

          return true;
        }

        return true;
      }
    )
    .required("El campo es obligatorio"),
});

export const createUpdateChargeSchema = yup.object({
  codChargeType: yup.string().required("El campo es obligatorio"),
  codContractType: yup.string().required("El campo es obligatorio"),
  name: yup.string().required("El campo es obligatorio"),
  baseSalary: yup.string().required("El campo es obligatorio"),
  state: yup.boolean().required("El campo es obligatorio"),
  observations: yup
    .string()
    .max(500, "Solo se permiten 500 caracteres")
    .optional(),
});

export const generateReporSchema = yup.object({
  period: yup
    .string()
    .max(4, "Solo se permiten 4 caracteres")
    .required("El campo es obligatorio"),
  codEmployment: yup.string().optional().nullable(),
  typeReport: yup
    .number()
    .typeError("El campo es obligatorio")
    .required("El campo es obligatorio"),
});

export const generatePublicReporSchema = yup.object({
  period: yup
    .string()
    .max(4, "Solo se permiten 4 caracteres")
    .required("El campo es obligatorio"),
  employeeId: yup.string()
    .typeError("El campo es obligatorio")
    .required("El campo es obligatorio"),
});
