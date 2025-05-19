import { useEffect, useState } from "react";
import useAppCominicator from "./app-communicator.hook";

export interface IBreadCrumb {
  name: string;
  url: string;
  isPrimaryPage: boolean;
  useContext?: boolean;
  extraParams?: string;
}

export interface ISetPageContext {
  stringifyContext: string;
  url: string;
}

function useBreadCrumb(data: IBreadCrumb): {
  stringifyContext: string;
  updateContext: (data: ISetPageContext) => void;
} {
  // Servicios
  const { publish, subscribe, unsubscribe } = useAppCominicator();

  // State
  const [context, setContext] = useState<string | null>(null);

  // Effect que publica la miga de pan y escucha el contexto
  useEffect(() => {
    if (data.isPrimaryPage && process.env.urlRoot) {
      publish("add-bread-crumb", {
        name: process.env.aplicationName,
        url: process.env.urlRoot,
        isPrimaryPage: true,
      });
    }

    setTimeout(() => {
      publish("add-bread-crumb", {
        ...data,
        isPrimaryPage: false,
      });
    }, 100);

    if (data.useContext) {
      subscribe("current-page-context", (context) => {
        if (context) setContext(context.detail);
      });

      return () => {
        unsubscribe("current-page-context", () => {});
      };
    } else {
      setContext(null);
    }
  }, []);

  // Metodo actualiza el contexto
  function updateContext(data: ISetPageContext): void {
    publish("set-page-context", data);
  }

  return { stringifyContext: context, updateContext };
}

export default useBreadCrumb;