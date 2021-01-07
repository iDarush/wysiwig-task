import { config as commandsConfig } from "./blocks/config.js";
import { RootBlock } from "./blocks/root.js";
import { Tool } from "./tools.js";
import { buildTreeFromElement, buildTreeFromSelection } from "./tree.js";
import { debounce } from "./helper.js";

class Editor {
  _selector = "";
  _editor = null;
  _element = null;
  _commands = [];

  constructor(selector) {
    this._selector = selector;
    this._onTextChange = debounce(this._onTextChange, 300, this);
    this._onCopy = this._onCopy.bind(this);
    this._onCut = this._onCut.bind(this);
    this._onPaste = this._onPaste.bind(this);
    this._init();
  }

  _init() {
    this._element = document.querySelector(this._selector);

    if (this._element) {
      this._editor = this._element.querySelector(".edit-area");
      if (this._editor) {
        this._editor.addEventListener("cut", this._onCut);
        this._editor.addEventListener("copy", this._onCopy);
        this._editor.addEventListener("paste", this._onPaste);
        this._editor.addEventListener("input", this._onTextChange);
        document.execCommand("defaultParagraphSeparator", false, "div");
      }

      const toolkit = this._element.querySelector(".toolkit");
      if (toolkit) {
        commandsConfig.forEach((commandConfig) => {
          const tool = toolkit.querySelector(commandConfig.selector);
          if (tool) {
            const command = new Tool(this._editor, tool, commandConfig);
            this._commands.push(command);
          }
        });
      }
    }
  }

  _fixEditorContent() {
    const content = this._editor.innerHTML.trim();
    if (content === "" || content === "<br>") {
      this._editor.innerHTML = "<div><br></div>";
    }
  }

  _onTextChange(evt) {
    if (
      evt.inputType === "insertFromPaste" ||
      evt.inputType === "insertParagraph"
    ) {
      return;
    }

    this._fixEditorContent();

    var restore = saveCaretPosition(this._editor);
    this._updateFromDom();
    restore();
  }

  _onPaste(event) {
    setTimeout(() => this._updateFromDom());
  }

  _onCut(evt) {
    evt.preventDefault();
    const selection = getSelection();
    const { html, text } = buildClipboardData(selection, this._editor);

    if (html) {
      evt.clipboardData.setData("text/html", html);
    }

    if (text) {
      evt.clipboardData.setData("text/plain", text);
    }

    selection.deleteFromDocument();

    setTimeout(() => {
      this._updateFromDom();
    });
  }

  _onCopy(evt) {
    evt.preventDefault();
    const selection = getSelection();
    const { html, text } = buildClipboardData(selection, this._editor);

    if (html) {
      evt.clipboardData.setData("text/html", html);
    }

    if (text) {
      evt.clipboardData.setData("text/plain", text);
    }
  }

  _updateFromDom() {
    const editor = this._editor;
    const tree = buildTreeFromElement(editor);

    // tree.forEach((root) => root.normalize());

    const normalization = [];

    for (let index = 0; index < tree.length; index++) {
      const root = tree[index];

      if (root.children.some((child) => child instanceof RootBlock)) {
        const fakeRoot = new RootBlock(null, null);
        fakeRoot.appendChild(root);
        normalization.push(fakeRoot);
      } else {
        normalization.push(root);
      }
    }

    normalization.forEach((root) => root.normalize());

    const result = normalization.reduce((acc, root) => {
      const appendix = !root.element ? root.children : [root];
      return [...acc, ...appendix];
    }, []);

    result.forEach((child) => child.removeEmptyNodes());

    const html = result
      .filter((child) => !child.shouldBeRemoved)
      .map((child) => child.asHtml())
      .join("");
    editor.innerHTML = html;
  }

  destroy() {
    this._element = null;

    if (this._editor) {
      this._editor.removeEventListener("input", this._onTextChange);
      this._editor.removeEventListener("copy", this._onCut);
      this._editor.removeEventListener("cut", this._onCopy);
      this._editor.removeEventListener("paste", this._onPaste);
      this._editor = null;
    }

    this._commands.forEach((command) => command.destroy());
    this._commands = [];
  }
}

function buildClipboardData(selection, editorElement) {
  const tree = buildTreeFromSelection(selection, editorElement);

  const html = tree.map((root) => root.asHtml(true)).join("");
  const text = tree.map((root) => root.asPlainText(true)).join("\r\n");

  console.log(html);

  return { html, text };
}

function saveCaretPosition(editorElement) {
  editorElement.focus();
  var selection = window.getSelection();
  var range = selection.getRangeAt(0);
  range.setStart(editorElement, 0);
  const text = range.toString();
  var len = text.length;

  return function restore() {
    var pos = getTextNodeAtPosition(editorElement, len);
    selection.removeAllRanges();
    var range = new Range();
    range.setStart(pos.node, pos.position);
    selection.addRange(range);
  };
}

function getTextNodeAtPosition(root, index) {
  const NODE_TYPE = NodeFilter.SHOW_TEXT;
  var treeWalker = document.createTreeWalker(
    root,
    NODE_TYPE,
    function next(elem) {
      if (index > elem.textContent.length) {
        index -= elem.textContent.length;
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  );
  var c = treeWalker.nextNode();
  return {
    node: c ? c : root,
    position: index,
  };
}

export { Editor };
