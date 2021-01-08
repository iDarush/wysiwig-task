import { BaseWordCommand } from "./base-word-command";
import { Command } from "../types";

export const ITALIC_CLASS_NAME = "italic-text";
export const ITALIC_TAG_NAME = "EM";

export class ItalicCommand extends BaseWordCommand {
  constructor() {
    super(ITALIC_TAG_NAME, ITALIC_CLASS_NAME, ["I"]);
  }

  protected _checkStyles(element: Element, style: CSSStyleDeclaration) {
    const fontStyle = style.fontStyle;
    return fontStyle === "italic";
  }

  protected _undoTag() {
    return "SPAN";
  }
}

export const ItalicCommandFactory = () => new ItalicCommand();

export const ItalicCommandInstance = ItalicCommandFactory();

export const ItalicCommandFacade: Command = {
  apply: ItalicCommandInstance.apply.bind(ItalicCommandInstance),
  revert: ItalicCommandInstance.revert.bind(ItalicCommandInstance),
  canBeApplied: ItalicCommandInstance.canBeFormatted.bind(
    ItalicCommandInstance
  ),
  willBeApplied: ItalicCommandInstance.willBeFormatted.bind(
    ItalicCommandInstance
  ),
};
