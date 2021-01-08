import { createTextNode } from "./dom";
import { Tree, TreeNode } from "./nodes";

/**
 * Cut text elements in a row
 */
function cutTextChildRow(source: Node[]) {
  const result: Node[] = [];

  let child = source.shift();
  while (child && isTextElement(child)) {
    result.push(child);
    child = source.shift();
  }

  return result;
}

export function isTextElement(node: Node) {
  return node.nodeType === Node.TEXT_NODE;
}

export function getTextElementValue(node: Node) {
  if (node && isTextElement(node)) {
    return (node as Text).data;
  }

  return "";
}

export function getTextNodeValue(node: TreeNode | undefined | null) {
  if (node && node.type === "text") {
    return (node.element as Text).data;
  }

  return "";
}

/**
 * Try to merge separated text nodes into single one
 */
export function normalizeText(element: Node, tree: Tree) {
  const node = tree.cache.get(element);
  if (node && element.childNodes.length > 1) {
    const collection = Array.from(element.childNodes);
    const textNodes = collection.filter((e) => isTextElement(e));
    if (textNodes.length < 2) {
      // nothing to merge
      return;
    }

    let cursor = collection[0];
    let row = cutTextChildRow(collection);
    while (cursor) {
      if (row.length > 1) {
        let text = "";
        row.forEach((child) => {
          text += getTextElementValue(child);
          tree.cache.delete(child);

          // keep first element as replacement position
          if (cursor !== child) {
            element.removeChild(child);
          }
        });

        const textNode = createTextNode(text);
        tree.cache.set(textNode, node);
        cursor.replaceWith(textNode);
      }

      cursor = collection[0];
      row = cutTextChildRow(collection);
    }
  }
}
