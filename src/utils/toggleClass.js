import { addClass, removeClass } from 'dom-lib';

const toggleClass = (node: HTMLElement, className: string, condition: boolean) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};

export default (node: HTMLElement | Array<HTMLElement>, className: string, condition: boolean) => {
  if (!node) {
    return;
  }

  if (Object.getPrototypeOf(node).hasOwnProperty('length')) {
    Array.from(node).forEach(item => {
      toggleClass(item, className, condition);
    });
    return;
  }
  toggleClass(node, className, condition);
};
