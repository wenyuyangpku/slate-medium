import React from "react";
import styles from "./styles.module.css";
import { useSelected, useFocused, useSlate } from "slate-react";
import { Editor, Transforms } from "slate";

import ReactTooltip from "react-tooltip";
import { v4 } from "uuid";

import { Menu, Button } from "./components";

import { FiAlertCircle, FiBold, FiLink } from "react-icons/fi";

export const ImageElement = ({ attributes, children, element }) => {
  const selected = useSelected();
  const focused = useFocused();

  let ifSelected = selected && focused;

  let ImageStyle = styles.image;

  if (selected && focused) {
    ImageStyle = styles.imageSelected;
  }

  return (
    <div {...attributes}>
      <div contentEditable={false} className={styles.imageContainer}>
        {ifSelected && (
          <div className={styles.imageMenuContainer}>
            <Menu className={styles.imageMenu}>
              <ImageButton format="image-mid" icon="format_mid" />
              <ImageButton format="image-left" icon="format_left" />
            </Menu>
          </div>
        )}

        {element.type === "image-left" && (
          <img
            alt=""
            src={element.url}
            className={[ImageStyle, styles.imageLeft].join(" ")}
          />
        )}

        {element.type === "image-mid" && (
          <img alt="" src={element.url} className={ImageStyle} />
        )}
      </div>

      {children}
    </div>
  );
};

export const toggleImage = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const ImageButton = ({ format, icon }) => {
  let iconElement = <FiAlertCircle />;

  if (icon === "format_mid") iconElement = <FiLink strokeWidth={3} />;
  if (icon === "format_left") iconElement = <FiBold strokeWidth={3} />;

  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        if (isBlockActive(editor, format)) return;
        event.preventDefault();
        toggleImage(editor, format);
      }}
    >
      {iconElement}
    </Button>
  );
};

export const LinkElement = ({ attributes, children, element }) => {
  const id = v4();

  return (
    <span className={styles.link} {...attributes} data-tip data-for={id}>
      <ReactTooltip
        place="bottom"
        id={id}
        effect="solid"
        delayHide={500}
        className={styles.toolTips}
        contentEditable={false}
        clickable={true}
      >
        <div
          className={styles.dirty}
          onMouseDown={e => {
            alert("zxxx");
            e.stopPropagation();
          }}
        ></div>

        <a
          className={styles.linkContainer}
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          contentEditable={false}
        >
          {element.url}
        </a>
      </ReactTooltip>

      {children}
    </span>
  );
};
