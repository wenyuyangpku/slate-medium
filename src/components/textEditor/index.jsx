import React, { useMemo, useState, useCallback } from "react";
import styles from "./styles.module.css";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { withHistory } from "slate-history";
import isHotkey from "is-hotkey";

import { HoveringToolbar, Element, Leaf, toggleMark } from "./hoveringToolbar";
import { MenuSidebar } from "./menuSidebar";
import { withImages, withMarkdown, withLinks } from "./withFunctions";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const TextEditor = () => {
  const editor = useMemo(
    () =>
      withHistory(
        withLinks(withMarkdown(withImages(withReact(createEditor()))))
      ),
    []
  );

  const [value, setValue] = useState(initialValue);

  const renderElement = useCallback(props => <Element {...props} />, []);

  return (
    <Slate editor={editor} value={value} onChange={value => setValue(value)}>
      <HoveringToolbar />
      <MenuSidebar />

      <Editable
        placeholder="说说你的故事吧…"
        autoFocus
        className={styles.container}
        renderLeaf={props => <Leaf {...props} />}
        renderElement={renderElement}
        onKeyDown={event => {
          for (const hotkey in HOTKEYS) {
            if (isHotkey(hotkey, event)) {
              event.preventDefault();
              const mark = HOTKEYS[hotkey];
              toggleMark(editor, mark);
            }
          }
        }}
      />
    </Slate>
  );
};

export default TextEditor;

const initialValue = [
  {
    type: "paragraph",
    children: [
      {
        text: ""
      }
    ]
  }
];

// const withImages = editor => {
//   const { insertData, isVoid } = editor;
//   editor.isVoid = element => {
//     return ["image-mid", "image-left"].includes(element.type)
//       ? true
//       : isVoid(element);
//   };
//   editor.insertData = data => {
//     const text = data.getData("text/plain");

//     const { files } = data;

//     if (files && files.length > 0) {
//       for (const file of files) {
//         const reader = new FileReader();
//         const [mime] = file.type.split("/");

//         if (mime === "image") {
//           reader.addEventListener("load", () => {
//             const url = reader.result;
//             insertImage(editor, url);
//           });

//           reader.readAsDataURL(file);
//         }
//       }
//     } else if (isImageUrl(text)) {
//       insertImage(editor, text);
//     } else {
//       insertData(data);
//     }
//   };
//   return editor;
// };

// const withLinks = editor => {
//   const { insertData, insertText, isInline } = editor;

//   editor.isInline = element => {
//     return element.type === "link" ? true : isInline(element);
//   };

//   editor.insertText = text => {
//     if (text && isUrl(text)) {
//       wrapLink(editor, text);
//     } else {
//       insertText(text);
//     }
//   };

//   editor.insertData = data => {
//     const text = data.getData("text/plain");

//     if (text && isUrl(text)) {
//       alert(text);

//       wrapLink(editor, text);
//     } else {
//       insertData(data);
//     }
//   };

//   return editor;
// };

// const withShortcuts = editor => {
//   const { deleteBackward, insertText } = editor;

//   editor.insertText = text => {
//     const { selection } = editor;

//     if (text === " " && selection && Range.isCollapsed(selection)) {
//       const { anchor } = selection;
//       const block = Editor.above(editor, {
//         match: n => Editor.isBlock(editor, n)
//       });
//       const path = block ? block[1] : [];
//       const start = Editor.start(editor, path);
//       const range = { anchor, focus: start };
//       const beforeText = Editor.string(editor, range);
//       const type = SHORTCUTS[beforeText];

//       if (type) {
//         Transforms.select(editor, range);
//         Transforms.delete(editor);
//         Transforms.setNodes(
//           editor,
//           { type },
//           { match: n => Editor.isBlock(editor, n) }
//         );

//         if (type === "list-item") {
//           const list = { type: "bulleted-list", children: [] };
//           Transforms.wrapNodes(editor, list, {
//             match: n => n.type === "list-item"
//           });
//         }

//         return;
//       }
//     }

//     insertText(text);
//   };

//   editor.deleteBackward = (...args) => {
//     const { selection } = editor;

//     if (selection && Range.isCollapsed(selection)) {
//       const match = Editor.above(editor, {
//         match: n => Editor.isBlock(editor, n)
//       });

//       if (match) {
//         const [block, path] = match;
//         const start = Editor.start(editor, path);

//         if (
//           block.type !== "paragraph" &&
//           Point.equals(selection.anchor, start)
//         ) {
//           Transforms.setNodes(editor, { type: "paragraph" });

//           if (block.type === "list-item") {
//             Transforms.unwrapNodes(editor, {
//               match: n => n.type === "bulleted-list",
//               split: true
//             });
//           }

//           return;
//         }
//       }

//       deleteBackward(...args);
//     }
//   };

//   return editor;
// };

// const withHtml = editor => {
//   const { insertData, isInline, isVoid } = editor;

//   editor.isInline = element => {
//     return element.type === "link" ? true : isInline(element);
//   };

//   editor.isVoid = element => {
//     return element.type === "image" ? true : isVoid(element);
//   };

//   editor.insertData = data => {
//     const html = data.getData("text/html");

//     console.log(html);

//     if (html) {
//       const parsed = new DOMParser().parseFromString(html, "text/html");
//       const fragment = deserialize(parsed.body);

//       Transforms.insertFragment(editor, fragment);
//       return;
//     }

//     insertData(data);
//   };

//   return editor;
// };
