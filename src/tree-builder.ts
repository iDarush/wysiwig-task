import { findAllIndexes, isNotNull } from "./helpers";
import { processElement, Tree, TreeNode } from "./nodes";
import { normalizeNode, santitazeNode } from "./node-preprocessor";
import { spider, visitNodeDown, visitNodeUp } from "./tree";

export function buildTree(root: Node) {
  const tree = new Tree(root);

  spider(root, (element) => {
    const node = processElement(element);
    tree.nodeMap.set(element, node);
  });

  Array.from(tree.nodeMap.values()).forEach((node) => {
    santitazeNode(node, tree);
    normalizeNode(node, tree);
  });

  return tree;
}

export function visitTreeByRange(tree: Tree, range: Range) {
  const selectionStart = range.startContainer;
  const selectionEnd = range.endContainer;

  const treeClone = tree.clone();
  const startNode = treeClone.nodeMap.get(selectionStart);
  const endNode = treeClone.nodeMap.get(selectionEnd);

  // selection is out of tree
  if (!startNode || !endNode) {
    return null;
  }

  startNode.visit();
  if (startNode !== endNode) {
    endNode.visit();

    let intersection: TreeNode | null = null;

    let parentElement = startNode.parent;
    while (parentElement) {
      const next = treeClone.nodeMap.get(parentElement);
      if (next) {
        next.visit();
        parentElement = next.parent;
      } else {
        break;
      }
    }

    parentElement = endNode.parent;
    while (parentElement) {
      const next = treeClone.nodeMap.get(parentElement);
      if (next) {
        if (next.visited) {
          intersection = next;
          break;
        }

        next.visit();
        parentElement = next.parent;
      } else {
        break;
      }
    }

    if (intersection) {
      // clean unnecesary visited nodes
      visitNodeUp(intersection, treeClone, false);
      intersection.visit();

      const children: TreeNode[] = Array.from(intersection.element.childNodes)
        .map((element) => treeClone.nodeMap.get(element))
        .filter(isNotNull);

      const indexes = findAllIndexes(children, (node) => node.visited);
      if (indexes.length !== 2) {
        return false;
      }

      const [begin, end] = indexes;

      for (let index = 0; index < children.length; index++) {
        if (index > begin && index < end) {
          const child = children[index];
          visitNodeDown(child, treeClone, true);
        }
      }
    } else {
      return null;
    }
  }

  return treeClone;
}
