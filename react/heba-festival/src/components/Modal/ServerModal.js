import React, { useEffect, useRef, useState } from "react";
import "styles/Modal.scss";
import useOutSideClick from "./useOutSideClick";
import ModalContainer from "./ModalContainer";
import secureLocalStorage from "react-secure-storage";
import MessageModal from "components/Modal/MessageModal";

function ServerModal({ onClose }) {
  const modalRef = useRef(null);
  const [openModal, setOpenModal] = useState(false);

  const handleClose = () => {
    setOpenModal(false);
    onClose?.();
  };

  let message = useRef("");
  const handleSubmit = (e) => {
    e.preventDefault();
    fetch(process.env.REACT_APP_API_URL + "/call", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: secureLocalStorage.getItem("token"),
        code: secureLocalStorage.getItem("code"),
        type: "call",
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result && res.result === "ok") {
          message.current = "직원을 호출하였습니다!\n잠시만 기다려 주세요.";
        } else {
          message.current = "호출에 실패했습니다.\n다시 시도해주세요.";
        }
        setOpenModal(true);
        return res;
      });
  };

  const onCloseMessageModal = () => {
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
        <div className="modalWrap" ref={modalRef} style={{ width: "25rem" }}>
          <div className="modalTitle serverModalTitle">
            <span style={{ fontWeight: "800" }}>직원 호출</span>
          </div>
          <div className="modalContent serverContent">
            <span>직원을 호출하시겠습니까?</span>
            <button type="submit" onClick={handleSubmit}>
              <span>직원호출</span>
            </button>
          </div>
        </div>
      </div>
      {openModal && (
        <MessageModal
          onClose={onCloseMessageModal}
          message={message.current}
        ></MessageModal>
      )}
    </ModalContainer>
  );
}

export default ServerModal;
