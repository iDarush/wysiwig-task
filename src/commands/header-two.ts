import { BaseWordCommand } from "./base-word-command";
import { Command } from "../types";

export const HEADER_TWO_CLASS_NAME = "header2-text";
export const HEADER_TWO_TAG_NAME = "H2";

export class HeaderTwoCommand extends BaseWordCommand {
  constructor() {
    super(HEADER_TWO_TAG_NAME, HEADER_TWO_CLASS_NAME);
  }
}

export const HeaderTwoCommandFactory = () => new HeaderTwoCommand();

export const HeaderTwoCommandInstance = HeaderTwoCommandFactory();

export const HeaderTwoCommandFacade: Command = {
  apply: HeaderTwoCommandInstance.apply.bind(HeaderTwoCommandInstance),
  revert: HeaderTwoCommandInstance.revert.bind(HeaderTwoCommandInstance),
  canBeApplied: HeaderTwoCommandInstance.canBeFormatted.bind(
    HeaderTwoCommandInstance
  ),
  willBeApplied: HeaderTwoCommandInstance.willBeFormatted.bind(
    HeaderTwoCommandInstance
  ),
};
