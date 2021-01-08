import { Tree, TreeNode } from "./nodes";

export declare interface Command {
  apply: (node: TreeNode, tree: Tree) => void;
  revert: (node: TreeNode, tree: Tree) => void;
  canBeApplied: (node: TreeNode) => boolean;
  willBeApplied: (node: TreeNode, tree: Tree) => boolean;
}
