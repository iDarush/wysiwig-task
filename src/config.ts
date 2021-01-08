import { BoldCommandFacade } from "./commands/bold";
import { HeaderOneCommandFacade } from "./commands/header-one";
import { HeaderTwoCommandFacade } from "./commands/header-two";
import { ItalicCommandFacade } from "./commands/italic";

export const CommandsConfig = [
  {
    selector: ".head-2",
    command: HeaderTwoCommandFacade,
  },
  {
    selector: ".bold",
    command: BoldCommandFacade,
  },
  {
    selector: ".italic",
    command: ItalicCommandFacade,
  },
  {
    selector: ".head-1",
    command: HeaderOneCommandFacade,
  },
];
