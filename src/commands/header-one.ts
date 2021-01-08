import { BaseWordCommand } from "./base-word-command";
import { Command } from "../types";

export const HEADER_ONE_CLASS_NAME = "header1-text";
export const HEADER_ONE_TAG_NAME = "H1";

export class HeaderOneCommand extends BaseWordCommand {
  constructor() {
    super(HEADER_ONE_TAG_NAME, HEADER_ONE_CLASS_NAME);
  }
}

export const HeaderOneCommandFactory = () => new HeaderOneCommand();

export const HeaderOneCommandInstance = HeaderOneCommandFactory();

export const HeaderOneCommandFacade: Command = {
  apply: HeaderOneCommandInstance.apply.bind(HeaderOneCommandInstance),
  revert: HeaderOneCommandInstance.revert.bind(HeaderOneCommandInstance),
  canBeApplied: HeaderOneCommandInstance.canBeFormatted.bind(
    HeaderOneCommandInstance
  ),
  willBeApplied: HeaderOneCommandInstance.willBeFormatted.bind(
    HeaderOneCommandInstance
  ),
};
