import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import "styles/Admin.css";
import Title from "assets/images/RedLogo.svg";
import Tiger from "assets/images/Tiger.svg";
import Call from "assets/images/Call.svg";
import CloseBtn from "assets/images/close.svg";

import AdminTable from "components/Admin/AdminTable.js";
import AlarmBorder from "components/Admin/AlarmBorder.js";
import TableInfoModal from "components/Modal/AdminModal/TableInfoModal";
import TimeModal from "components/Modal/AdminModal/TimeModal";
import HeartModal from "components/Modal/AdminModal/HeartModal";
import ExitTableModal from "components/Modal/AdminModal/ExitTableModal";
import JoinTableModal from "components/Modal/AdminModal/JoinTableModal";

function Admin() {
  const [isOpenTableInfoModal, setIsOpenTableInfoModal] = useState(false);
  const [isOpenTimeModal, setIsOpenTimeModal] = useState(false);
  const [isOpenHeartModal, setIsOpenHeartModal] = useState(false);
  const [isOpenExitModal, setIsOpenExitModal] = useState(false);

  // a variable for render nums of each tables
  let tableNums = { male: 0, female: 0, mixed: 0, joined: 0, empty: 0 };
  let record = [];

  // a function for processing data after fetching
  // count each table's number and calculate remained time
  function postProcessData(datas) {
    record = datas.admin_record;
    let callList = [];
    record.map((rec) => {
      if (rec.type == "call") {
        callList = [...callList, rec.from];
        rec.message = String(rec.from) + "번 테이블에서 직원을 호출했습니다.";
      } else if (rec.type == "join") {
        rec.message =
          String(rec.from) +
          "번, " +
          String(rec.to) +
          "번 테이블의 합석 처리를 진행해 주세요.";
      } else if (rec.type == "like") {
        rec.message =
          String(rec.from) +
          "번 테이블이 " +
          String(rec.to) +
          "번 테이블에게 좋아요를 보냈습니다.";
      }
      return rec;
    });

    tableNums = { male: 0, female: 0, mixed: 0, joined: 0, empty: 0 };
    const currentTime = new Date();

    const processIndividualData = (data) => {
      const endTime = new Date(data.end_time);
      const remainedTime = (endTime.getTime() - currentTime) / 1000;

      // translate data to AdminTable
      return (
        <AdminTable
          tableNumber={data.table_no}
          gender={data.gender}
          headCount={data.nums}
          huntingSuccess={data.join}
          remainedTime={remainedTime}
          managerCall={callList.includes(data.table_no)}
          friendCode={data.referrer}
          onClickTable={(e) => {
            onClickTableElem(e, data);
          }}
        />
      );
    };
    record.sort((a, b) => b.index - a.index);
    const ret = datas.result.map((data) => processIndividualData(data));
    return ret;
  }

  // // variables that related to data fetching
  // // !!! DO NOT MODIFY !!!
  const { token } = useParams();
  const navigate = useNavigate();

  // Refetch query
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
        }),
      }).then((res) => res.json());
      return response;
    },
    select: (data) => {
      if (data.result && data.result !== "fail") {
        return postProcessData(data);
      } else {
        navigate("/error");
        return [];
      }
    },
    refetchInterval: 1000, // data refetch for every 1 sec.
    refetchIntervalInBackground: true,
    initialData: () => {
      // this seems to be not working as intended...
      return Array.from({ length: 30 }, (_, i) => {
        return {
          table_no: i + 1,
          gender: "",
          active: false,
          nums: 0,
          join: false,
          referrer: "",
        };
      });
    },
  });

  // this function is for buttons below tables.
  // modal will be opened if multiple select mode is enabled
  const onClickButton = (modalType) => {
    if (!isMultipleSelectMode || selectedTable.length < 1) {
      return;
    }

    if (modalType === "time") {
      setIsOpenTimeModal(true);
    } else if (modalType === "heart") {
      setIsOpenHeartModal(true);
    } else if (modalType === "exit") {
      setIsOpenExitModal(true);
    }
  };

  const onCloseModal = (modalType) => {
    if (modalType === "tableInfo") {
      setIsOpenTableInfoModal(false);
      setTableElem(null);
    } else if (modalType === "time") {
      setIsOpenTimeModal(false);
    } else if (modalType === "heart") {
      setIsOpenHeartModal(false);
    } else if (modalType === "exit") {
      setIsOpenExitModal(false);
    }
  };

  // handle both multiple and single selection of tables
  // if multiple mode is inactive, TableInfoModal will be opened
  // if multiple mode is active, selection mode will be executed
  const [isMultipleSelectMode, setIsMultipleSelectMode] = useState(false);
  const [selectedTable, setSelectedTable] = useState([]);

  // data for TableInfoModal
  const [tableElem, setTableElem] = useState(null);

  function onClickTableElem(event, tableData) {
    event.stopPropagation();

    if (!tableData.active) {
      return;
    }

    if (isMultipleSelectMode) {
      if (selectedTable.includes(tableData.table_no)) {
        setSelectedTable(
          selectedTable.filter((table) => table.table_no !== tableData.table_no)
        );
      } else {
        setSelectedTable([...selectedTable, tableData.table_no]);
      }
    } else {
      setIsOpenTableInfoModal(true);
      setTableElem(tableData);
    }
  }

  const [buttonStyle, setButtonStyle] = useState({
    backgroundColor: "#87deff",
    color: "#fff",
  });

  const onClickTableSelectButton = () => {
    let buttonStyle = {}; // 함수 내부에서 변수 선언

    if (isMultipleSelectMode) {
      setSelectedTable([]);
      setButtonStyle({
        backgroundColor: "#fff",
        color: "#87deff",
      });
    } else {
      setButtonStyle({
        backgroundColor: "#87deff",
        color: "#fff",
      });
    }
    setIsMultipleSelectMode(!isMultipleSelectMode);
  };

  const onDeleteAlarm = async (index) => {
    await fetch(process.env.REACT_APP_API_URL + "/admin/del-record", {
      mode: "cors",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: token,
        notice_index: index,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.result == "fail") {
          alert("서버 에러 발생!");
        }
      });
  };

  // 현재 시간 출력
  const CurrentDateTime = () => {
    let [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
      const intervalId = setInterval(() => {
        setCurrentDateTime(new Date());
      }, 1000);

      return () => clearInterval(intervalId);
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString();
    const hours = currentDateTime.getHours();
    const minutes = currentDateTime.getMinutes();
    const formattedHours = hours < 10 ? `0${hours}` : hours;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = hours >= 12 ? "PM" : "AM";
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}`;

    return (
      <div>
        <span className="header-date">{formattedDate}&nbsp;&nbsp;</span>
        <span className="header-time">{formattedTime}</span>
      </div>
    );
  };

  return (
    <div className="admin_body">
      <header id="admin_header_top">
        <div class="admin_header">
          <div class="main-title">
            <img className="title-tiger" src={Tiger} alt="Tiger"></img>
            <img className="title-logo" src={Title} alt="Title"></img>
          </div>
          <div className="digital-clock">
            <CurrentDateTime />
          </div>
        </div>
        <div class="title-alarm">
          <span class="title-notice">NOTICE</span>
          <img class="title-bell" src={Call} alt="Call img" />
        </div>
      </header>
      <main id="admin_main">
        <div id="table-information">
          <div class="table-list">
            <div class="table-man">{tableNums.male}</div>
            <div class="table-woman">{tableNums.female}</div>
            <div class="table-mixed">{tableNums.mixed}</div>
            <div class="table-join">{tableNums.joined}</div>
            <div class="table-empty">{tableNums.empty}</div>
          </div>
          <div class="admin_nav">
            <div class="info_table1">
              <span class="info_title">남자&nbsp;T</span>
            </div>
            <div class="info_table2">
              <span class="info_title">여자&nbsp;T</span>
            </div>
            <div class="info_table3">
              <span class="info_title">혼성&nbsp;T</span>
            </div>
            <div class="info_table4 q">
              <span class="info_title">합석&nbsp;T</span>
            </div>
            <div class="info_table5">
              <span class="info_title">빈&nbsp;T</span>
            </div>
          </div>
          <div class="table-container">
            <div className="table-container-grid">
              {React.Children.toArray(data).map((child) => {
                const tableNumber = child.props.tableNumber;
                const isSelected = selectedTable.includes(tableNumber);
                return React.cloneElement(child, {
                  className: isSelected ? "selected-table" : "",
                });
              })}
            </div>
            {isOpenTableInfoModal && (
              <TableInfoModal
                onClose={() => onCloseModal("tableInfo")}
                tableNumber={tableElem.table_no}
                nums={tableElem.nums}
                startTime={tableElem.start_time}
                endTime={tableElem.end_time}
                code={tableElem.code}
                referrer={tableElem.referrer}
              ></TableInfoModal>
            )}
          </div>
          <div className="admin-footer">
            <div className="footer-button">
              <div className="blue-btn-box">
                <button
                  className="time-plus"
                  onClick={() => onClickButton("time")}
                >
                  시간 추가
                </button>
                {isOpenTimeModal && (
                  <TimeModal
                    onClose={() => onCloseModal("time")}
                    targetTables={selectedTable}
                  ></TimeModal>
                )}
                <button
                  className="heart-plus"
                  onClick={() => onClickButton("heart")}
                >
                  하트 충전
                </button>
                {isOpenHeartModal && (
                  <HeartModal
                    onClose={() => onCloseModal("heart")}
                    targetTables={selectedTable}
                  ></HeartModal>
                )}
                <button
                  className="table-exit"
                  onClick={() => onClickButton("exit")}
                >
                  퇴장 처리
                </button>
                {isOpenExitModal && (
                  <ExitTableModal
                    onClose={() => onCloseModal("exit")}
                    targetTables={selectedTable}
                  ></ExitTableModal>
                )}
              </div>
              <button
                className="table_choice"
                style={buttonStyle}
                onClick={onClickTableSelectButton}
              >
                {isMultipleSelectMode ? "선택 취소" : "테이블 선택"}
              </button>
            </div>
          </div>
        </div>
        <div className="alarm-container">
          {record.map((item) => {
            return (
              <div className="alarm-item">
                <button
                  className="alarmdel"
                  onClick={() => onDeleteAlarm(item.index)}
                >
                  <img
                    className="alarmbtn"
                    src={CloseBtn}
                    alt="close btn"
                  ></img>
                </button>
                <br />
                {/* 알람데이터 type에 따라 color 지정 */}
                <span
                  className="alarmData-span"
                  style={{
                    color:
                      item.type == "join"
                        ? "#DD7DFF"
                        : item.type == "like"
                          ? "#FF8FD2"
                          : item.type == "call"
                            ? "#FFC555"
                            : "red",
                  }}
                >
                  {item.type == "join"
                    ? "[합석처리]"
                    : item.type == "call"
                      ? "[직원 호출]"
                      : item.type == "like"
                        ? "[하트 수신]"
                        : "[undefined]"}
                </span>
                <span className="alarm-message">{item.message}</span>
                <p className="alarm-time-p">{item.time}</p>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Admin;
