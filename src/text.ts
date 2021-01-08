import { createTextNode } from "./dom";
import { Tree, TreeNode } from "./nodes";

function collectTextChildRow(collection: Node[]) {
  const result: Node[] = [];

  let child = collection.shift();
  while (child && isTextElement(child)) {
    result.push(child);
    child = collection.shift();
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

export function normalizeText(element: Node, tree: Tree) {
  const node = tree.nodeMap.get(element);
  if (node && element.childNodes.length > 1) {
    const collection = Array.from(element.childNodes);
    const textNodes = collection.filter((e) => isTextElement(e));
    if (textNodes.length < 2) {
      // nothing to merge
      return;
    }

    let cursor = collection[0];
    let row = collectTextChildRow(collection);
    while (cursor) {
      if (row.length > 1) {
        let text = "";
        row.forEach((child) => {
          text += getTextElementValue(child);
          tree.nodeMap.delete(child);

          if (cursor !== child) {
            element.removeChild(child);
          }
        });

        const textNode = createTextNode(text);
        tree.nodeMap.set(textNode, node);
        cursor.replaceWith(textNode);
      }

      cursor = collection[0];
      row = collectTextChildRow(collection);
    }
  }
}
