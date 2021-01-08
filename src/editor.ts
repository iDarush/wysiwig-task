import { CommandsConfig } from "./config";
import { Tool } from "./tools";
import { buildTree } from "./tree";
import { spider } from "./spider";
import { debounce } from "./debounce";

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
    this._init();
  }

  _init() {
    this._element = document.querySelector(this._selector);
    if (this._element) {
      this._editorElement = this._element.querySelector(".edit-area");
      if (this._editorElement) {
        const editorElement = this._editorElement;

        editorElement.addEventListener("paste", this._onPaste);
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

  private _onPaste(event: ClipboardEvent) {
    // normalize dom nodes
    setTimeout(() => {
      if (this._editorElement) {
        buildTree(this._editorElement);
      }
    });
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
      this._editorElement = null;
    }

    this._commands.forEach((command) => command.destroy());
    this._commands = [];
  }
}
