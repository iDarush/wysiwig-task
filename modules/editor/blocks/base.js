let id = 1;

export class BaseCommand {
  static get type() {
    return "UNKNOWN";
  }

  get nodeClass() {
    return null;
  }
}

export class BaseBlock {
  constructor(element, parent) {
    this.element = element;
    this.parent = parent;
    this.children = [];
    this.id = id++;
  }

  get selected() {
    return this.children.some((child) => child.selected);
  }

  get isEmpty() {
    const hasNotEmptyChild = this.children.some((child) => !child.isEmpty);
    return !hasNotEmptyChild;
  }

  get shouldBeRemoved() {
    if (this.children.length) {
      return this.children.every((child) => child.shouldBeRemoved);
    }
    return true;
  }

  removeEmptyNodes() {
    this.children = this.children.filter((child) => !child.shouldBeRemoved);
  }

  normalize() {
    if (this.children.length) {
      const copy = [...this.children];
      copy.forEach((child) => child.normalize());
    }
  }

  appendChild(node) {
    this.children.push(node);
    node.parent = this;
  }

  removeChild(node) {
    this.children = this.children.filter((c) => c !== node);
  }

  replaceChild(node, replacement) {
    const index = this.children.indexOf(node);
    if (index >= 0) {
      if (!Array.isArray(replacement)) {
        replacement = [replacement];
      }

      this.children = [
        ...this.children.slice(0, index),
        ...replacement.map((n) => {
          n.parent = this;
          return n;
        }),
        ...this.children.slice(index + 1),
      ];
    }
  }

  asPlainText(selectedOnly = false) {
    return this.children
      .map((child) => child.asPlainText(selectedOnly))
      .join("");
  }

  asHtml(selectedOnly = false) {
    return this.contentAsHtml(selectedOnly);
  }

  contentAsHtml(selectedOnly = false) {
    return this.children.map((child) => child.asHtml(selectedOnly)).join("");
  }

  apply(command) {
    if (this.willBeApplied(command)) {
      this.children.forEach((child) => child.apply(command));
    }
  }

  revert(command) {
    this.children.forEach((child) => child.revert(command));
  }

  willBeApplied(command) {
    return this.children.some((child) => child.willBeApplied(command));
  }

  static get TAG() {
    return "";
  }

  static IsMatch(node) {
    return false;
  }
}
