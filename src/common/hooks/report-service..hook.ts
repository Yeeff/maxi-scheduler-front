import { EResponseCodes } from "../constants/api.enum";

import {
  IFilterVinculation,
  IReport,
  IReportResponse,
} from "../interfaces/payroll.interfaces";

import { ApiResponse } from "../utils/api-response";

import useCrudService from "./crud-service.hook";

export function useReportService() {
  const baseURL: string = process.env.urlApiPayroll;
  const authUrl: string = "/api/v1/reports";

  const { post } = useCrudService(baseURL);

  async function generateReport(
    data: IReport
  ): Promise<ApiResponse<IReportResponse>> {
    try {
      const endpoint: string = `/generateReport`;
      return await post(`${authUrl}${endpoint}`, data);
    } catch (error) {
      return new ApiResponse(
        {} as IReportResponse,
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function downloadVinculationReport(
    data: IFilterVinculation
  ): Promise<ApiResponse<any>> {
    try {
      const endpoint: string = `/vinculationExport`;
      return await post(`${authUrl}${endpoint}`, data);
    } catch (error) {
      return new ApiResponse(false, EResponseCodes.FAIL, "Error no controlado");
    }
  }

  return {
    generateReport,
    downloadVinculationReport
  };
}

export default useReportService;
