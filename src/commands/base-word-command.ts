import { createTextNode } from "../dom";
import { Tree, TreeNode } from "../nodes";
import {
  emptySelection,
  UserSelection,
  splitTextBySelection,
} from "../selection";
import { getTextNodeValue, normalizeText } from "../text";

export class BaseWordCommand {
  private _tagName: string;
  private _synonymTags: string[];
  private _className: string;

  constructor(tag: string, className: string, synonymTags: string[] = []) {
    this._tagName = tag;
    this._synonymTags = synonymTags;
    this._className = className;
  }

  /**
   * Make empty formatted node
   */
  private _makeBlockElement() {
    const child = document.createElement(this._tagName);
    child.classList.add(this._className);

    return child;
  }

  /**
   * Remove formatting
   */
  private _undoBlockElement(block: TreeNode, textNode: TreeNode, tree: Tree) {
    if (block.element === textNode.parent && block.parent) {
      // just replace direct parent with self text content
      tree.cache.delete(block.element);
      block.parent.replaceChild(textNode.element, block.element);

      // try to merge separated text nodes into single one
      normalizeText(textNode.parent, tree);
    } else {
      // replace tree node with clean tag
      const replacement = document.createElement(this._undoTag());
      Array.from(block.element.childNodes).forEach((child) => {
        replacement.appendChild(child);
      });

      tree.cache.delete(block.element);
      tree.cache.set(replacement, block);

      (block.element as Element).replaceWith(replacement);
      block.element = replacement;
    }
  }

  /**
   * Check that node structure is normal form
   */
  public isNodeNormalizedBlock(node: TreeNode) {
    if (node.type === "block") {
      const element = node.element as Element;
      return (
        element.nodeName === this._tagName &&
        element.classList.contains(this._className)
      );
    }

    return false;
  }

  /**
   * Check if node formatted
   * @param node Node
   * @param tree Whole tree
   * @param inherited Look at stylesheets or parent tree formatting as well
   */
  public isNodeFormatted(node: TreeNode, tree: Tree, inherited = true) {
    let result = this._isNodeFormatted(node, inherited);
    if (!result && inherited) {
      result = !!this._findClosestFormattedParent(node, tree);
    }

    return result;
  }

  /**
   * If node looks okay we need to try bring it structure to normal form
   */
  public normalizeBlock(node: TreeNode, tree: Tree) {
    if (
      node.type === "block" &&
      this.isNodeFormatted(node, tree, false) &&
      !this.isNodeNormalizedBlock(node)
    ) {
      const replacement = this._makeBlockElement();

      Array.from(node.element.childNodes).forEach((child) => {
        replacement.appendChild(child);
      });

      tree.cache.delete(node.element);
      tree.cache.set(replacement, node);

      (node.element as Element).replaceWith(replacement);
      node.element = replacement;
    }
  }

  /**
   * Check that node can be formatted at all
   */
  public canBeFormatted(node: TreeNode) {
    return node.type === "text";
  }

  /**
   * Check that formatting will be applied on this node
   */
  public willBeFormatted(node: TreeNode, tree: Tree) {
    return !this.isNodeFormatted(node, tree, true);
  }

  /**
   * Apply formatting
   */
  public apply(node: TreeNode, tree: Tree) {
    if (!this.canBeFormatted(node) || !this.willBeFormatted(node, tree)) {
      return false;
    }

    this._applyOrReverse(node, tree);

    return true;
  }

  /**
   * Revert formatting
   */
  public revert(node: TreeNode, tree: Tree) {
    if (!this.canBeFormatted(node)) {
      return false;
    }

    // node is not formatted at all
    let formattedParent = this._findClosestFormattedParent(node, tree);
    if (!formattedParent) {
      return;
    }

    // caiuse we can revert formatting on whole subtree
    // we have to prevent undo on unselected nodes
    const childrenHaveToStayUnchanged: TreeNode[] = [];
    tree.walkFromNodeDonw(formattedParent, (n) => {
      if (node.element !== n.element && this.canBeFormatted(n)) {
        childrenHaveToStayUnchanged.push(n);
      }
    });

    // if reversion applied only for part of node
    // keep rest of word formatted
    const nodeText = getTextNodeValue(node);
    const offcet = node.selection || emptySelection();
    const parts = splitTextBySelection(nodeText, offcet);
    if (parts.length > 1) {
      this._applyOrReverse(node, tree, true);
    }

    childrenHaveToStayUnchanged.forEach((child) => {
      const replacement = this._applyOrReverse(
        child,
        tree,
        false,
        emptySelection()
      );
      replacement.forEach((element) => {
        const n = tree.cache.get(element);
        if (n) {
          n.visited = child.visited;
          n.selection = child.selection;
        }
      });
    });

    this._undoBlockElement(formattedParent, node, tree);
  }

  private _findClosestFormattedParent(node: TreeNode, tree: Tree) {
    let formattedParent = node.parent ? tree.cache.get(node.parent) : null;
    while (formattedParent && !this._isNodeFormatted(formattedParent, true)) {
      formattedParent = formattedParent.parent
        ? tree.cache.get(formattedParent.parent)
        : null;
    }

    return formattedParent;
  }

  /**
   * Try to determine node formatting
   * @param node Processable node
   * @param checkStyles Check node stylesheet as well
   */
  private _isNodeFormatted(node: TreeNode, checkStyles = false) {
    const element =
      node.type === "block" ? node.element : node.element.parentNode;

    if (!element) {
      return false;
    }

    const tags = [this._tagName, ...this._synonymTags];

    if (tags.includes(element.nodeName)) {
      return true;
    }

    if (checkStyles) {
      const el = element as Element;
      const style = window.getComputedStyle(el);
      return (
        el.classList.contains(this._className) || this._checkStyles(el, style)
      );
    }

    return false;
  }

  /**
   * Apply or reverse command formatting
   * @param node Processable node
   * @param tree Current visited tree
   * @param reverse Formatting should be reversed
   * @param customSelection User selection overriding
   */
  private _applyOrReverse(
    node: TreeNode,
    tree: Tree,
    reverse = false,
    customSelection: UserSelection | null = null
  ) {
    const nodeText = getTextNodeValue(node);
    const userSelection = customSelection || node.selection || emptySelection();
    const parts = splitTextBySelection(nodeText, userSelection);

    const createdNodes: Node[] = [];
    const replacement = parts.map(({ selected: affected, text }) => {
      const needFormatting = reverse ? !affected : affected;
      const textNode: Node = createTextNode(text);
      createdNodes.push(textNode);

      let newChild = textNode;
      if (needFormatting) {
        newChild = this._makeBlockElement();
        newChild.appendChild(textNode);
        tree.cache.set(newChild, new TreeNode(newChild));
        createdNodes.push(newChild);
      }

      tree.cache.set(textNode, new TreeNode(textNode));
      return newChild;
    });

    tree.cache.delete(node.element);
    (node.element as Element).replaceWith(...replacement);

    return createdNodes;
  }

  /**
   * Try to determine element formatting by it styling
   */
  protected _checkStyles(element: Element, style: CSSStyleDeclaration) {
    return false;
  }

  /**
   * When whole block has to be reverted this tag will be used as replacement
   */
  protected _undoTag() {
    return "DIV";
  }
}
