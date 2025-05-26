import React, { useEffect, useRef, useState } from "react";
import "styles/Modal.scss";
import useOutSideClick from "./useOutSideClick";
import ModalContainer from "./ModalContainer";
import { Link } from "react-router-dom";
import secureLocalStorage from "react-secure-storage";
import MessageModal from "components/Modal/MessageModal";

function HeartChargeModal({ onClose }) {
  const modalRef = useRef(null);
  const handleClose = () => {
    onClose?.();
  };
  const [openModal, setOpenModal] = useState(false);
  const message = useRef("");

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(process.env.REACT_APP_API_URL + "/call", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: secureLocalStorage.getItem("token"),
        code: secureLocalStorage.getItem("code"),
        type: "charge_heart",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result && res.result == "ok") {
          message.current = "직원을 호출하였습니다!\n잠시만 기다려주세요.";
        } else {
          message.current = "직원 호출에 실패하였습니다.\n다시 시도해주세요";
        }
        setOpenModal(true);
      });
  };
  const onCloseMessageModal = () => {
    setOpenModal(false);
    handleClose();
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
        {openModal && (
          <MessageModal
            onClose={onCloseMessageModal}
            message={message.current}
          ></MessageModal>
        )}
        <div className="modalWrap" ref={modalRef} style={{ height: "20rem" }}>
          <div className="modalTitle">
            <span style={{ fontWeight: "900", fontSize: "1.5rem" }}>
              하트 충전하기
            </span>
          </div>
          <div className="modalContent heartContent">
            <span style={{ fontSize: "1.3rem", lineHeight: "150%" }}>
              하트는 칩 2개로 구매 가능합니다.
              <br></br>
              칩이 있으시면 '직원 호출'을
              <br></br>
              칩이 없으시면 '주문하기'를 클릭해
              <br></br>
              칩을 구매해 주세요.
            </span>
            <div className="heartChargeBtnBox">
              <button
                className="whiteBtn heartChargeBtn"
                type="submit"
                onClick={handleSubmit}
              >
                <span>직원호출</span>
              </button>
              <button className="heartChargeBtn">
                <Link
                  to={
                    "https://order.sicpama.com/?token=" +
                    secureLocalStorage.getItem("token")
                  }
                  style={{ textDecoration: "none" }}
                >
                  <span>주문하기</span>
                </Link>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
}

export default HeartChargeModal;
