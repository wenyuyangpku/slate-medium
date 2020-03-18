import React from "react";
import styles from "./styles.module.css";
import { useDispatch } from "react-redux";
import ReactModal from "react-modal";

import LoginControl from "../loginControl";

import { toLogin } from "../../reducer/authSlice";
import { Redirect } from "react-router-dom";

function Home() {
  ReactModal.setAppElement("#root");
  return (
    <div>
      <Header></Header>
      <Main></Main>
      <LoginControl></LoginControl>
    </div>
  );
}

export default Home;

function Header() {
  const dispatch = useDispatch();

  if (true) return <Redirect to="new-blog"></Redirect>;

  return (
    <div className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.logoContainer}>
          <img className={styles.logo} src="deep-logo.jpg" alt=""></img>
          <div className={styles.logoname}>深度</div>
        </div>
        <div>
          <button
            className={styles.button_2}
            onClick={() => {
              dispatch(toLogin(true));
            }}
          >
            登录
          </button>
          <button className={styles.button_1}>加入</button>
        </div>
      </div>
    </div>
  );
}

function Main() {
  return (
    <div className={styles.main}>
      <div className={styles.mainContianer}>
        <div className={styles.text_1}>
          Get smarter about what matters to you.
        </div>
      </div>
    </div>
  );
}
