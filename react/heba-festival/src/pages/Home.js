import React, { Component, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import ServerModal from "components/Modal/ServerModal";
import "styles/common.scss";
import "styles/Home.scss";
import Table from "components/Table";
import Dashed from "assets/images/dashed.svg";
import HomeImg from "assets/images/home.svg";
import AlarmImg from "assets/images/alarm.svg";
import RedAlarmImg from "assets/images/RedAlarm.svg";
import SendHeartImg from "assets/images/SendHeart.svg";
import TimeImg from "assets/images/Time.svg";
import CallServerImg from "assets/images/server.svg";
import HeartChargeImg from "assets/images/chargeHeart.svg";
import OrderImg from "assets/images/order.svg";
import MyPageImg from "assets/images/myPage.svg";
import KeyImg from "assets/images/Key.svg";
import HeartChargeModal from "components/Modal/HeartChargeModal";
import MyPageModal from "components/Modal/MyPageModal";
// TODO: 하트를 받을 시 해당 모달 팝업
import ReceivedHeartModal from "components/Modal/ReceivedHeartModal";
// TODO: 헌팅 성공 시 해당 모달 팝업
import HuntingSuccessModal from "components/Modal/HuntingSucessModal";

import AlarmModal from "components/Modal/Alarm/AlarmModal";
const Home = () => {
  const [isOpenServerModal, setIsOpenServerModal] = useState(false);
  const [isOpenHeartChargeModal, setIsOpenHeartChargeModal] = useState(false);
  const [isOpenMyPageModal, setIsOpenMyPageModal] = useState(false);
  const [isOpenAlarmModal, setIsOpenAlarmModal] = useState(false);
  const [filter, setFilter] = useState("all"); // 기본 필터는 전체
  let hasNotice = useRef(false);

  let myTableInfo = null;
  let likes = 0;
  let remainedTime = 0;

  let record = [];
  let timeRecord = useRef([]);
  let totalRecord = [];
  let hasNoticedTimeAlert = useRef(false);
  let hasNoticedTimeOut = useRef(false);

  const setMyTableInfo = (tableData) => {
    myTableInfo = tableData;

    const today = new Date();
    const endTime = new Date(myTableInfo.end_time);
    remainedTime = (endTime.getTime() - today) / 1000;
    likes = myTableInfo.likes;

    record = myTableInfo.record;

    if (remainedTime <= 0) {
      remainedTime = 0;
      if (!hasNoticedTimeOut.current) {
        timeRecord.current.push({
          type: "timeout",
          time:
            String(endTime.getHours()).padStart(2, "0") +
            ":" +
            String(endTime.getMinutes()).padStart(2, "0"),
          index: 999999999,
        });
        hasNoticedTimeOut.current = true;
      }
    } else if (remainedTime <= 600) {
      if (!hasNoticedTimeAlert.current) {
        // don't combine this with upper line
        const alertTime = new Date(endTime.getTime() - 10 * 60 * 1000);
        timeRecord.current.push({
          type: "timeAlert",
          time:
            String(alertTime.getHours()).padStart(2, "0") +
            ":" +
            String(alertTime.getMinutes()).padStart(2, "0"),
          index: 999999999,
        });
        hasNoticedTimeAlert.current = true;
      }
    } else {
      // to ensure notice if time is added by admin
      hasNoticedTimeAlert.current = false;
      hasNoticedTimeOut.current = false;
    }

    let noticeFilter = secureLocalStorage.getItem("notice_filter");
    if (noticeFilter == null) {
      noticeFilter = [];
      secureLocalStorage.setItem("notice_filter", noticeFilter);
    }

    totalRecord = record
      .concat(timeRecord.current)
      .filter((record) => !noticeFilter.includes(record.index))
      .sort((a, b) => b.index - a.index);

    // I don't want to use this logic, but...
    const noticeBefore = secureLocalStorage.getItem("notice");
    if (noticeBefore == null) {
      // it's first time connection, so set notice to local storage and disable alert
      secureLocalStorage.setItem("notice", totalRecord);
    } else if (JSON.stringify(noticeBefore) !== JSON.stringify(totalRecord)) {
      hasNotice.current = true;
      secureLocalStorage.setItem("notice", totalRecord);
    }
  };

  const navigate = useNavigate();

  function getHuntingState(data) {
    if (
      myTableInfo.rejected.includes(data.table_no) ||
      data.rejected.includes(myTableInfo.table_no)
    ) {
      return "broken";
    } else if (myTableInfo.received.includes(data.table_no)) {
      return "received";
    } else if (myTableInfo.sent.includes(data.table_no)) {
      return "sent";
    }
    return "";
  }

  function transformTableArray(datas) {
    // 이게 여기가 아니면 동작을 안해서 일단 임시로 여기 넣어둠...
    // 이거 위치 수정하다 2시간 넘게 썼으니 수정 시 유의..
    setMyTableInfo(
      datas.find(
        (elem) => elem.table_no === secureLocalStorage.getItem("table_no")
      )
    );
    const transformTableData = (data) => (
      <Table
        tableData={data}
        myGender={myTableInfo.gender}
        huntingStatus={getHuntingState(data)}
        remainedLikes={myTableInfo.likes}
      />
    );
    return datas.map((data) => transformTableData(data));
  }

  const token = secureLocalStorage.getItem("token");
  const code = secureLocalStorage.getItem("code");
  const queryclient = useQueryClient();
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["get-all"],
    queryFn: async () => {
      const response = await fetch(process.env.REACT_APP_API_URL + "/get-all", {
        mode: "cors",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          code: code,
        }),
      }).then((res) => res.json());
      return response;
    },
    select: (data) => {
      if (data.result && data.result !== "fail") {
        return transformTableArray(data.result);
      } else {
        navigate("/error");
        return [];
      }
    },
    refetchInterval: 1000, // data refetch for every 1 sec.
    refetchIntervalInBackground: true,
    initialData: () => {
      return Array.from({ length: 35 }, (_, i) => (
        <Table tableNumber={i + 1} gender="" headCount={"0"} />
      ));
    },
  });

  const onClickButton = (modalType) => {
    if (modalType === "server") {
      setIsOpenServerModal(true);
    } else if (modalType === "heartCharge") {
      setIsOpenHeartChargeModal(true);
    } else if (modalType === "myPage") {
      setIsOpenMyPageModal(true);
    } else if (modalType === "alarm") {
      hasNotice.current = false;
      setIsOpenAlarmModal(true);
    }
  };

  const onCloseModal = (modalType) => {
    if (modalType === "server") {
      setIsOpenServerModal(false);
    } else if (modalType === "heartCharge") {
      setIsOpenHeartChargeModal(false);
    } else if (modalType === "myPage") {
      setIsOpenMyPageModal(false);
    } else if (modalType === "alarm") {
      setIsOpenAlarmModal(false);
    }
  };

  if (isLoading) {
    console.log("loading...");
    return <div> loading... </div>;
  }
  if (error) {
    console.log(data);
    console.log(error);
    navigate("/error");
  }

  return (
    <div>
      <div id="wrapper">
        <header>
          <nav>
            <Link to={"/landing"}>
              <img className="landing" src={HomeImg} alt="homepage img"></img>
            </Link>
            <span>바른주점</span>
            <button className="alarmBtn" onClick={() => onClickButton("alarm")}>
              <img
                className={`alarmImg ${hasNotice.current ? "red" : ""}`}
                src={hasNotice.current ? RedAlarmImg : AlarmImg}
                alt="alarm img"
              ></img>
            </button>
            {isOpenAlarmModal && (
              <AlarmModal
                onClose={() => onCloseModal("alarm")}
                alarmData={totalRecord}
              ></AlarmModal>
            )}
          </nav>
          <div id="subNav">
            <div id="subNavFilter">
              <div className="filterBtn">
                <button
                  className="allFilter filterActive"
                  onClick={() => setFilter("all")}
                >
                  <span>전체</span>
                </button>
              </div>
              <div className="filterBtn">
                <button
                  className="femaleFilter"
                  onClick={() => setFilter("female")}
                >
                  <span>여자</span>
                </button>
              </div>
              <div className="filterBtn">
                <button
                  className="maleFilter"
                  onClick={() => setFilter("male")}
                >
                  <span>남자</span>
                </button>
              </div>
            </div>
            <div id="statusWindow">
              <div className="showEnterCode">
                <img src={KeyImg} alt="key img"></img>
                <span>{code}</span>
              </div>
              <div className="leftoverHeart">
                <img src={SendHeartImg} alt="sendHeart img"></img>
                <span className="heartMultiple">X</span>
                <span>{likes}</span>
              </div>
              <div className="leftoverTime">
                <img src={TimeImg} alt="time img"></img>
                <span>
                  {String(Math.floor(remainedTime / 60)).padStart(2, "0")}:
                  {String(Math.floor(remainedTime % 60)).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main id="container">
          {React.Children.toArray(data).filter(
            (table) => filter === "all" || table.props.gender === filter
          )}
        </main>
        <footer>
          <button
            className="callServer"
            onClick={() => onClickButton("server")}
          >
            <div className="btnBox">
              <img
                src={CallServerImg}
                style={{
                  width: "2.2rem",
                  height: "2.2rem",
                  marginBottom: "0.2rem",
                }}
                alt="footer callServer img"
              ></img>
              <span>직원호출</span>
            </div>
            <img src={Dashed} alt="dashed img"></img>
          </button>
          {isOpenServerModal && (
            <ServerModal
              open={isOpenServerModal}
              onClose={() => onCloseModal("server")}
            ></ServerModal>
          )}
          <button
            className="chargeHeart"
            onClick={() => onClickButton("heartCharge")}
          >
            <div className="btnBox">
              <img
                src={HeartChargeImg}
                style={{
                  width: "3rem",
                  height: "1.6rem",
                  marginTop: "0.3rem",
                  marginBottom: "0.5rem",
                }}
                alt="footer heartCharge img"
              ></img>
              <span>하트충전</span>
            </div>
            <img src={Dashed} alt="dashed img"></img>
          </button>
          {isOpenHeartChargeModal && (
            <HeartChargeModal
              open={isOpenHeartChargeModal}
              onClose={() => onCloseModal("heartCharge")}
            ></HeartChargeModal>
          )}
          <button className="order">
            <Link
              to={"https://order.sicpama.com/?token=" + token}
              className="orderLink"
            >
              <div
                className="btnBox"
                style={{ display: "flex", width: "100%" }}
              >
                <img
                  src={OrderImg}
                  style={{
                    width: "3rem",
                    height: "2.2rem",
                    marginBottom: "0.2rem",
                  }}
                  alt="footer order img"
                ></img>
                <span>주문하기</span>
              </div>
            </Link>
            <img
              src={Dashed}
              style={{ width: "0.1rem", float: "right" }}
              alt="dashed img"
            ></img>
          </button>
          <button className="myPage" onClick={() => onClickButton("myPage")}>
            <div className="btnBox">
              <img
                src={MyPageImg}
                style={{
                  width: "2rem",
                  height: "2rem",
                  marginTop: "0.1rem",
                  marginBottom: "0.3rem",
                }}
                alt="myPage img"
              ></img>
              <span>마이페이지</span>
            </div>
          </button>
          {isOpenMyPageModal && (
            <MyPageModal
              open={isOpenMyPageModal}
              onClose={() => onCloseModal("myPage")}
              myInfo={myTableInfo}
            ></MyPageModal>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Home;
