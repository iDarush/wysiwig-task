import { RootBlock, TextBlock, ALL_BLOCKS } from "./blocks/index.js";
import { getNodesInRange } from "./helper.js";

export function walkNode(textNodes, node, parent) {
  let BlockClass = ALL_BLOCKS.find((b) => b.IsMatch(node));
  if (!BlockClass) {
    BlockClass = TextBlock;
  }

  const block = new BlockClass(node, parent);
  const textNode = textNodes.find((t) => t.node === node);

  if (textNode) {
    block.affected = true;
    block.offcet = textNode.offcet;
  }

  if (node.hasChildNodes()) {
    Array.from(node.childNodes).forEach((c) => {
      const child = walkNode(textNodes, c, block);
      block.appendChild(child);
    });
  }

  return block;
}

export function buildTreeFromSelection(selection, editorElement) {
  if (selection.isCollapsed) {
    return [];
  }

  const allNodes = getNodesInRange(selection.getRangeAt(0));

  const rootNodes = allNodes
    .filter(
      (n) =>
        RootBlock.IsMatch(n.node) &&
        n.node !== editorElement &&
        editorElement.contains(n.node)
    )
    .map((n) => n.node);

  const textNodes = allNodes.filter((n) => TextBlock.IsMatch(n.node));

  const tree = rootNodes.map((node) => {
    const block = walkNode(textNodes, node, null);
    return prepareRootBlock(node, block);
  });

  return tree;
}

export function buildTreeFromElement(editorElement) {
  const rootNodes = Array.from(editorElement.childNodes);

  const tree = rootNodes.map((node) => {
    const block = walkNode([], node, null);
    return prepareRootBlock(node, block);
  });

  return tree;
}

export function prepareRootBlock(node, block) {
  if (!(block instanceof RootBlock)) {
    const root = new RootBlock(node, parent);
    root.appendChild(block);

    return root;
  }

  return block;
}
