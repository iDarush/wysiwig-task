import { TreeNode } from "./nodes";
import { getNodeSelection } from "./range";
import { buildTree, visitTreeByRange } from "./tree-builder";
import { Command } from "./types";

export class Tool {
  constructor(
    private _editorElement: HTMLElement,
    private _toolElement: Element,
    private _command: Command
  ) {
    this._run = this._run.bind(this);
    this._init();
  }

  private _init() {
    this._toolElement.addEventListener("click", this._run);
  }

  private _run(evt: Event) {
    evt.preventDefault();
    this._editorElement.focus();

    const selection = window.getSelection();
    if (!selection) {
      return;
    }

    const range = selection.getRangeAt(0);
    const tree = buildTree(this._editorElement);
    const visitedTree = visitTreeByRange(tree, range);

    if (visitedTree) {
      const visitedNodes = visitedTree.getVisitedNodes();
      const allowedNodes = visitedNodes.filter((node) => {
        // save user selection before any dom manipulation
        if (node.type === "text") {
          node.selection = getNodeSelection(node.element, range);
        }

        return this._command.canBeApplied(node);
      });

      if (!allowedNodes.length) {
        return;
      }

      const willBeTouchedNodes = allowedNodes.filter((node) =>
        this._command.willBeApplied(node, visitedTree)
      );

      const revertTouched = willBeTouchedNodes.length < allowedNodes.length / 2;
      const action = revertTouched ? this._command.revert : this._command.apply;

      let visited: TreeNode | undefined = allowedNodes[0];

      const restoreCaret = saveCaretPosition(this._editorElement);

      while (visited) {
        action(visited, visitedTree);
        visited.visited = false;
        visited = visitedTree
          .getVisitedNodes()
          .find((node) => this._command.canBeApplied(node));
      }

      restoreCaret();

      return true;
    }

    return false;
  }

  destroy() {
    if (this._toolElement) {
      this._toolElement.removeEventListener("click", this._run);
    }
  }
}

function saveCaretPosition(editorElement: HTMLElement) {
  const selection = window.getSelection();
  if (!selection) {
    return () => {};
  }

  var range = selection.getRangeAt(0);
  range.setStart(editorElement, 0);
  const text = range.toString();
  var len = text.length;

  return () => {
    const sel = window.getSelection();
    if (sel) {
      var pos = getTextNodeAtPosition(editorElement, len);
      sel.removeAllRanges();
      const newRange = new Range();
      newRange.setStart(pos.node, pos.position);
      sel.addRange(newRange);
    }
  };
}

function getTextNodeAtPosition(root: HTMLElement, index: number) {
  const treeWalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      const elem = node as Text;
      const content = elem.textContent || "";
      if (index > content.length) {
        index -= content.length;
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const next = treeWalker.nextNode();
  return {
    node: next || root,
    position: index,
  };
}
