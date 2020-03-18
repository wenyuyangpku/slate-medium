import React from "react";
import styles from "./styles.module.css";
import ReactModal from "react-modal";
import { useSelector, useDispatch } from "react-redux";

import { selectAuth, toLogin } from "../../reducer/authSlice";

function LoginControl() {
  const auth = useSelector(selectAuth);
  const dispatch = useDispatch();

  function closeLoginModal() {
    dispatch(toLogin(false));
    document.body.style.overflow = "unset";
    document.body.style.paddingRight = "0px";
  }

  return (
    <ReactModal
      isOpen={auth.openLoginControl}
      onRequestClose={closeLoginModal}
      className={styles.modal}
      overlayClassName={styles.overlay}
    >
      123
    </ReactModal>
  );
}

export default LoginControl;
