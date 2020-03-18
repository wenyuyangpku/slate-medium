import React, { useRef, useEffect } from "react";
import styles from "./hoveringToolbar.module.css";
import { useSlate, ReactEditor } from "slate-react";
import { Editor, Range, Transforms } from "slate";
import { jsx } from "slate-hyperscript";

import {
  FiAlertCircle,
  FiBold,
  FiItalic,
  FiLink,
  FiType,
  FiCode
} from "react-icons/fi";
import { FaQuoteRight } from "react-icons/fa";

import { Portal, Menu, Button } from "./components";
import { ImageElement, LinkElement } from "./elements";
import { insertLink, isLinkActive } from "./insertFunctions";
export const HoveringToolbar = () => {
  const ref = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el = ref.current;
    const { selection } = editor;

    if (!el) {
      return;
    }

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ""
    ) {
      el.removeAttribute("style");
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection.getRangeAt(0);
    const rect = domRange.getBoundingClientRect();
    el.style.opacity = 1;
    el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
    el.style.left = `${rect.left +
      window.pageXOffset -
      el.offsetWidth / 2 +
      rect.width / 2}px`;
  });

  return (
    <Portal>
      <Menu ref={ref} className={styles.menu}>
        <MarkButton format="bold" icon="format_bold" />
        <MarkButton format="italic" icon="format_italic" />
        <LinkButton format="link" icon="format_link" />
        <MarkButton format="code" icon="format_code" />
        <BlockButton format="heading-one" icon="format_headingOne" />
        <BlockButton format="heading-two" icon="format_headingTwo" />
        <BlockButton format="block-quote" icon="format_quote" />
      </Menu>
    </Portal>
  );
};

export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const MarkButton = ({ format, icon }) => {
  let iconElement = <FiAlertCircle />;

  if (icon === "format_bold") iconElement = <FiBold strokeWidth={3} />;
  if (icon === "format_italic") iconElement = <FiItalic strokeWidth={3} />;
  if (icon === "format_code") iconElement = <FiCode strokeWidth={3} />;

  const editor = useSlate();

  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {iconElement}
    </Button>
  );
};

export const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.code) {
    children = <code className={styles.code}>{children}</code>;
  }

  return <span {...attributes}>{children}</span>;
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const toggleBlock = (editor, format) => {
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

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const BlockButton = ({ format, icon }) => {
  let iconElement = <FiAlertCircle />;

  if (icon === "format_headingOne")
    iconElement = <FiType size={20} strokeWidth={3} />;
  if (icon === "format_headingTwo")
    iconElement = <FiType size={14} strokeWidth={3} />;
  if (icon === "format_quote") iconElement = <FaQuoteRight size={14} />;

  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {iconElement}
    </Button>
  );
};

export const Element = ({ attributes, children, element }) => {
  const props = { attributes, children, element };
  switch (element.type) {
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "block-quote":
      return (
        <blockquote className={styles.blockquote} {...attributes}>
          {children}
        </blockquote>
      );
    case "image-mid":
      return <ImageElement {...props}></ImageElement>;
    case "image-left":
      return <ImageElement {...props}></ImageElement>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "list-item":
      return (
        <li className={styles.list} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol className={styles.numberList} {...attributes}>
          {children}
        </ol>
      );
    case "list-item-number":
      return (
        <li className={styles.numberListItem} {...attributes}>
          {children}
        </li>
      );
    case "link":
      return <LinkElement {...props}></LinkElement>;

    default:
      return (
        <div className={styles.font} {...attributes}>
          {children}
        </div>
      );
  }
};

const LinkButton = ({ icon }) => {
  let iconElement = <FiAlertCircle />;

  if (icon === "format_link") iconElement = <FiLink strokeWidth={3} />;

  const editor = useSlate();
  return (
    <Button
      active={isLinkActive(editor)}
      onMouseDown={event => {
        event.preventDefault();
        const url = window.prompt("Enter the URL of the link:");
        if (!url) return;
        insertLink(editor, url);
      }}
    >
      {iconElement}
    </Button>
  );
};

export const deserialize = el => {
  if (el.nodeType === 3) {
    return el.textContent;
  } else if (el.nodeType !== 1) {
    return null;
  } else if (el.nodeName === "BR") {
    return "\n";
  }

  const { nodeName } = el;
  let parent = el;

  if (
    nodeName === "PRE" &&
    el.childNodes[0] &&
    el.childNodes[0].nodeName === "CODE"
  ) {
    parent = el.childNodes[0];
  }
  const children = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  if (el.nodeName === "BODY") {
    return jsx("fragment", {}, children);
  }

  if (ELEMENT_TAGS[nodeName]) {
    const attrs = ELEMENT_TAGS[nodeName](el);
    return jsx("element", attrs, children);
  }

  if (TEXT_TAGS[nodeName]) {
    const attrs = TEXT_TAGS[nodeName](el);
    return children.map(child => jsx("text", attrs, child));
  }

  return children;
};

const ELEMENT_TAGS = {
  A: el => ({ type: "link", url: el.getAttribute("href") }),
  BLOCKQUOTE: () => ({ type: "quote" }),
  H1: () => ({ type: "heading-one" }),
  H2: () => ({ type: "heading-two" }),
  H3: () => ({ type: "heading-three" }),
  H4: () => ({ type: "heading-four" }),
  H5: () => ({ type: "heading-five" }),
  H6: () => ({ type: "heading-six" }),
  IMG: el => ({ type: "image-mid", url: el.getAttribute("src") }),
  LI: () => ({ type: "list-item" }),
  OL: () => ({ type: "numbered-list" }),
  P: () => ({ type: "paragraph" }),
  PRE: () => ({ type: "code" }),
  UL: () => ({ type: "bulleted-list" })
};

// COMPAT: `B` is omitted here because Google Docs uses `<b>` in weird ways.
const TEXT_TAGS = {
  CODE: () => ({ code: true }),
  DEL: () => ({ strikethrough: true }),
  EM: () => ({ italic: true }),
  I: () => ({ italic: true }),
  S: () => ({ strikethrough: true }),
  STRONG: () => ({ bold: true }),
  U: () => ({ underline: true })
};
