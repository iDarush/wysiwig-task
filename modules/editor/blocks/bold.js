import { BaseCommand, BaseBlock } from "./base.js";

export class BoldCommand extends BaseCommand {
  static get type() {
    return "BOLD";
  }

  get nodeClass() {
    return BoldBlock;
  }
}

export class BoldBlock extends BaseBlock {
  willBeApplied(command) {
    if (command instanceof BoldCommand) {
      return false;
    }

    return this.children.some((child) => child.willBeApplied(command));
  }

  revert(command) {
    super.revert(command);

    if (command instanceof BoldCommand) {
      // revert
      this.parent.replaceChild(this, this.children);
      this.parent = null;
    }
  }

  normalize() {
    super.normalize();

    if (this.parent && this.parent.parent && this.parent instanceof BoldBlock) {
      this.parent.parent.replaceChild(this.parent, this.parent.children);
    }
  }

  asHtml(selectedOnly) {
    const content = super.asHtml(selectedOnly);
    return content
      ? `<${BoldBlock.TAG} class="bold-text">${content}</${BoldBlock.TAG}>`
      : "";
  }

  static get TAG() {
    return "strong";
  }

  static IsMatch(node) {
    return node.nodeName === BoldBlock.TAG.toUpperCase();
  }
}
