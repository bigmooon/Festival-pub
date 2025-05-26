import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/Modal.scss";
import useOutSideClick from "../useOutSideClick";
import ModalContainer from "../ModalContainer";

function ExitTableModal({ onClose, targetTables, zIndex }) {
  const modalRef = useRef(null);
  const { token } = useParams();
  // selectedBoxes가 배열이 아닌 경우, 배열로 변환
  let targetTableArray = Array.isArray(targetTables)
    ? targetTables
    : [targetTables];

  const handleClose = () => {
    onClose?.();
  };

  const processReject = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/admin/reset-table",
      {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          table_list: targetTableArray,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        let successList = Object.keys(res);

        if (successList.length > 0) {
          alert(String(successList.join(", ")) + "번 테이블 퇴장완료!");
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
    <ModalContainer style={{ zIndex: zIndex }}>
      <div className="overlay">
        <div className="adminModalWrap" ref={modalRef}>
          <div className="adminModalTitle">
            <span className="selectnum">
              {targetTableArray.join(", ")}번 테이블
            </span>
          </div>
          <div className="adminModalContent">
            <span>퇴장 처리 하겠습니까?</span>
          </div>
          <div className="adminModalBtn">
            <button onClick={processReject}>
              <span>퇴장 처리</span>
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default ExitTableModal;
