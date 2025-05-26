import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";

export const Enter = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  let isActive = true;
  const fetchData = async () => {
    try {
      let response = await fetch(
        process.env.REACT_APP_API_URL + "/check-token",
        {
          mode: "cors",
          method: "POST",
          body: JSON.stringify({
            token: token,
          }),
          headers: { "Content-Type": "application/json" },
        }
      );
      response = await response.json();
      if (response.result === "ok") {
        // token is valid, but need additional auth
        secureLocalStorage.setItem("token", token);
        secureLocalStorage.setItem("table_no", response.table_no);
        isActive = response.active;
        return true;
      }
    } catch (error) {
      window.alert(error);
    }
    return false;
  };

  useEffect(() => {
    fetchData().then((ret) => {
      if (ret === true) {
        if (isActive) {
          navigate("/landing");
        } else {
          navigate("/checkin");
        }
      } else {
        navigate("/error");
      }
    });
  }, []);

  return <> ... </>;
};
