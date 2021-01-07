import { BaseCommand, BaseBlock } from "./base.js";

export class Header2Command extends BaseCommand {
  static get type() {
    return "H2";
  }

  get nodeClass() {
    return Header2Block;
  }
}

export class Header2Block extends BaseBlock {
  willBeApplied(command) {
    if (command instanceof Header2Command) {
      return false;
    }

    return this.children.some((child) => child.willBeApplied(command));
  }

  revert(command) {
    super.revert(command);

    if (command instanceof Header2Command) {
      // revert
      this.parent.replaceChild(this, this.children);
      this.parent = null;
    }
  }

  asHtml(selectedOnly) {
    const content = super.asHtml(selectedOnly);
    return content
      ? `<${Header2Block.TAG} class="header2-text">${content}</${Header2Block.TAG}>`
      : "";
  }

  normalize() {
    super.normalize();

    if (
      this.parent &&
      this.parent.parent &&
      this.parent instanceof Header2Block
    ) {
      this.parent.parent.replaceChild(this.parent, this.parent.children);
    }
  }

  static get TAG() {
    return "h2";
  }

  static IsMatch(node) {
    return node.nodeName === Header2Block.TAG.toUpperCase();
  }
}
