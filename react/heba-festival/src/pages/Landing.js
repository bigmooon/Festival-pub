import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "styles/common.scss";
import "styles/Landing.scss";
import Logo from "assets/images/Logo.svg";
import secureLocalStorage from "react-secure-storage";
import LockModal from "components/Modal/LockModal";

export const Landing = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    fetchData();
  };

  const token = secureLocalStorage.getItem("token");
  // assume it's valid token if token is exist in secureLocalStorage
  // TODO: need to be change later
  if (token == null || secureLocalStorage.getItem("table_no") == null) {
    navigate("/error");
  }

  const fetchData = async () => {
    try {
      await fetch(process.env.REACT_APP_API_URL + "/get-table", {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          code: secureLocalStorage.getItem("code"),
        }),
      })
        .then((res) => res.json())
        .then((response) => {
          if (response.result === "fail") {
            navigate("/error");
          } else if (response.result === "code_unmatch") {
            setIsModalOpen(true);
          } else {
            setIsModalOpen(false);
            secureLocalStorage.setItem("gender", response.result.gender);
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="homeWrap">
      {isModalOpen && <LockModal onClose={handleCloseModal} />}
      <div className="homeTitle">
        <img src={Logo} alt="logo"></img>
      </div>
      <div className="homeSubtitle">
        <span>올바른 만남이 모여 인연이 되다</span>
      </div>
      <div className="homeBtnContainer">
        <button className="linkSicpama">
          <Link
            to={"https://order.sicpama.com/?token=" + token}
            style={{ textDecorationLine: "none" }}
          >
            <div className="homeBtnTitle">
              <span>주문하기</span>
            </div>
          </Link>
        </button>
        <button className="linkHEBA">
          <Link
            to={isModalOpen ? "/error" : "/home"}
            style={{ textDecorationLine: "none" }}
          >
            <div className="homeBtnTitle">
              <span>헌팅하기</span>
            </div>
          </Link>
        </button>
      </div>
    </div>
  );
};
