import { offcetIsEmpty } from "../helper.js";
import { BaseBlock } from "./base.js";

function splitText(text, offcet) {
  if (offcetIsEmpty(offcet) || !text) {
    return [{ text, affected: true }];
  }

  let { start, end } = offcet;
  if (start < 0) {
    start = 0;
  }
  if (end < 0) {
    end = text.length;
  }

  const parts = [
    { text: text.substring(0, start), affected: false },
    { text: text.substring(start, end), affected: true },
    { text: text.substring(end, text.length), affected: false },
  ].filter((p) => !!p.text);

  return parts;
}

export class TextBlock extends BaseBlock {
  constructor(element, parent) {
    super(element, parent);
    this.affected = false;
  }

  get isEmpty() {
    return !this.element.textContent;
  }

  get selected() {
    return this.affected;
  }

  get shouldBeRemoved() {
    return false;
  }

  willBeApplied(command) {
    return this.affected;
  }

  apply(command) {
    if (this.parent && this.willBeApplied(command)) {
      const parts = splitText(this.element.textContent, this.offcet);
      const replacement = [];

      parts.forEach(({ text, affected }) => {
        const textNode = new TextBlock(
          document.createTextNode(text),
          this.parent
        );

        if (affected) {
          const wrapper = new command.nodeClass(
            document.createElement(command.nodeClass.TAG),
            this.parent
          );
          wrapper.appendChild(textNode);
          replacement.push(wrapper);
        } else {
          replacement.push(textNode);
        }
      });

      this.parent.replaceChild(this, replacement);
      this.parent = null;
    }
  }

  revert(command) {}

  normalize() {
    // only plain text
    for (let index = 0; index < this.children.length; index++) {
      const child = this.children[index];
      if (!(child instanceof TextBlock)) {
        this.children[index] = new TextBlock(
          document.createTextNode(child.asPlainText()),
          this
        );
      }
    }

    super.normalize();

    if (this.parent && this.parent.parent && this.parent instanceof TextBlock) {
      this.parent.parent.replaceChild(this.parent, this.parent.children);
    }
  }

  asPlainText(selectedOnly = false) {
    return this.asHtml(selectedOnly);
  }

  asHtml(selectedOnly) {
    if (selectedOnly) {
      if (this.selected) {
        const parts = splitText(this.element.textContent, this.offcet).filter(
          ({ affected }) => affected
        );
        return parts.map(({ text }) => text).join("");
      }
      return "";
    }
    return this.element.textContent;
  }

  static IsMatch(node) {
    return node.nodeType === Node.TEXT_NODE;
  }
}
