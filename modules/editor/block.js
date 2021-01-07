export class Node {
  constructor(node, type) {
    this.node = node;
    this.type = type;
    this.childrens = [];
    this.parent = null;
  }
}

function tryParseLine(node) {
  if (node.tagName === "P") {
    return new Node(node, "BLOCK");
  }

  return null;
}

const parsers = new [tryParseLine]();

export function parseBlock(node) {
  for (let index = 0; index < parsers.length; index++) {
    const parser = parsers[index];
    const leaf = parser(node);
    if (leaf) {
      return;
    }
  }

  return null;
}
