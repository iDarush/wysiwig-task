import { buildTreeFromSelection } from "./tree.js";

export class Tool {
  constructor(editorElement, toolElement, config) {
    this._editor = editorElement;
    this._tool = toolElement;
    this._command = config.command;
    this._run = this._run.bind(this);
    this._init();
  }

  _init() {
    this._tool.addEventListener("click", this._run);
  }

  _run(evt) {
    evt.preventDefault();
    this._editor.focus();
    let selection = getSelection();

    const tree = buildTreeFromSelection(selection, this._editor);
    const command = new this._command();

    tree.forEach((root) => {
      root.apply(command);
      root.element.innerHTML = root.contentAsHtml();
    });
  }

  destroy() {
    if (this._tool) {
      this._tool.removeEventListener("click", this._run);
    }
  }
}
