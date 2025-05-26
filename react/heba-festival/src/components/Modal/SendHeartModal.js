import React, { useEffect, useRef, useState } from "react";
import "styles/Modal.scss";
import useOutSideClick from "./useOutSideClick";
import ModalContainer from "./ModalContainer";
import Man from "assets/images/Man.svg";
import Woman from "assets/images/Woman.svg";
import Couple from "assets/images/Couple.svg";
import SendHeartImg from "assets/images/SendHeart.svg";
import secureLocalStorage from "react-secure-storage";
import MessageModal from "components/Modal/MessageModal";

// 원하는 테이블에 하트 보내기
function SendHeartModal({
  onClose,
  tableData,
  isSendAvailable,
  remainedLikes,
}) {
  const modalRef = useRef(null);
  const handleClose = () => {
    onClose?.();
  };
  const [openModal, setOpenModal] = useState(false);
  const message = useRef("");
  const handleSubmit = (e) => {
    e.preventDefault();

    if (tableData.table_no === secureLocalStorage.getItem("table_no")) {
      message.current = "자신의 테이블에는 하트를 보낼 수 없어요!";
      setOpenModal(true);
      return;
    }
    if (!isSendAvailable) {
      message.current =
        "합석이 불가능한 테이블이에요.\n다른 테이블을 찾아보아요!";
      setOpenModal(true);
      return;
    }
    if (
      remainedLikes <= 0 &&
      !tableData.sent.includes(secureLocalStorage.getItem("table_no"))
    ) {
      message.current =
        "남은 하트 수가 없습니다!\n하트 충전 후 다시 시도해주세요.";
      setOpenModal(true);
      return;
    }

    fetch(process.env.REACT_APP_API_URL + "/send-like", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: secureLocalStorage.getItem("token"),
        code: secureLocalStorage.getItem("code"),
        received_table: tableData.table_no,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res && res.result === "ok") {
          message.current =
            "하트를 성공적으로 보냈습니다!\n합석에 성공하면 직원이 달려올게요! =3=3=3";
        } else {
          message.current =
            "보내기에 실패했습니다...\n관리자에게 문의해주세요.";
        }
        setOpenModal(true);
        return res;
      });
    //.then((res) => { handleClose(); })
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

  let tableGenderImg;
  if (tableData.gender === "male") {
    tableGenderImg = Man;
  } else if (tableData.gender === "female") {
    tableGenderImg = Woman;
  } else if (tableData.gender === "mixed") {
    tableGenderImg = Couple;
  } else {
    tableGenderImg = null;
  }

  return (
    <ModalContainer>
      <div className="overlay">
        <div className="modalWrap" ref={modalRef} style={{ height: "23.5rem" }}>
          <div className="modalTitle">
            <span style={{ fontWeight: "900", fontSize: "1.8rem" }}>
              {tableData.table_no}번 테이블
            </span>
          </div>
          <div className="modalContent">
            <div className="SendHeartTop">
              <div className="SendHeartImgBox">
                {tableGenderImg != null ? (
                  <img src={tableGenderImg} alt="table gender img" />
                ) : (
                  <div></div>
                )}
              </div>
              <div className="SendHeartSpan">
                <span>x</span>
                <span style={{ marginTop: "2rem" }}>{tableData.nums}</span>
              </div>
            </div>
            <div className="sendHeartMiddle">
              <div className="SendHeartIntroduce">
                <span>
                  {tableData.join
                    ? "합석 처리가 완료된 테이블이에요"
                    : tableData.note}
                </span>
              </div>
            </div>
            <div className="modalBtnBoxSendHeart">
              <button
                className="btnFilled"
                type="submit"
                onClick={handleSubmit}
              >
                <img src={SendHeartImg} alt="sendheart img"></img>
              </button>
              <button className="btnBlank" onClick={handleClose}>
                <span className="btnBlankSpan">취소</span>
              </button>
            </div>
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

export default SendHeartModal;
