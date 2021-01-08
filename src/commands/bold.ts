import { BaseWordCommand } from "./base-word-command";
import { Command } from "../types";

export const BOLD_CLASS_NAME = "bold-text";
export const BOLD_TAG_NAME = "STRONG";

export class BoldCommand extends BaseWordCommand {
  constructor() {
    super(BOLD_TAG_NAME, BOLD_CLASS_NAME, ["B"]);
  }

  protected _checkStyles(element: Element, style: CSSStyleDeclaration) {
    const fontWeight = style.fontWeight || "";
    return fontWeight === "bold" || +fontWeight >= 600;
  }

  protected _undoTag() {
    return "SPAN";
  }
}

export const BoldCommandFactory = () => new BoldCommand();

export const BoldCommandInstance = BoldCommandFactory();

export const BoldCommandFacade: Command = {
  apply: BoldCommandInstance.apply.bind(BoldCommandInstance),
  revert: BoldCommandInstance.revert.bind(BoldCommandInstance),
  canBeApplied: BoldCommandInstance.canBeFormatted.bind(BoldCommandInstance),
  willBeApplied: BoldCommandInstance.willBeFormatted.bind(BoldCommandInstance),
};
