import React, { useRef, useEffect } from "react";
import styles from "./menuSidebar.module.css";
import { useSlate, ReactEditor } from "slate-react";
import { FiXCircle } from "react-icons/fi";

import { Portal } from "./components";
import { insertImage } from "./insertFunctions";

export const MenuSidebar = () => {
  const ref = useRef();
  const fileInput = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection, children } = editor;

    if (!el) {
      return;
    }

    if (!selection || !ReactEditor.isFocused(editor)) {
      el.removeAttribute("style");
      return;
    }

    if (
      ["image-mid", "image-left"].includes(
        children[selection.anchor.path[0]].type
      )
    ) {
      el.removeAttribute("style");
      return;
    }

    if (children[selection.anchor.path[0]].children[0].text !== "") {
      el.removeAttribute("style");
      return;
    }

    function handleResize() {
      const domSelection = window.getSelection();
      const domRange = domSelection.getRangeAt(0);
      const rect = domRange.getBoundingClientRect();

      el.style.opacity = 1;
      el.style.top = `${rect.top +
        window.pageYOffset -
        el.offsetHeight / 2 +
        24}px`;
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth -
        12 +
        rect.width / 2}px`;
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return function cleanup() {
      window.removeEventListener("resize", handleResize);
    };
  });

  return (
    <Portal>
      <div
        ref={ref}
        className={styles.menu}
        onMouseDown={e => {
          e.preventDefault();
          fileInput.current.click();
        }}
      >
        <FiXCircle
          size={32}
          strokeWidth={1}
          className={styles.icon}
        ></FiXCircle>
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.gif"
        ref={fileInput}
        className={styles.inputFile}
        onChange={() => {
          handleFile(fileInput, editor);
        }}
      ></input>
    </Portal>
  );
};

function handleFile(fileInput, editor) {
  try {
    const file = fileInput.current.files[0];
    const reader = new FileReader();
    reader.onloadend = function() {
      insertImage(editor, reader.result);
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error(error);
  }
}

export default MenuSidebar;
