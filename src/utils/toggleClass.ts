import { addClass, removeClass } from 'dom-lib';

const toggleClass = (node: HTMLElement, className: string, condition: boolean) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};

export default (node: HTMLElement | HTMLElement[], className: string, condition: boolean) => {
  if (!node) {
    return;
  }

  if (Array.isArray(node) || Object.getPrototypeOf(node).hasOwnProperty('length')) {
    node = node as HTMLElement[];
    Array.from(node).forEach(item => {
      toggleClass(item, className, condition);
    });
    return;
  }
  toggleClass(node, className, condition);
};
