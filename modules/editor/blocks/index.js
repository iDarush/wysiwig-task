import { BoldCommand, BoldBlock } from "./bold.js";
import { Header1Command, Header1Block } from "./header1.js";
import { Header2Command, Header2Block } from "./header2.js";
import { ItalicCommand, ItalicBlock } from "./italic.js";
import { RootBlock } from "./root.js";
import { TextBlock } from "./text.js";

export {
  BoldCommand,
  Header1Command,
  Header2Command,
  ItalicCommand,
  BoldBlock,
  Header1Block,
  Header2Block,
  ItalicBlock,
  RootBlock,
  TextBlock,
};

export const ALL_BLOCKS = [
  BoldBlock,
  Header1Block,
  Header2Block,
  ItalicBlock,
  RootBlock,
  TextBlock,
];
