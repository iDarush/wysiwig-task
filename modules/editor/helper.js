import { ROOT_TAG } from "./constants.js";

export function isRootNode(node) {
  return (
    node && (node.tagName === ROOT_TAG.toUpperCase() || node.tagName === "P")
  );
}

function getNextNode(node) {
  if (node.firstChild) return node.firstChild;
  while (node) {
    if (node.nextSibling) return node.nextSibling;
    node = node.parentNode;
  }
}

function getOffcet(range, node) {
  const start = node === range.startContainer ? range.startOffset : -1;
  const end = node === range.endContainer ? range.endOffset : -1;

  return { start, end };
}

export function offcetIsEmpty(offcet, text) {
  return !offcet || (offcet.start < 0 && offcet.end < 0);
}

export function getNodesInRange(range) {
  var start = range.startContainer;
  var end = range.endContainer;
  var commonAncestor = range.commonAncestorContainer;
  var nodes = [];
  var node;

  // walk parent nodes from start to common ancestor
  for (node = start.parentNode; node; node = node.parentNode) {
    nodes.push({ node, offcet: getOffcet(range, node) });
    if (node == commonAncestor) break;
  }
  nodes.reverse();

  // walk children and siblings from start until end is found
  for (node = start; node; node = getNextNode(node)) {
    nodes.push({ node, offcet: getOffcet(range, node) });
    if (node == end) break;
  }

  return nodes;
}

export function getNodesInElement(element, includeRoot = true) {
  let result = includeRoot ? [{ node: element }] : [];

  if (element.hasChildNodes()) {
    Array.from(element.childNodes).forEach((c) => {
      result = result.concat(getNodesInElement(c));
    });
  }

  return result;
}

export function debounce(fn, timeout, ctx) {
  let timer;

  return function (...args) {
    const context = ctx || this;

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      fn.apply(context, args);
      timer = null;
    }, timeout);
  };
}
