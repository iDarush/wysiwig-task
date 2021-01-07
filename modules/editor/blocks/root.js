import { ROOT_TAG } from "../constants.js";
import { isRootNode } from "../helper.js";
import { BaseBlock } from "./base.js";

export class RootBlock extends BaseBlock {
  apply(command) {
    if (!this.children.length) {
      return;
    }

    const selectedNodes = this.children.filter((child) => child.selected);
    const applicable = selectedNodes.filter((child) =>
      child.willBeApplied(command)
    );
    const notApplicable = applicable.length < selectedNodes.length / 2;

    selectedNodes.forEach((child) => {
      if (notApplicable) {
        child.revert(command);
      } else {
        child.apply(command);
      }
    });
  }

  normalize() {
    super.normalize();

    if (
      this.parent &&
      this.parent instanceof RootBlock &&
      this.parent.parent &&
      this.children.length
    ) {
      this.parent.removeChild(this);
      this.parent.parent.replaceChild(this.parent, [this, this.parent]);
    }
  }

  asHtml(selectedOnly) {
    const content = super.asHtml(selectedOnly);
    return `<${RootBlock.TAG}>${content}</${RootBlock.TAG}>`;
  }

  static get TAG() {
    return ROOT_TAG;
  }

  static IsMatch(node) {
    return isRootNode(node);
  }
}
