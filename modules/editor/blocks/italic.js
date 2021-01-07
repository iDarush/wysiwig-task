import { BaseCommand, BaseBlock } from "./base.js";

export class ItalicCommand extends BaseCommand {
  static get type() {
    return "ITALIC";
  }

  get nodeClass() {
    return ItalicBlock;
  }
}

export class ItalicBlock extends BaseBlock {
  willBeApplied(command) {
    if (command instanceof ItalicCommand) {
      return false;
    }

    return this.children.some((child) => child.willBeApplied(command));
  }

  revert(command) {
    super.revert(command);

    if (command instanceof ItalicCommand) {
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
      this.parent instanceof ItalicBlock
    ) {
      this.parent.parent.replaceChild(this.parent, this.parent.children);
    }
  }

  asHtml(selectedOnly) {
    const content = super.asHtml(selectedOnly);
    return content
      ? `<${ItalicBlock.TAG} class="italic-text">${content}</${ItalicBlock.TAG}>`
      : "";
  }

  static get TAG() {
    return "em";
  }

  static IsMatch(node) {
    return node.nodeName === ItalicBlock.TAG.toUpperCase();
  }
}
