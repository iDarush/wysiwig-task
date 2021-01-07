import { RootBlock } from "./editor/blocks/root.js";
import { buildTreeFromElement } from "./editor/tree.js";

const NESTED_TEXT = `<span><span>123</span></span>`;

const NESTED_BLOCK = `<div><p>123</p></div>`;

const NESTED_BOLD = `<strong><span>123</span><strong>456</strong></strong>`;

const editor = document.createElement("div");
editor.innerHTML = NESTED_BOLD;

let tree = buildTreeFromElement(editor)[0];

if (tree.children.some((child) => child instanceof RootBlock)) {
  const fakeRoot = new RootBlock(null, null);
  fakeRoot.appendChild(tree);
  tree = fakeRoot;
}

tree.normalize();

tree.children.forEach((child) => child.removeEmptyNodes());
tree = tree.children.filter((child) => !child.shouldBeRemoved);

console.log(tree);

export default tree;
