import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/Modal.scss";
import useOutSideClick from "../useOutSideClick";
import ModalContainer from "../ModalContainer";

function TimeModal({ onClose, targetTables }) {
  const modalRef = useRef(null);
  const [time, setTime] = useState(0);
  const { token } = useParams();

  // selectedBoxes가 배열이 아닌 경우, 배열로 변환
  let targetTableArray = Array.isArray(targetTables)
    ? targetTables
    : [targetTables];

  const handleClose = () => {
    onClose?.();
  };

  const handleTimeIncrement = () => {
    setTime((prevTime) => prevTime + 10);
  };

  const handleTimeDecrement = () => {
    setTime((prevTime) => prevTime - 10);
  };

  const adjustTime = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/admin/add-time",
      {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          table_list: targetTableArray,
          mins: time,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        let successList = Object.keys(res.result);

        if (successList.length > 0) {
          alert(
            String(successList.join(", ")) +
              "번 테이블에 " +
              time +
              "분 추가완료!"
          );
        } else {
          alert("에러 발생! 개발자에게 문의해주세요");
        }

        return res;
      });
    handleClose();

    return response;
  };

  useOutSideClick(modalRef, handleClose);
  useEffect(() => {
    const $body = document.querySelector("body");
    const overflow = $body.style.overflow;
    $body.style.overflow = "hidden";
    return () => {
      $body.style.overflow = overflow;
    };
  }, []);

  return (
    <ModalContainer>
      <div className="overlay">
        <div className="adminModalWrap" ref={modalRef}>
          <div className="adminModalTitle">
            <span className="selectnum">
              {targetTableArray.join(", ")}번 테이블
            </span>
          </div>
          <div className="adminModalContent timeSet">
            <button onClick={handleTimeDecrement}>-</button>
            <input type="number" value={time} readOnly />
            <span className="subtext">분</span>
            <button onClick={handleTimeIncrement}>+</button>
          </div>
          <div className="adminModalBtn">
            <button onClick={adjustTime}>
              <span>시간 추가</span>
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default TimeModal;
