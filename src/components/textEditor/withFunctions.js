import { Transforms, Editor, Point, Range } from "slate";
import { insertImage, isImageUrl, wrapLink } from "./insertFunctions";
import isUrl from "is-url";

export const withImages = editor => {
  const {
    isVoid,
    deleteForward,
    deleteBackward,
    insertBreak,
    insertData
  } = editor;

  editor.isVoid = element => {
    if (["image-mid", "image-left"].includes(element.type)) return true;
    else return isVoid(element);
  };

  editor.insertData = data => {
    const text = data.getData("text/plain");
    const { files } = data;

    if (files && files.length > 0) {
      for (const file of files) {
        const reader = new FileReader();
        const [mime] = file.type.split("/");

        if (mime === "image") {
          reader.addEventListener("load", () => {
            const url = reader.result;
            insertImage(editor, url);
          });

          reader.readAsDataURL(file);
        }
      }
    } else if (isImageUrl(text)) {
      insertImage(editor, text);
    } else {
      console.log(data);

      insertData(data);
    }
  };

  editor.deleteForward = () => {
    const nextNode = Editor.next(editor);
    const thisNode = Editor.parent(editor, editor.selection);

    if (nextNode !== undefined) {
      if (["image-mid"].includes(nextNode[0].type)) {
        if (thisNode[0].children[0].text === "") {
          Transforms.removeNodes(editor);
        }
        Transforms.select(editor, [editor.selection.anchor.path[0] + 1, 0]);
        return;
      }
    }

    return deleteForward();
  };

  editor.deleteBackward = () => {
    if (editor.selection.anchor.path[0] === 0) return deleteBackward();

    const nextNode = Editor.above(editor, {
      at: [editor.selection.anchor.path[0] - 1, 0]
    });
    const thisNode = Editor.parent(editor, editor.selection);

    if (nextNode !== undefined) {
      if (thisNode[0].children[0].text === "") {
        if (["image-mid"].includes(nextNode[0].type)) {
          if (["image-mid"].includes(thisNode[0].type)) {
            Transforms.removeNodes(editor);
            Transforms.select(editor, [editor.selection.anchor.path[0], 0]);
          } else {
            Transforms.select(editor, [editor.selection.anchor.path[0] - 1, 0]);
          }
          return;
        }
      }
    }

    return deleteBackward();
  };

  editor.insertBreak = () => {
    const thisNode = Editor.parent(editor, editor.selection);

    if (["image-mid"].includes(thisNode[0].type)) {
      const text = { type: "paragraph", children: [{ text: "" }] };

      const endPoint = Editor.end(editor, [
        editor.selection.anchor.path[0] - 1,
        0
      ]);

      Transforms.select(editor, endPoint);
      Transforms.insertNodes(editor, text);
      return;
    }

    return insertBreak();
  };

  return editor;
};

const SHORTCUTS = {
  "*": "list-item",
  "-": "list-item",
  "+": "list-item",
  "1.": "list-item-number",
  ">": "block-quote",
  "#": "heading-one",
  "##": "heading-two",
  "###": "heading-three",
  "####": "heading-four",
  "#####": "heading-five",
  "######": "heading-six"
};

export const withMarkdown = editor => {
  const { insertBreak, deleteBackward, insertText } = editor;

  editor.insertBreak = () => {
    const text = { type: "paragraph", children: [{ text: "" }] };

    const thisNode = Editor.parent(editor, editor.selection);

    if (
      ["heading-one", "heading-two", "block-quote", "link"].includes(
        thisNode[0].type
      )
    ) {
      Transforms.insertNodes(editor, text);
    } else {
      if (["list-item", "list-item-number"].includes(thisNode[0].type)) {
        let isEmpty = true;

        thisNode[0].children.forEach(element => {
          if (element.type === "link") {
            if (element.children[0].text === "") {
              isEmpty = true;
            } else {
              isEmpty = false;
            }
          }
        });

        if (thisNode[0].children[0].text !== "") {
          isEmpty = false;
        }

        if (isEmpty) {
          Transforms.setNodes(editor, { type: "paragraph" });

          Transforms.unwrapNodes(editor, {
            match: n => n.type === "bulleted-list",
            split: true
          });

          Transforms.unwrapNodes(editor, {
            match: n => n.type === "numbered-list",
            split: true
          });

          return;
        }
      }

      return insertBreak();
    }
  };

  editor.insertText = text => {
    const { selection } = editor;

    if (text === " " && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });
      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range);
      const type = SHORTCUTS[beforeText];

      if (type) {
        Transforms.select(editor, range);
        Transforms.delete(editor);
        Transforms.setNodes(
          editor,
          { type },
          { match: n => Editor.isBlock(editor, n) }
        );

        if (type === "list-item") {
          const list = { type: "bulleted-list", children: [] };
          Transforms.wrapNodes(editor, list, {
            match: n => n.type === "list-item"
          });
        }

        if (type === "list-item-number") {
          const list = { type: "numbered-list", children: [] };
          Transforms.wrapNodes(editor, list, {
            match: n => n.type === "list-item-number"
          });
        }

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const match = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n)
      });

      if (match) {
        const [block, path] = match;
        const start = Editor.start(editor, path);

        if (
          block.type !== "paragraph" &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: "paragraph" });

          if (block.type === "list-item") {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === "bulleted-list",
              split: true
            });
          }

          if (block.type === "list-item-number") {
            Transforms.unwrapNodes(editor, {
              match: n => n.type === "numbered-list",
              split: true
            });
          }

          return;
        }
      }

      deleteBackward(...args);
    }
  };

  return editor;
};

export const withLinks = editor => {
  const { insertData, insertText, isInline } = editor;

  editor.isInline = element => {
    return element.type === "link" ? true : isInline(element);
  };

  editor.insertText = text => {
    const before = Editor.before(editor, editor.selection);

    const inline = Editor.above(editor, { at: before });

    if (inline) {
      if (inline[0].type === "link") {
        //very dangeous to solve a bug
        console.log(before.offset);

        console.log(editor.selection.anchor);
        if (editor.selection.anchor.offset === 0) {
          Transforms.insertText(editor, "‎‎", { at: before });
        } else {
          Transforms.insertText(editor, "‎‎");
        }

        Transforms.insertText(editor, "‎‎");

        const urlText = inline[0].children[0].text;

        Transforms.insertText(editor, urlText + "‎‎", { at: inline[1] });

        insertText(text);

        //ToDO: remove all dangeous space

        return;
      }
    }

    if (text && isUrl(text)) {
      wrapLink(editor, text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    const text = data.getData("text/plain");

    if (text && isUrl(text)) {
      alert(text);

      wrapLink(editor, text);
    } else {
      insertData(data);
    }
  };

  return editor;
};
