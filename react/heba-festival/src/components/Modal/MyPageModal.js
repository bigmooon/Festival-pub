import React, { useEffect, useRef, useState } from "react";
import secureLocalStorage from "react-secure-storage";
import "styles/Modal.scss";
import useOutSideClick from "./useOutSideClick";
import ModalContainer from "./ModalContainer";
import CloseBtn from "assets/images/close.svg";
import QuantityControl from "components/QuantityControl";
import Man from "assets/images/Man.svg";
import Woman from "assets/images/Woman.svg";

function MyPageModal({ onClose, myInfo }) {
  const modalRef = useRef(null);
  const handleClose = () => {
    onClose?.();
  };

  const [quantityMan, setQuantityMan] = useState(0);
  const [quantityWoman, setQuantityWoman] = useState(0);
  const [modifyIntroduce, setModifyIntroduce] = useState(myInfo.note);

  const handleModifyIntroduce = (event) => {
    setModifyIntroduce(event.target.value);
  };

  const handleQuantityChange = (action, gender) => {
    if (gender === "male") {
      if (action === "increment") {
        setQuantityMan(quantityMan + 1);
      } else if (action === "decrement" && quantityMan > 0) {
        setQuantityMan(quantityMan - 1);
      }
    } else if (gender === "female") {
      if (action === "increment") {
        setQuantityWoman(quantityWoman + 1);
      } else if (action === "decrement" && quantityWoman > 0) {
        setQuantityWoman(quantityWoman - 1);
      }
    }
  };

  useOutSideClick(modalRef, handleClose);
  useEffect(() => {
    if (myInfo.gender === "male") {
      setQuantityMan(myInfo.nums);
    } else if (myInfo.gender === "female") {
      setQuantityWoman(myInfo.nums);
    }
    const $body = document.querySelector("body");
    const overflow = $body.style.overflow;
    $body.style.overflow = "hidden";
    return () => {
      $body.style.overflow = overflow;
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (quantityMan === 0 && quantityWoman === 0) {
      return;
    }

    if (
      (myInfo.gender === "male" && quantityWoman > 0) ||
      (myInfo.gender === "female" && quantityMan > 0)
    ) {
      if (
        window.confirm(
          "성별을 바꾸면 합석이 안 될 수도 있습니다!  바꾸시겠습니까?"
        ) == false
      ) {
        return;
      }
    }
    fetch(process.env.REACT_APP_API_URL + "/update-info", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: secureLocalStorage.getItem("token"),
        code: secureLocalStorage.getItem("code"),
        m_count: quantityMan,
        f_count: quantityWoman,
        note: modifyIntroduce,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result && res.result == "ok") {
          alert("정보가 변경되었습니다!");
        }
        return res;
      })
      .then((res) => {
        handleClose();
      });
  };

  return (
    <ModalContainer>
      <div className="overlay">
        <div className="myPageWrap modalWrap" ref={modalRef}>
          <div className="closeBtnBox">
            <button className="closeBtn" onClick={handleClose}>
              <img src={CloseBtn} alt="x img"></img>
            </button>
          </div>
          <div className="myPageTitle">
            <span>마이페이지</span>
          </div>
          <form>
            <div className="myPageContent">
              <div className="modifyCount">
                <div className="genderImgBox">
                  <img src={Man} alt="man img"></img>
                  <span>남자</span>
                </div>
                <div className="modifyCountBox">
                  <span>인원 수를 선택하세요</span>
                  {/* 남자 +- 버튼 */}
                  <QuantityControl
                    quantity={quantityMan}
                    onIncrement={() =>
                      handleQuantityChange("increment", "male")
                    }
                    onDecrement={() =>
                      handleQuantityChange("decrement", "male")
                    }
                  ></QuantityControl>
                </div>
              </div>
              <div className="modifyCount" style={{ marginTop: "1.8rem" }}>
                <div className="genderImgBox">
                  <img
                    src={Woman}
                    alt="woman img"
                    style={{
                      width: "7.5rem",
                      height: "7rem",
                      marginRight: "-1rem",
                      marginLeft: "-0.4rem",
                    }}
                  ></img>
                  <span style={{ marginTop: "-0.5rem" }}>여자</span>
                </div>
                <div className="modifyCountBox">
                  <span>인원 수를 선택하세요</span>
                  {/* 여자 +- 버튼 */}
                  <QuantityControl
                    quantity={quantityWoman}
                    onIncrement={() =>
                      handleQuantityChange("increment", "female")
                    }
                    onDecrement={() =>
                      handleQuantityChange("decrement", "female")
                    }
                  ></QuantityControl>
                </div>
              </div>
              <div className="modifyIntroduce">
                <div className="modifyIntroduceTitle">
                  <span>한줄 소개</span>
                  <textarea
                    name="introduce"
                    cols={"20"}
                    rows={"1"}
                    spellCheck="false"
                    value={modifyIntroduce}
                    onChange={handleModifyIntroduce}
                  ></textarea>
                </div>
              </div>
            </div>
            <button className="myPageBtn" type="submit" onClick={handleSubmit}>
              <span>수정하기</span>
            </button>
          </form>
        </div>
      </div>
    </ModalContainer>
  );
}

export default MyPageModal;
