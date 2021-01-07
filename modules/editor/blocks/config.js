import { BoldCommand } from "./bold.js";
import { Header1Command } from "./header1.js";
import { Header2Command } from "./header2.js";
import { ItalicCommand } from "./italic.js";

const config = [
  {
    selector: ".head-1",
    command: Header1Command,
  },
  {
    selector: ".head-2",
    command: Header2Command,
  },
  {
    selector: ".bold",
    command: BoldCommand,
  },
  {
    selector: ".italic",
    command: ItalicCommand,
  },
];

export { config };
