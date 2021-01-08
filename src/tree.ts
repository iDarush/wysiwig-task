import { NeedToBeEmbed } from "./constants";
import { Tree, TreeNode } from "./nodes";

export function walkerCriteria(node: Node) {
  // пропускаем содержимое "непечатных" блоков
  if (node.parentNode && NeedToBeEmbed.includes(node.parentNode.nodeName)) {
    return NodeFilter.FILTER_REJECT;
  }

  return NodeFilter.FILTER_ACCEPT;
}

export function nodeIsEmpty(node: TreeNode) {
  if (node.type === "text") {
    return !(node.element as Text).data;
  }

  return !node.element.firstChild;
}

export function visitNodeDown(node: TreeNode, tree: Tree, value = true) {
  node.visit(value);
  if (node.element.hasChildNodes()) {
    Array.from(node.element.childNodes).forEach((element) => {
      const child = tree.nodeMap.get(element);
      if (child) {
        visitNodeDown(child, tree, value);
      }
    });
  }
}

export function walkFromNodeUp(
  node: TreeNode,
  tree: Tree,
  action: (node: TreeNode, tree: Tree) => void
) {
  action(node, tree);
  let parent = node.parent ? tree.nodeMap.get(node.parent) : null;
  while (parent) {
    action(parent, tree);
    parent = parent.parent ? tree.nodeMap.get(parent.parent) : null;
  }
}

export function walkFromNodeDonw(
  node: TreeNode,
  tree: Tree,
  action: (node: TreeNode, tree: Tree) => void
) {
  action(node, tree);

  if (node.element.hasChildNodes()) {
    Array.from(node.element.childNodes).forEach((element) => {
      const child = tree.nodeMap.get(element);
      if (child) {
        walkFromNodeDonw(child, tree, action);
      }
    });
  }
}

export function visitNodeUp(node: TreeNode, tree: Tree, value = true) {
  walkFromNodeUp(node, tree, (n) => n.visit(value));
}

export function spider(
  root: Node,
  action: (e: Node) => void,
  filter = NodeFilter.SHOW_ALL
) {
  const treeWalker = document.createTreeWalker(
    root,
    filter,
    {
      acceptNode: walkerCriteria,
    },
    false
  );

  while (treeWalker.nextNode()) {
    action(treeWalker.currentNode);
  }
}
