import React from "react";
import styles from "./styles.module.css";
import TextareaAutosize from "react-textarea-autosize";

import TextEditor from "../textEditor";

function NewBlog() {
  return (
    <div className={styles.container}>
      <TextareaAutosize
        className={styles.title}
        placeholder="标题"
        rows="1"
      ></TextareaAutosize>
      <TextEditor></TextEditor>
    </div>
  );
}

export default NewBlog;
