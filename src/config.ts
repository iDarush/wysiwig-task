import { BoldCommandFacade } from "./commands/bold";
import { HeaderOneCommandFacade } from "./commands/header-one";
import { HeaderTwoCommandFacade } from "./commands/header-two";
import { ItalicCommandFacade } from "./commands/italic";

/**
 * All defined commands
 */
export const CommandsConfig = [
  {
    toolSelector: ".head-2",
    command: HeaderTwoCommandFacade,
  },
  {
    toolSelector: ".bold",
    command: BoldCommandFacade,
  },
  {
    toolSelector: ".italic",
    command: ItalicCommandFacade,
  },
  {
    toolSelector: ".head-1",
    command: HeaderOneCommandFacade,
  },
];
