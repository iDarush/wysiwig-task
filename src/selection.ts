export interface UserSelection {
  start: number;
  end: number;
}

export function getNodeSelection(node: Node, range: Range): UserSelection {
  const start = node === range.startContainer ? range.startOffset : -1;
  const end = node === range.endContainer ? range.endOffset : -1;

  return { start, end };
}

export function emptySelection(): UserSelection {
  return { start: -1, end: -1 };
}

export function splitTextBySelection(text: string, offcet: UserSelection) {
  if (!text) {
    return [];
  }

  let { start, end } = offcet;
  if (start < 0) {
    start = 0;
  }
  if (end < 0) {
    end = text.length;
  }

  const parts = [
    { text: text.substring(0, start), selected: false },
    { text: text.substring(start, end), selected: true },
    { text: text.substring(end, text.length), selected: false },
  ].filter((p) => !!p.text);

  return parts;
}
