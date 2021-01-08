import { BoldCommandInstance } from "./commands/bold";
import { NeedToBeEmbed } from "./constants";
import { createTextNode } from "./dom";
import { HeaderOneCommandInstance } from "./commands/header-one";
import { HeaderTwoCommandInstance } from "./commands/header-two";
import { ItalicCommandInstance } from "./commands/italic";
import { Tree, TreeNode } from "./nodes";

export function normalizeNode(node: TreeNode, tree: Tree) {
  BoldCommandInstance.normalizeBlock(node, tree);
  ItalicCommandInstance.normalizeBlock(node, tree);
  HeaderOneCommandInstance.normalizeBlock(node, tree);
  HeaderTwoCommandInstance.normalizeBlock(node, tree);

  return node;
}

export function santitazeNode(node: TreeNode, tree: Tree) {
  if (NeedToBeEmbed.includes(node.element.nodeName) && node.parent) {
    const text = createTextNode((node.element as Element).outerHTML);
    const replacement = document.createElement("div");
    replacement.appendChild(text);
    node.parent.replaceChild(replacement, node.element);

    tree.nodeMap.delete(node.element);
    tree.nodeMap.set(replacement, node);

    node.element = replacement;
    node.type = "block";
  }

  return node;
}
