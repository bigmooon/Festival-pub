import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "styles/CheckIn.scss";
import "styles/common.scss";
import Man from "assets/images/Man.svg";
import ManSelected from "assets/images/ManSelcted.svg";
import Woman from "assets/images/Woman.svg";
import WomanSelected from "assets/images/WomanSelected.svg";
import Couple from "assets/images/Couple.svg";
import CoupleSelected from "assets/images/CoupleSelected.svg";
import QuantityControl from "components/QuantityControl";
import secureLocalStorage from "react-secure-storage";
import ButtonModal from "components/Modal/ButtonModal";

export const CheckIn = () => {
  const [selectedGender, setSelectedGender] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [introduce, setIntroduce] = useState("");
  const [friendCode, setfriendCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [link, setLink] = useState("/error");
  const [openModal, setOpenModal] = useState(false);

  const token = secureLocalStorage.getItem("token");
  const navigate = useNavigate();

  const message = useRef("");
  // check token
  useEffect(() => {
    if (token == null) {
      navigate("/error");
    }
  });

  // 하나의 성별만 선택
  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
  };

  // + - 컨트롤 버튼
  const handleQuantityChange = (action) => {
    if (action === "increment") {
      setQuantity(quantity + 1);
    } else if (action === "decrement" && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIntroduceChange = (event) => {
    setIntroduce(event.target.value);
  };

  const handleFriendCodeChange = (event) => {
    setfriendCode(event.target.value);
  };

  const handleAgreeChange = (event) => {
    setAgree(event.target.checked);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectedGender == null || quantity === 0) return;

    const data = {
      token: token,
      gender: selectedGender,
      nums: quantity,
      note: introduce,
      photo: agree,
      referrer: friendCode,
    };

    fetch(process.env.REACT_APP_API_URL + "/set-table", {
      mode: "cors",
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((response) => {
        if (response.result === "fail") {
          navigate("/error");
        } else {
          secureLocalStorage.setItem("code", response.result);
          message.current =
            "입장 코드는 [" +
            String(secureLocalStorage.getItem("code")) +
            "]입니다.\n일행 입장 시 알려주세요!\n코드가 보이지 않거나 기억이 나지 않는다면\n직원에게 문의해주세요.";
          setOpenModal(true);
        }
      });
  };

  const onCloseModal = () => {
    setOpenModal(false);
    navigate("/landing");
  };
  const onClickConfirm = () => {
    navigate("/landing");
  };

  return (
    <div id="checkInWrap">
      {openModal && (
        <ButtonModal
          onClose={onCloseModal}
          onClickButton={onClickConfirm}
          message={message.current}
          buttonMessage={"확인"}
        ></ButtonModal>
      )}
      <div className="checkInTitle">
        <span>프로필을 설정하세요</span>
      </div>
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="checkInButtonBox">
          <div className="selectBox genderSelect">
            <div className="selectBoxTitle">
              <span>성별을 선택하세요</span>
            </div>
            <div className="genderBtn">
              <div className="genderBtnBox">
                <button
                  className={`customRadioBtn maleBtn ${selectedGender === "male" ? "selected" : ""}`}
                  data-name="male"
                  onClick={() => handleGenderSelect("male")}
                >
                  {selectedGender === "male" ? (
                    <img
                      src={ManSelected}
                      style={{
                        width: "7.5rem",
                        height: "7.5rem",
                        marginBottom: "0.6rem",
                      }}
                      alt="male selected img"
                    />
                  ) : (
                    <img
                      src={Man}
                      style={{
                        width: "5.5rem",
                        height: "4.5rem",
                        marginBottom: "0.6rem",
                        marginTop: "0.5rem",
                        marginLeft: "1rem",
                      }}
                      alt="male img"
                    />
                  )}
                </button>
                <span style={{ marginLeft: "-2.4rem" }}>남자</span>
              </div>
              <div className="genderBtnBox">
                <button
                  className={`customRadioBtn femaleBtn ${selectedGender === "female" ? "selected" : ""}`}
                  data-name="female"
                  onClick={() => handleGenderSelect("female")}
                >
                  {selectedGender === "female" ? (
                    <img
                      src={WomanSelected}
                      style={{
                        width: "7.5rem",
                        height: "6.5rem",
                        marginTop: "-0.1rem",
                        marginRight: "1rem",
                        marginBottom: "0.6rem",
                      }}
                      alt="woman selected img"
                    />
                  ) : (
                    <img
                      src={Woman}
                      style={{
                        width: "6.5rem",
                        height: "4.5rem",
                        marginTop: "0.5rem",
                        marginBottom: "0.6rem",
                      }}
                      alt="female img"
                    />
                  )}
                </button>
                <span style={{ marginLeft: "-3rem" }}>여자</span>
              </div>
              <div className="genderBtnBox">
                <button
                  className={`customRadioBtn mixedBtn ${selectedGender === "mixed" ? "selected" : ""}`}
                  data-name="mixed"
                  onClick={() => handleGenderSelect("mixed")}
                >
                  {selectedGender === "mixed" ? (
                    <img
                      src={CoupleSelected}
                      style={{
                        width: "10rem",
                        height: "12.9rem",
                        marginTop: "-0.3rem",
                        marginBottom: "0.23rem",
                      }}
                      alt="mixed selected img"
                    />
                  ) : (
                    <img
                      src={Couple}
                      style={{
                        width: "10rem",
                        height: "5.3rem",
                        marginTop: "0.2rem",
                        marginBottom: "0.4rem",
                      }}
                      alt="mixed img"
                    />
                  )}
                </button>
                <span style={{ marginLeft: "-1rem" }}>혼성</span>
              </div>
            </div>
          </div>
          <div className="selectBox headSelect">
            <div className="selectBoxTitle">
              <span>인원 수를 선택하세요</span>
            </div>
            <QuantityControl
              quantity={quantity}
              onIncrement={() => handleQuantityChange("increment")}
              onDecrement={() => handleQuantityChange("decrement")}
            ></QuantityControl>
          </div>
        </div>
        <div className="selfIntroduceContent">
          <div className="selfIntroduceTitle">
            <span className="spanMiddle">한줄 소개</span>
            <span className="spanSmall">(선택 사항)</span>
          </div>
          <textarea
            name="introduce"
            cols={"42"}
            rows={"1"}
            spellCheck="false"
            value={introduce}
            onChange={handleIntroduceChange}
          ></textarea>
        </div>
        <div className="friendCode">
          <div className="friendCodeTitle">
            <span className="spanMiddle">지인 코드 입력</span>
            <span className="spanSmall">(선택 사항)</span>
          </div>
          <textarea
            name="friendCode"
            cols={"42"}
            rows={"1"}
            spellCheck="false"
            value={friendCode}
            onChange={handleFriendCodeChange}
          ></textarea>
        </div>
        <div className="filmAgree">
          <div className="filmAgreeTitle">
            <span className="spanMiddle">촬영 동의서</span>
            <span className="spanSmall">(선택 사항)</span>
          </div>
          <div className="filmAgreeContent">
            저희 주점에 오신 것을 환영합니다!
            <br></br>
            안녕하세요. 바른주점에 찾아와주셔서 감사합니다.
            <br></br>
            저희 주점에서는 미디어 홍보 자료 제작을 위해 촬영을 진행하고
            있습니다.
            <br></br>
            촬영에 동의하시는 테이블에는 소정의 혜택을 드리고 있으니,
            괜찮으시다면 동의를 체크해주세요.
            <br></br>
            저희 주점에서 좋은 인연과 추억 많이 만들어 가시면 좋겠습니다.
            <br></br>
            감사합니다.
            <br></br>
            개인정보의 제3자 제공 동의약관
            <br></br>① 회사는 원칙적으로 수집 · 이용 목적 범위를 초과하거나
            회원의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 개인정보를
            제3자에게 제공하는 경우, 사전에 회원에게 ‘제공받는 자, 제공받는 자의
            이용 목적, 제공하는 개인정보 항목, 보유 및 이용기간을 고지 후 동의를
            구하며, 회원이 동의하지 않는 경우에는 제공하지 않습니다
            <br></br>② 회사는 다음과 같이 개인정보를 제3자에게 제공하고
            있습니다.<br></br>
            가. 제공받는 자 :(주)식파마/ 서비스를 이용하여 본인과 함께 주문한
            적이 있는 다른 이용자<br></br>나 제공목적 : 기업홍보<br></br>다
            제공하는 개인정보 항목 : 주점내에서 카메라로 촬영한 영상<br></br>
            라. 개인정보 보유 및 이용기간 : 이용자의 주문에 따른 서비스 제공
            완료 시까지 / 이용자의 동의 철회 시 지체없이 삭제 / 이용자의 동의
            철회 시 지체없이 삭제<br></br>
          </div>
          <div className="agreeCheckBox">
            <input
              type="checkbox"
              id="agree"
              name="agree"
              checked={agree}
              onChange={handleAgreeChange}
            ></input>
            <label htmlFor="agree">동의합니다</label>
          </div>
        </div>
        <button
          className="submitBtn"
          type="submit"
          value={"Submit"}
          onClick={handleSubmit}
        >
          {/*서버와의 통신 후 navigate()로 이동하므로 버튼에 Link가 필요없어 div로 임시 변경함*/}
          {selectedGender && quantity > 0 ? (
            <div className="submitBtnChecked">
              <span>제출하기</span>
            </div>
          ) : (
            <span>제출하기</span>
          )}
        </button>
      </form>
    </div>
  );
};
