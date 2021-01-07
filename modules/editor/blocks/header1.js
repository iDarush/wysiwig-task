import { BaseCommand, BaseBlock } from "./base.js";

export class Header1Command extends BaseCommand {
  static get type() {
    return "H1";
  }

  get nodeClass() {
    return Header1Block;
  }
}

export class Header1Block extends BaseBlock {
  willBeApplied(command) {
    if (command instanceof Header1Command) {
      return false;
    }

    return this.children.some((child) => child.willBeApplied(command));
  }

  revert(command) {
    super.revert(command);

    if (command instanceof Header1Command) {
      // revert
      this.parent.replaceChild(this, this.children);
      this.parent = null;
    }
  }

  normalize() {
    super.normalize();

    if (
      this.parent &&
      this.parent.parent &&
      this.parent instanceof Header1Block
    ) {
      this.parent.parent.replaceChild(this.parent, this.parent.children);
    }
  }

  asHtml(selectedOnly) {
    const content = super.asHtml(selectedOnly);
    return content
      ? `<${Header1Block.TAG} class="header1-text">${content}</${Header1Block.TAG}>`
      : "";
  }

  static get TAG() {
    return "h1";
  }

  static IsMatch(node) {
    return node.nodeName === Header1Block.TAG.toUpperCase();
  }
}
