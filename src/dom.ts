export function removeAllChild(
  element: Element,
  callback?: (el: Node) => void
) {
  while (element.lastChild) {
    const child = element.lastChild;
    element.removeChild(child);
    callback && callback(child);
  }
}

export function createTextNode(text: string) {
  return document.createTextNode(text);
}
