import { UserSelection } from "./selection";

let NODE_ID = 1;

export class TreeNode {
  private _id: number;
  public type: "text" | "block";
  public element: Node;
  public visited: boolean;
  public isRoot?: boolean;
  public selection?: UserSelection;

  constructor(element: Node, isRoot = false) {
    const type = element.nodeType === Node.TEXT_NODE ? "text" : "block";
    this.type = type;
    this.isRoot = isRoot;
    this.element = element;
    this.visited = false;
    this._id = NODE_ID++;
  }

  public get parent() {
    return this.isRoot ? null : this.element.parentNode;
  }

  public get isEmpty() {
    if (this.type === "text") {
      return !(this.element as Text).data;
    }

    return !this.element.firstChild;
  }

  public visit(value = true) {
    this.visited = value;
  }
}

export class Tree {
  cache: Map<Node, TreeNode>;

  constructor() {
    this.cache = new Map();
  }

  public get allNodes() {
    return Array.from(this.cache.values());
  }

  public clone() {
    const result = new Tree();

    this.cache.forEach((_, element) => {
      const clonedNode = new TreeNode(element);
      result.cache.set(element, clonedNode);
    });

    return result;
  }

  /**
   * Execute action from specified node to all it descendants
   */
  public walkFromNodeUp(node: TreeNode, action: (node: TreeNode) => void) {
    action(node);
    let parent = node.parent ? this.cache.get(node.parent) : null;
    while (parent) {
      action(parent);
      parent = parent.parent ? this.cache.get(parent.parent) : null;
    }
  }

  /**
   * Execute action from specified node to all it descendants
   */
  public walkFromNodeDonw(node: TreeNode, action: (node: TreeNode) => void) {
    action(node);

    if (node.element.hasChildNodes()) {
      Array.from(node.element.childNodes).forEach((element) => {
        const child = this.cache.get(element);
        if (child) {
          this.walkFromNodeDonw(child, action);
        }
      });
    }
  }

  /**
   * Set visited state from specified node to all it parents until root
   */
  public visitNodeUp(node: TreeNode, value = true) {
    this.walkFromNodeUp(node, (n) => n.visit(value));
  }

  /**
   * Set visited state from specified node to all it descendants
   */
  public visitNodeDown(node: TreeNode, value = true) {
    this.walkFromNodeDonw(node, (n) => n.visit(value));
  }

  public getVisitedNodes() {
    const nodes = this.allNodes;
    const visitedNodes = nodes.filter((node) => node.visited);
    return visitedNodes;
  }
}
