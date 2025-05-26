import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import "styles/Modal.scss";
import useOutSideClick from "../useOutSideClick";
import ModalContainer from "../ModalContainer";

function HeartModal({ onClose, targetTables, zIndex }) {
  const modalRef = useRef(null);
  const { token } = useParams();
  const [heart, setHeart] = useState(0);

  // selectedBoxes가 배열이 아닌 경우, 배열로 변환
  let targetTableArray = Array.isArray(targetTables)
    ? targetTables
    : [targetTables];

  const handleClose = () => {
    onClose?.();
  };

  const handleHeartIncrement = () => {
    setHeart((prevHeart) => prevHeart + 1);
  };

  const handleHeartDecrement = () => {
    setHeart((prevHeart) => prevHeart - 1);
  };

  const addHeart = async () => {
    const response = await fetch(
      process.env.REACT_APP_API_URL + "/admin/add-likes",
      {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          table_list: targetTableArray,
          count: heart,
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        let successList = Object.keys(res.result);

        if (successList.length > 0) {
          alert(
            String(successList.join(", ")) +
              "번 테이블에 하트 " +
              String(heart) +
              "개 추가완료!"
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
    <ModalContainer style={{ zIndex: zIndex }}>
      <div className="overlay">
        <div className="adminModalWrap" ref={modalRef}>
          <div className="adminModalTitle">
            <span className="selectnum">
              {targetTableArray.join(", ")}번 테이블
            </span>
          </div>
          <div className="adminModalContent timeSet">
            <button onClick={handleHeartDecrement}>-</button>
            <input type="number" value={heart} readOnly />
            <span className="subtext">개</span>
            <button onClick={handleHeartIncrement}>+</button>
          </div>
          <div className="adminModalBtn">
            <button onClick={addHeart}>
              <span>하트 충전</span>
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default HeartModal;
