import { EResponseCodes } from "../constants/api.enum";
import { IAdditionalField, IGenericList } from "../interfaces/global.interface";
import { IParameter } from "../interfaces/payroll.interfaces";
import { ApiResponse } from "../utils/api-response";
import useCrudService from "./crud-service.hook";

export function useGenericListService() {
  const baseURL: string = process.env.urlApiCore;
  const listUrl: string = "/api/v1/generic-list";
  const { get } = useCrudService(baseURL);

  async function getListByGrouper(
    grouper: string
  ): Promise<ApiResponse<IGenericList[]>> {
    try {
      const endpoint: string = `/get-by-grouper/${grouper}`;
      return await get(`${listUrl}${endpoint}`);
    } catch (error) {
      return new ApiResponse(
        {} as IGenericList[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function getListByGroupers(
    groupers: string[]
  ): Promise<ApiResponse<IGenericList[]>> {
    try {
      const params = { groupers };
      const endpoint: string = `/get-by-groupers/`;
      return await get(`${listUrl}${endpoint}`, params);
    } catch (error) {
      return new ApiResponse(
        {} as IGenericList[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function getListByParent(
    params: IAdditionalField
  ): Promise<ApiResponse<IGenericList[]>> {
    try {
      const endpoint: string = `/get-by-parent/`;
      return await get(`${listUrl}${endpoint}`, params);
    } catch (error) {
      return new ApiResponse(
        {} as IGenericList[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  async function getParametersByCodes(
    codes: Array<string>
  ): Promise<ApiResponse<IParameter[]>> {
    try {
      const endpoint: string = `/api/v1/parameter/get-by-codes`;
      return await get(`${baseURL}${endpoint}`, {
        codes,
      });
    } catch (error) {
      return new ApiResponse(
        {} as IParameter[],
        EResponseCodes.FAIL,
        "Error no controlado"
      );
    }
  }

  return {
    getListByParent,
    getListByGrouper,
    getListByGroupers,
    getParametersByCodes,
  };
}
