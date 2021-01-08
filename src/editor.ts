import { CommandsConfig } from "./config";
import { Tool } from "./tools";
import { buildTree, visitTreeByRange } from "./tree";
import { spider } from "./spider";
import { debounce } from "./debounce";
import { isTextElement } from "./text";

function collectContent(element: Element) {
  let content = "";
  spider(
    element,
    (node) => {
      content += (node as Text).data;
    },
    NodeFilter.SHOW_TEXT
  );

  return content;
}

function renderTree(node: Node, asPlainText = false) {
  const element = node as Element;
  const tagName = (element.tagName || "").toLowerCase();

  const content: string = Array.from(element.childNodes)
    .map((child) => {
      return renderTree(child, asPlainText);
    })
    .join("");

  if (asPlainText) {
    if (isTextElement(node)) {
      return (node as Text).data;
    }

    const display = getComputedStyle(element).display;
    const glue = display === "block" ? "\r\n" : " ";

    return content + glue;
  } else {
    if (isTextElement(node)) {
      return (node as Text).data;
    }

    return `<${tagName}>${content}</${tagName}>`;
  }
}

/**
 * Simple WYSIWYG editor
 */
export class Editor {
  private _editorElement: HTMLElement | null = null;
  private _observer: MutationObserver | null = null;
  private _element: HTMLElement | null = null;
  private _commands: Tool[] = [];

  constructor(private _selector: string) {
    this._onMutation = debounce(this._onMutation, 100, this);
    this._onPaste = this._onPaste.bind(this);
    this._onCut = this._onCut.bind(this);
    this._onCopy = this._onCopy.bind(this);
    this._init();
  }

  _init() {
    this._element = document.querySelector(this._selector);
    if (this._element) {
      this._editorElement = this._element.querySelector(".edit-area");
      if (this._editorElement) {
        const editorElement = this._editorElement;

        editorElement.addEventListener("paste", this._onPaste);
        editorElement.addEventListener("cut", this._onCut);
        editorElement.addEventListener("copy", this._onCopy);
        document.execCommand("defaultParagraphSeparator", false, "div");

        const toolkit = this._element.querySelector(".toolkit");
        if (toolkit) {
          CommandsConfig.forEach((commandConfig) => {
            const toolButton = toolkit.querySelector(
              commandConfig.toolSelector
            );

            if (toolButton) {
              const command = new Tool(
                editorElement,
                toolButton,
                commandConfig.command
              );

              this._commands.push(command);
            }
          });
        }

        // normalize initial editor content
        buildTree(this._editorElement);

        this._observer = new MutationObserver(this._onMutation);
        this._observer.observe(this._editorElement, {
          childList: true,
        });
      }
    }
  }

  private _onPaste() {
    // normalize dom nodes
    setTimeout(() => {
      if (this._editorElement) {
        buildTree(this._editorElement);
      }
    });
  }

  private _onCopy(event: ClipboardEvent) {
    const selection = window.getSelection();
    if (!selection || !this._editorElement || !event.clipboardData) {
      return null;
    }

    event.preventDefault();
    const range = selection.getRangeAt(0);
    const tree = buildTree(this._editorElement);
    const [_, subtreeRoot] = visitTreeByRange(tree, range);

    if (!subtreeRoot) {
      return null;
    }

    // use custom simple formatting for clipboard content

    const html = renderTree(subtreeRoot.element);
    event.clipboardData.setData("text/html", html);

    const text = renderTree(subtreeRoot.element, true);
    event.clipboardData.setData("text/plain", text);

    return selection;
  }

  private _onCut(event: ClipboardEvent) {
    const selection = this._onCopy(event);
    if (!selection) {
      return;
    }

    selection.deleteFromDocument();
  }

  private _onMutation(mutations: MutationRecord[]) {
    const removal = mutations.every(
      (m) => m.type === "childList" && m.removedNodes.length > 0
    );

    // clear residual formatting on empty editor
    if (removal && this._editorElement) {
      const content = collectContent(this._editorElement);

      if (!content) {
        this._setDefaultDom();
      }
    }
  }

  private _setDefaultDom() {
    if (this._editorElement) {
      this._editorElement.innerHTML = "";
    }
  }

  public destroy() {
    this._element = null;

    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    if (this._editorElement) {
      this._editorElement.removeEventListener("paste", this._onPaste);
      this._editorElement.removeEventListener("cut", this._onCut);
      this._editorElement.removeEventListener("copy", this._onCopy);
      this._editorElement = null;
    }

    this._commands.forEach((command) => command.destroy());
    this._commands = [];
  }
}
