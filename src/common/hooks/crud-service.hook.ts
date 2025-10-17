import { useContext } from "react";
import instanceApi from "../utils/api-instance";
import { ApiResponse } from "../utils/api-response";
import { AppContext } from "../contexts/app.context";
import { EResponseCodes } from "../constants/api.enum";

function useCrudService<T>(baseUrl: string) {
  const { authorization } = useContext(AppContext);

  let errorMessage = "Hubo un error al cominicarse con la api.";

  const get = async <T>(
    endpoint: string,
    params: Object = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const api = instanceApi(baseUrl, authorization.token);
      const rawResponse = await api({
        method: "get",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          permissions: authorization.encryptedAccess,
        },
        url: `${endpoint}`,
        params: params,
      });

      // Handle ApiResponse format from backend
      if (rawResponse && rawResponse.data && rawResponse.data.operation) {
        const { operation, data } = rawResponse.data;
        return new ApiResponse(data, operation.code as EResponseCodes, operation.message);
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        JSON.parse(error?.response?.request?.response)?.operation?.message ||
        errorMessage
      );
    }
  };

  const post = async <T>(
    endpoint: string,
    data: Object = {},
    params: Object = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const api = instanceApi(baseUrl, authorization.token);

      const isFormData = data instanceof FormData;

      const rawResponse = await api({
        method: "post",
        headers: {
          ...(isFormData
            ? {} // Let browser set "Content-Type" automatically for FormData
            : { "Content-Type": "application/json" }),
          Accept: "application/json",
          permissions: authorization.encryptedAccess,
        },
        url: `${endpoint}`,
        params: params,
        data: data,
      });

      // Handle ApiResponse format from backend
      if (rawResponse && rawResponse.data && rawResponse.data.operation) {
        const { operation, data: responseData } = rawResponse.data;
        return new ApiResponse(responseData, operation.code as EResponseCodes, operation.message);
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        JSON.parse(error?.response?.request?.response)?.operation?.message ||
        errorMessage
      );
    }
  };

  const put = async <T>(
    endpoint: string,
    data: Object = {},
    params: Object = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const api = instanceApi(baseUrl, authorization.token);
      const rawResponse = await api({
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          permissions: authorization.encryptedAccess,
        },
        url: `${endpoint}`,
        params: params,
        data: data,
      });

      // Handle ApiResponse format from backend
      if (rawResponse && rawResponse.data && rawResponse.data.operation) {
        const { operation, data: responseData } = rawResponse.data;
        return new ApiResponse(responseData, operation.code as EResponseCodes, operation.message);
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        JSON.parse(error?.response?.request?.response)?.operation?.message ||
        errorMessage
      );
    }
  };

  const deleted = async <T>(
    endpoint: string,
    params: Object = {}
  ): Promise<ApiResponse<T>> => {
    try {
      const api = instanceApi(baseUrl, authorization.token);
      const rawResponse = await api({
        method: "delete",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          permissions: authorization.encryptedAccess,
        },
        url: `${endpoint}`,
        params: params,
      });

      // Handle ApiResponse format from backend
      if (rawResponse && rawResponse.data && rawResponse.data.operation) {
        const { operation, data: responseData } = rawResponse.data;
        return new ApiResponse(responseData, operation.code as EResponseCodes, operation.message);
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        JSON.parse(error?.response?.request?.response)?.operation?.message ||
        errorMessage
      );
    }
  };

  return { post, get, put, deleted };
}
export default useCrudService;
