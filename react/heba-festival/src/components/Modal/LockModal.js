import React, { useState, useRef, useEffect } from "react";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
import "styles/Modal.scss";
import LockImg from "assets/images/Lock.svg";
import ModalContainer from "./ModalContainer";
import CodeUnmatch from "./CodeUnmatch";
function LockModal({ onClose }) {
  const modalRef = useRef(null);
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const tableNumber = secureLocalStorage.getItem("table_no");

  if (tableNumber == null) {
    navigate("/error");
  }

  useEffect(() => {
    if (code.length === 4) {
      fetch(process.env.REACT_APP_API_URL + "/get-table", {
        mode: "cors",
        method: "POST",
        body: JSON.stringify({
          token: secureLocalStorage.getItem("token"),
          code: code,
        }),
        headers: { "Content-Type": "application/json" },
      })
        .then((response) => response.json())
        .then((response) => {
          if (response.result === "fail") {
            alert("코드가 일치하지 않습니다!");
            setCode("");
          } else {
            secureLocalStorage.setItem("code", code);
            handleClose();
          }
        });
    }
  }, [code]);

  const handleChange = (event) => {
    setCode(event.target.value);
  };

  const handleClose = () => {
    onClose?.();
  };

  return (
    <ModalContainer>
      <div className="overlay">
        <div className="modalWrap" ref={modalRef}>
          <div className="modalTitle">
            <span>{tableNumber}번 테이블</span>
          </div>
          <div className="lockModalImg">
            <img src={LockImg} alt="lock img"></img>
          </div>
          <div className="enterCode">
            <input
              className="enterCodeField"
              value={code}
              onChange={handleChange}
              maxLength="4"
            ></input>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default LockModal;
