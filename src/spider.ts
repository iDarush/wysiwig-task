import { NeedToBeEmbed } from "./constants";

export function walkerCriteria(node: Node) {
  // skip embed blocks content
  if (node.parentNode && NeedToBeEmbed.includes(node.parentNode.nodeName)) {
    return NodeFilter.FILTER_REJECT;
  }

  return NodeFilter.FILTER_ACCEPT;
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
