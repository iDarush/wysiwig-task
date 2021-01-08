import { createTextNode } from "../dom";
import { processElement, Tree, TreeNode } from "../nodes";
import { emptySelection, UserSelection, splitTextBySelection } from "../range";
import { getTextNodeValue, normalizeText } from "../text";
import { walkFromNodeDonw } from "../tree";

export class BaseWordCommand {
  private tagName: string;
  private synonyms: string[];
  private className: string;

  constructor(tag: string, className: string, synonyms: string[] = []) {
    this.tagName = tag;
    this.synonyms = synonyms;
    this.className = className;
  }

  private makeBlockElement() {
    const child = document.createElement(this.tagName);
    child.classList.add(this.className);

    return child;
  }

  private undoBlockElement(block: TreeNode, textNode: TreeNode, tree: Tree) {
    // just replace with self text content
    if (block.element === textNode.parent && block.parent) {
      tree.nodeMap.delete(block.element);
      block.parent.replaceChild(textNode.element, block.element);

      normalizeText(textNode.parent, tree);
    } else {
      const replacement = document.createElement(this._undoTag());
      Array.from(block.element.childNodes).forEach((child) => {
        replacement.appendChild(child);
      });

      (block.element as Element).replaceWith(replacement);

      tree.nodeMap.delete(block.element);
      tree.nodeMap.set(replacement, block);

      block.element = replacement;
    }
  }

  public isNodeNormalizedBlock(node: TreeNode) {
    if (node.type === "block") {
      const element = node.element as Element;
      return (
        element.nodeName === this.tagName &&
        element.classList.contains(this.className)
      );
    }

    return false;
  }

  public isNodeFormatted(node: TreeNode, tree: Tree, inherited = true) {
    let result = this._checkNodeFormatting(node, inherited);
    if (!result && inherited) {
      result = !!this._findClosestParent(node, tree);
    }

    return result;
  }

  public normalizeBlock(node: TreeNode, tree: Tree) {
    if (
      node.type === "block" &&
      this.isNodeFormatted(node, tree, false) &&
      !this.isNodeNormalizedBlock(node)
    ) {
      const replacement = this.makeBlockElement();
      Array.from(node.element.childNodes).forEach((child) => {
        replacement.appendChild(child);
      });

      (node.element as Element).replaceWith(replacement);

      tree.nodeMap.delete(node.element);
      tree.nodeMap.set(replacement, node);

      node.element = replacement;
    }
  }

  public canBeFormatted(node: TreeNode) {
    return node.type === "text";
  }

  public willBeFormatted(node: TreeNode, tree: Tree) {
    return !this.isNodeFormatted(node, tree, true);
  }

  public apply(node: TreeNode, tree: Tree) {
    if (!this.canBeFormatted(node) || !this.willBeFormatted(node, tree)) {
      return false;
    }

    this._apply(node, tree);

    return true;
  }

  public revert(node: TreeNode, tree: Tree) {
    if (!this.canBeFormatted(node)) {
      return false;
    }

    let formattedParent = this._findClosestParent(node, tree);
    if (!formattedParent) {
      return;
    }

    const childHaveToStayUnchanged: TreeNode[] = [];
    walkFromNodeDonw(formattedParent, tree, (n) => {
      if (node.element !== n.element && this.canBeFormatted(n)) {
        childHaveToStayUnchanged.push(n);
      }
    });

    // if reversion applied only for part of node
    // keep rest of word bolded
    const nodeText = getTextNodeValue(node);
    const offcet = node.selection || emptySelection();
    const parts = splitTextBySelection(nodeText, offcet);
    if (parts.length > 1) {
      this._apply(node, tree, true);
    }

    childHaveToStayUnchanged.forEach((child) => {
      const replacement = this._apply(child, tree, false, emptySelection());
      replacement.forEach((element) => {
        const n = tree.nodeMap.get(element);
        if (n) {
          n.visited = child.visited;
          n.selection = child.selection;
        }
      });
    });

    this.undoBlockElement(formattedParent, node, tree);
  }

  private _findClosestParent(node: TreeNode, tree: Tree) {
    // try to find closest "bolded" parent
    let boldedNode = node.parent ? tree.nodeMap.get(node.parent) : null;
    while (boldedNode && !this._checkNodeFormatting(boldedNode, true)) {
      boldedNode = boldedNode.parent
        ? tree.nodeMap.get(boldedNode.parent)
        : null;
    }

    return boldedNode;
  }

  private _checkNodeFormatting(node: TreeNode, inherited = false) {
    const element =
      node.type === "block" ? node.element : node.element.parentNode;

    if (!element) {
      return false;
    }

    const tags = [this.tagName, ...this.synonyms];

    if (tags.includes(element.nodeName)) {
      return true;
    }

    if (inherited) {
      const el = element as Element;
      const style = window.getComputedStyle(el);
      return (
        el.classList.contains(this.className) || this._checkStyles(el, style)
      );
    }

    return false;
  }

  private _apply(
    node: TreeNode,
    tree: Tree,
    reverse = false,
    customOffcet: UserSelection | null = null
  ) {
    const nodeText = getTextNodeValue(node);
    const offcet = customOffcet || node.selection || emptySelection();
    const parts = splitTextBySelection(nodeText, offcet);

    const createdNodes: Node[] = [];
    const replacement = parts.map(({ affected, text }) => {
      const needBold = reverse ? !affected : affected;
      const textNode: Node = createTextNode(text);
      let newChild = textNode;

      createdNodes.push(textNode);

      if (needBold) {
        newChild = this.makeBlockElement();
        newChild.appendChild(textNode);
        tree.nodeMap.set(newChild, processElement(newChild));

        createdNodes.push(newChild);
      }

      tree.nodeMap.set(textNode, processElement(textNode));
      return newChild;
    });

    tree.nodeMap.delete(node.element);
    (node.element as Text).replaceWith(...replacement);

    return createdNodes;
  }

  protected _checkStyles(element: Element, style: CSSStyleDeclaration) {
    return false;
  }

  protected _undoTag() {
    return "DIV";
  }
}
