import { EResponseCodes } from "../constants/api.enum";
import { ApiResponse } from "../utils/api-response";
import useCrudService from "./crud-service.hook";

export interface IDayType {
  tdi_codigo: number;
  tdi_descripcion: string;
  tdi_descripcion_corta: string;
  tdi_activo: boolean;
  tdi_orden: number;
}

export interface IDaysParametrizationDetail {
  id: number;
  daysParametrizationId: number;
  dayTypeId: number;
  dayType: IDayType;
  description: string | null;
  detailDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDaysParametrization {
  id: number;
  year: number;
  daysParametrizationDetails: IDaysParametrizationDetail[];
  createdAt: Date;
  updatedAt: Date;
}

export function useCitizenAttentionService() {
  const baseURL: string = process.env.urlApiCitizenAttention;

  const { get } = useCrudService(baseURL);

  async function getDayParametrization(): Promise<
    ApiResponse<IDaysParametrization[]>
  > {
    try {
      return await get(`/api/v1/day-parametrization/get-all`);
    } catch (error) {
      return new ApiResponse([], EResponseCodes.FAIL, "Error no controlado");
    }
  }

  return {
    getDayParametrization,
  };
}
