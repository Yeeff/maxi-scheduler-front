import { EResponseCodes } from "../constants/api.enum";
import {
  IDeductionType,
  IManualDeduction,
} from "../interfaces/payroll.interfaces";
import { ApiResponse } from "../utils/api-response";
import useCrudService from "./crud-service.hook";

export function useDeductionService() {
  const baseURL: string = process.env.urlApiPayroll;
  const authUrl: string = "/api/v1/deduction";

  const { get, post, put, deleted } = useCrudService(baseURL);

  async function getDeductionTypesByType(
    type: string
  ): Promise<ApiResponse<IDeductionType[]>> {
    try {
      const endpoint: string = `/type/${type}`;
      return await get(`${authUrl}${endpoint}`);
    } catch (error) {
      return new ApiResponse(
        {} as IDeductionType[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function getDeductionById(
    id: number
  ): Promise<ApiResponse<IManualDeduction[]>> {
    try {
      const endpoint: string = `/${id}`;
      return await get(`${authUrl}${endpoint}`);
    } catch (error) {
      return new ApiResponse(
        {} as IManualDeduction[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function deleteDeduction(
    id: number,
    cyclic: boolean
  ): Promise<ApiResponse<boolean>> {
    try {
      const endpoint: string = `/${id}/${cyclic}`;
      return await deleted(`${authUrl}${endpoint}`);
    } catch (error) {
      return new ApiResponse(false, EResponseCodes.FAIL, "Error no controlado");
    }
  }

  async function createDeduction(
    data: IManualDeduction
  ): Promise<ApiResponse<IManualDeduction>> {
    try {
      const endpoint: string = `/`;
      return await post(`${authUrl}${endpoint}`, data);
    } catch (error) {
      return new ApiResponse(
        {} as IManualDeduction,
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function updateDeduction(
    data: IManualDeduction
  ): Promise<ApiResponse<IManualDeduction>> {
    try {
      const endpoint: string = `/`;
      return await put(`${authUrl}${endpoint}`, data);
    } catch (error) {
      return new ApiResponse(
        {} as IManualDeduction,
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  return {
    getDeductionTypesByType,
    createDeduction,
    updateDeduction,
    getDeductionById,
    deleteDeduction,
  };
}

export default useDeductionService;
