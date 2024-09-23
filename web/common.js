export const commonPrefix = '🪛';

export function injectCss(href) {
  if (document.querySelector(`link[href^='${href}']`)) {
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    const timeout = setTimeout(resolve, 1000);
    link.addEventListener('load', (_e) => {
      clearInterval(timeout);
      resolve();
    });
    link.href = href;
    document.head.appendChild(link);
  });
}
