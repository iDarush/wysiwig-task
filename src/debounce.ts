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
