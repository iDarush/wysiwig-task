import { CommandsConfig } from "./config";
import { Tool } from "./tools";
import { buildTree } from "./tree-builder";
import { spider } from "./tree";

function collectContent(element: Element) {
  let content = "";
  spider(
    element,
    (node) => {
      const text = node as Text;
      content += text.data;
    },
    NodeFilter.SHOW_TEXT
  );

  return content;
}

export class Editor {
  private _editorElement: HTMLElement | null = null;
  private _element: HTMLElement | null = null;
  private _commands: Tool[] = [];

  constructor(private _selector: string) {
    this._onPaste = this._onPaste.bind(this);
    this._onCut = this._onCut.bind(this);
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

        document.execCommand("defaultParagraphSeparator", false, "div");

        const toolkit = this._element.querySelector(".toolkit");
        if (toolkit) {
          CommandsConfig.forEach((commandConfig) => {
            const toolButton = toolkit.querySelector(commandConfig.selector);
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

        buildTree(this._editorElement);
      }
    }
  }

  private _onPaste() {
    // normalize dom
    setTimeout(() => {
      if (this._editorElement) {
        buildTree(this._editorElement);
      }
    });
  }

  private _onCut() {
    // normalize dom
    setTimeout(() => {
      if (this._editorElement) {
        const text = collectContent(this._editorElement);
        if (!text) {
          this._setDefaultDom();
        }
      }
    });
  }

  private _setDefaultDom() {
    if (this._editorElement) {
      this._editorElement.innerHTML = "";
    }
  }

  public destroy() {
    this._element = null;

    if (this._editorElement) {
      this._editorElement.removeEventListener("paste", this._onPaste);
      this._editorElement.removeEventListener("cut", this._onCut);
      this._editorElement = null;
    }

    this._commands.forEach((command) => command.destroy());
    this._commands = [];
  }
}
