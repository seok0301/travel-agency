import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";

const ADMIN_UID = process.env.REACT_APP_ADMIN_UID;

const useIsAdmin = () => {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.uid === ADMIN_UID) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return isAdmin;
};

export default useIsAdmin;
