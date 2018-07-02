import { addClass, removeClass } from 'dom-lib';

const toggleClass = (node: HTMLElement, className: string, condition: boolean) => {
  if (condition) {
    addClass(node, className);
  } else {
    removeClass(node, className);
  }
};

export default toggleClass;
