import { UserSelection } from "./range";

let NODE_ID = 1;

export class TreeNode {
  private _id: number;
  public type: "text" | "block";
  public element: Node;
  public visited: boolean;
  public isRoot?: boolean;
  public selection?: UserSelection;

  constructor(type: "text" | "block", element: Node) {
    this.type = type;
    this.element = element;
    this.visited = false;
    this._id = NODE_ID++;
  }

  public get parent() {
    return this.isRoot ? null : this.element.parentNode;
  }

  public get nextSibling(): Node | null {
    if (!this.isRoot) {
      return this.element.nextSibling;
    }

    return null;
  }

  public get previousSibling(): Node | null {
    if (!this.isRoot) {
      return this.element.previousSibling;
    }

    return null;
  }

  public visit(value = true) {
    this.visited = value;
  }
}

export class Tree {
  root: TreeNode;
  nodeMap: Map<Node, TreeNode>;

  constructor(rootElement: Node) {
    this.root = processElement(rootElement);
    this.root.isRoot = true;
    this.nodeMap = new Map();
    this.nodeMap.set(rootElement, this.root);
  }

  public clone() {
    const result = new Tree(this.root.element);

    this.nodeMap.forEach((node, element) => {
      if (!node.isRoot) {
        const clonedNode = processElement(element);
        result.nodeMap.set(element, clonedNode);
      }
    });

    return result;
  }

  public getVisitedNodes() {
    const nodes = Array.from(this.nodeMap.values());
    const visitedNodes = nodes.filter((node) => node.visited);
    return visitedNodes;
  }
}

export function processElement(element: Node): TreeNode {
  const type = element.nodeType === Node.TEXT_NODE ? "text" : "block";
  return new TreeNode(type, element);
}
