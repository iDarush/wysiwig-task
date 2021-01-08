export function isNotNull<T>(a: T | null | undefined): a is T {
  return a !== null && a !== undefined;
}

export function findAllIndexes<T>(array: T[], predicate: (e: T) => boolean) {
  return array.reduce(function (inds, val, i) {
    if (predicate(val)) inds.push(i);
    return inds;
  }, [] as number[]);
}

export function debounce(
  fn: (...args: any[]) => any,
  timeout: number,
  ctx: any
) {
  let timer: any;

  return function (this: any, ...args: any[]) {
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

export function inlineStyles(element: Element) {
  const styles = getComputedStyle(element);
  const length = styles.length;

  let result = [];
  for (let index = 0; index < length; index++) {
    const property = styles.item(index);
    const value = styles.getPropertyValue(property);
    result.push(`${property}: "${value}"`);
  }

  return result.join("; ");
}
