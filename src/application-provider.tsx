import React, {
  Fragment,
  Suspense,
  useContext,
  useEffect,
  useState,
} from "react";
import useAuthService from "./common/hooks/auth-service.hook";
import { AppContext } from "./common/contexts/app.context";
import { EResponseCodes } from "./common/constants/api.enum";
import useAppCominicator from "./common/hooks/app-communicator.hook";

interface IPropsAppProvider {
  children: React.JSX.Element;
}

function ApplicationProvider({
  children,
}: IPropsAppProvider): React.JSX.Element {
  const { getAuthorization } = useAuthService();
  const { setAuthorization } = useContext(AppContext);
  const { subscribe, unsubscribe } = useAppCominicator();

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getTokenAuthorization(token);
    }

    subscribe("token-refresh", () => {
      if (token) {
        getTokenAuthorization(token);
      }
    });

    return () => {
      unsubscribe("token-refresh", () => { });
    };
  }, []);

  async function getTokenAuthorization(token: string) {
    setLoading(true);
    const res = await getAuthorization(token);
    setLoading(false);
    if (res.operation.code == EResponseCodes.OK) {
      setAuthorization({
        ...res.data,
        token: token,
      });
    }
  }

  if (loading) {
    return <Suspense fallback={<p>Loading...</p>}></Suspense>;
  } else {
    return <Fragment>{children}</Fragment>;
  }
}

export default React.memo(ApplicationProvider);
