import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/Modal.scss";
import useOutSideClick from "../useOutSideClick";
import ModalContainer from "../ModalContainer";

function JoinTableModal({ onClose, targetTable, zIndex }) {
  const modalRef = useRef(null);
  const { token } = useParams();
  const handleClose = () => {
    onClose?.();
  };
  const [to, setTo] = useState(null);

  useOutSideClick(modalRef, handleClose);
  useEffect(() => {
    const $body = document.querySelector("body");
    const overflow = $body.style.overflow;
    $body.style.overflow = "hidden";
    return () => {
      $body.style.overflow = overflow;
    };
  }, []);

  const processJoin = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/admin/join",
      {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          from_where: Number(targetTable),
          to_where: Number(to),
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.result && res.result == "ok") {
          alert(
            String(targetTable) + ", " + String(to) + "번 테이블 합석완료!"
          );
        } else {
          alert("에러 발생! 개발자에게 문의해주세요");
        }
        return res;
      });
    handleClose();
    return response;
  };

  const onChange = (event) => {
    setTo(event.target.value);
  };

  return (
    <ModalContainer style={{ zIndex: zIndex }}>
      <div className="overlay">
        <div className="adminModalWrap" ref={modalRef}>
          <div className="adminModalTitle">
            <span className="selectnum">{targetTable}번 테이블</span>
          </div>
          <div className="adminModalContent">
            <span className="joinSpan">
              몇 번 테이블로 합석처리<br></br>하시겠습니까?<br></br>
            </span>
            <input
              className="joinTableNum"
              type="number"
              value={to}
              onChange={onChange}
            ></input>
          </div>
          <div className="adminModalBtn">
            <button onClick={processJoin}>
              <span>합석 처리</span>
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default JoinTableModal;
