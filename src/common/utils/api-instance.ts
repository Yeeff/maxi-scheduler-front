import axios, { AxiosInstance } from "axios";

export default function instanceApi(
  baseURL: string,
  token?: string
): AxiosInstance {
  const api = axios.create({
    baseURL: baseURL,
  });

  const tokenToSend = token || localStorage.getItem("token")

  api.interceptors.request.use(
    (req) => {
      if (tokenToSend) {
        req.headers.Authorization = `Bearer ${tokenToSend}`;
      }
      return req;
    },
    (err) => {
      throw err;
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response.data;
    },
    (error) => {
      throw error;
    }
  );
  return api;
}
