import { Tree, TreeNode } from "./nodes";
import { normalizeNode, santitazeNode } from "./node-preprocessor";
import { spider } from "./spider";

function isNotNull<T>(a: T | null | undefined): a is T {
  return a !== null && a !== undefined;
}

function findAllIndexes<T>(array: T[], predicate: (e: T) => boolean) {
  return array.reduce(function (inds, val, i) {
    if (predicate(val)) inds.push(i);
    return inds;
  }, [] as number[]);
}

/**
 * Create nodes from DOM and normalize it
 */
export function buildTree(rootElement: Node) {
  const tree = new Tree();
  tree.cache.set(rootElement, new TreeNode(rootElement, true));

  spider(rootElement, (element) => {
    const node = new TreeNode(element);
    tree.cache.set(element, node);
  });

  tree.allNodes.forEach((node) => {
    santitazeNode(node, tree);
    normalizeNode(node, tree);
  });

  return tree;
}

/**
 * Fact: user select text from T1 to T2 (T1TvT2)
 * Wee need to find whole subtree that was selected
 * Find closest shared root for T1 and T1 => Br
 * Mark all descendants of Br between T1 and T2 (Tv)
 *
 *          Br
 *       /  |  \
 *      B   B   B
 *     /    |   |  \
 *    B     Tv  B   B
 *   /          |    \
 *  T1          T2    T
 *
 */

/**
 * Mark nodes of subtree under user selection
 */
export function visitTreeByRange(
  tree: Tree,
  range: Range
): [Tree | null, TreeNode | null] {
  const selectionStart = range.startContainer;
  const selectionEnd = range.endContainer;

  const treeClone = tree.clone();
  const startNode = treeClone.cache.get(selectionStart);
  const endNode = treeClone.cache.get(selectionEnd);

  // selection is out of tree
  if (!startNode || !endNode) {
    return [null, null];
  }

  startNode.visit();

  // more than one node selected
  if (startNode !== endNode) {
    endNode.visit();

    let pathIntersection: TreeNode | null = null;

    let parentElement = startNode.parent;
    while (parentElement) {
      const next = treeClone.cache.get(parentElement);
      if (next) {
        next.visit();
        parentElement = next.parent;
      } else {
        break;
      }
    }

    parentElement = endNode.parent;
    while (parentElement) {
      const next = treeClone.cache.get(parentElement);
      if (next) {
        if (next.visited) {
          pathIntersection = next;
          break;
        }

        next.visit();
        parentElement = next.parent;
      } else {
        break;
      }
    }

    if (pathIntersection) {
      // clean unnecesary visited nodes
      treeClone.visitNodeUp(pathIntersection, false);
      pathIntersection.visit();

      const children: TreeNode[] = Array.from(
        pathIntersection.element.childNodes
      )
        .map((element) => treeClone.cache.get(element))
        .filter(isNotNull);

      const branches = findAllIndexes(children, (node) => node.visited);
      if (branches.length !== 2) {
        return [null, null];
      }

      const [leftBranch, rightBranch] = branches;

      for (let branch = 0; branch < children.length; branch++) {
        if (branch > leftBranch && branch < rightBranch) {
          const subtree = children[branch];
          treeClone.visitNodeDown(subtree, true);
        }
      }

      return [treeClone, pathIntersection];
    } else {
      return [null, null];
    }
  } else {
    return [treeClone, startNode];
  }
}
