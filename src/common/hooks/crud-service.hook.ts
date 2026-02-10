import { useContext } from "react";
import instanceApi from "../utils/api-instance";
import { ApiResponse } from "../utils/api-response";
import { AppContext } from "../contexts/app.context";
import { EResponseCodes } from "../constants/api.enum";

function useCrudService<T>(baseUrl: string) {
  const { authorization } = useContext(AppContext);

  let errorMessage = "Hubo un error al comunicarse con la api.";

  // Función para limpiar mensajes de error
  const cleanErrorMessage = (message: string): string => {
    if (!message) return message;
    // Eliminar prefijo "An unexpected error occurred:" o "Ocurrió un error:"
    return message
      .replace(/^An unexpected error occurred:\s*/i, "")
      .replace(/^Ocurrió un error:\s*/i, "")
      .trim();
  };

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
        return new ApiResponse(data, operation.code as EResponseCodes, cleanErrorMessage(operation.message));
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      const errorMsg = JSON.parse(error?.response?.request?.response)?.operation?.message || errorMessage;
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        cleanErrorMessage(errorMsg)
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
        return new ApiResponse(responseData, operation.code as EResponseCodes, cleanErrorMessage(operation.message));
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      const errorMsg = JSON.parse(error?.response?.request?.response)?.operation?.message || errorMessage;
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        cleanErrorMessage(errorMsg)
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
        return new ApiResponse(responseData, operation.code as EResponseCodes, cleanErrorMessage(operation.message));
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      const errorMsg = JSON.parse(error?.response?.request?.response)?.operation?.message || errorMessage;
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        cleanErrorMessage(errorMsg)
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
        return new ApiResponse(responseData, operation.code as EResponseCodes, cleanErrorMessage(operation.message));
      }

      // Fallback for direct responses
      return new ApiResponse(rawResponse as T, EResponseCodes.OK);
    } catch (error: any) {
      const errorMsg = JSON.parse(error?.response?.request?.response)?.operation?.message || errorMessage;
      return new ApiResponse(
        {} as T,
        EResponseCodes.FAIL,
        cleanErrorMessage(errorMsg)
      );
    }
  };

  return { post, get, put, deleted };
}
export default useCrudService;
