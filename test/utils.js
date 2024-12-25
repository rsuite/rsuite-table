import React from 'react';
import { render as testRender } from '@testing-library/react';
import getStyle from 'dom-lib/getStyle';

export { getStyle };

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

console.log('React version:', React.version);

/**
 * Check whether it is a DOM object?
 * @param node
 * @return {boolean}
 */
function isDOMElement(node) {
  return (
    node && typeof node === 'object' && node.nodeType === 1 && typeof node.nodeName === 'string'
  );
}

function guid() {
  return '_' + Math.random().toString(36).substr(2, 12);
}

// Record every container created for rendering
// Useful for doing a cleanup after each test case
// Ref: https://github.com/testing-library/react-testing-library/blob/main/src/pure.js
const mountedContainers = new Set();
const mountedRoots = new Set();

export async function render(children) {
  const container = createTestContainer();
  const root = createRoot(container);

  // Render the React component
  root.render(children);

  // Track the root for cleanup
  mountedRoots.add(root);

  return container;
}

/**
 * Cleans up all tracked containers and roots.
 * This function is automatically called after each test.
 */
function cleanup() {
  mountedContainers.forEach(cleanupContainer);
  mountedRoots.forEach(root => {
    root.unmount();
  });
  mountedContainers.clear();
  mountedRoots.clear();
}

afterEach(() => {
  cleanup();
});

// maybe one day we'll expose this (perhaps even as a utility returned by render).
// but let's wait until someone asks for it.
function cleanupContainer(container) {
  if (container.parentNode === document.body) {
    document.body.removeChild(container);
  }
  mountedContainers.delete(container);
}

export function getInstance(children) {
  const instanceRef = React.createRef();

  render(React.cloneElement(children, { ref: instanceRef }));

  return instanceRef.current;
}

/**
 * @return {HTMLElement}
 */
export function getDOMNode(children) {
  if (isDOMElement(children)) {
    return children;
  }

  if (isDOMElement(children.child)) {
    return children.child;
  }

  return getTestDOMNode(children);
}

export function getTestDOMNode(children) {
  const testId = guid();
  const childTestId = guid();
  const { getByTestId } = testRender(
    <div data-testid={testId}>{React.cloneElement(children, { 'data-testid': childTestId })}</div>
  );

  try {
    return getByTestId(testId).firstChild || getByTestId(childTestId);
  } catch (e) {
    return null;
  }
}

/**
 * @param {HTMLElement} node
 * @return {String}
 */
export function innerText(node) {
  if (window.navigator.userAgent.toLowerCase().indexOf('firefox') !== -1) {
    return node.textContent;
  }
  return node.innerText;
}

/**
 * @return {HTMLDivElement}
 */
export function createTestContainer() {
  const container = document.createElement('div');
  document.body.appendChild(container);

  // we'll add it to the mounted containers regardless of whether it's actually
  // added to document.body so the cleanup method works regardless of whether
  // they're passing us a custom container or not.
  mountedContainers.add(container);

  return container;
}

export const inChrome = window.navigator.userAgent.includes('Chrome');

export const itChrome = (...args) => {
  if (inChrome) {
    it(...args);
  }
};
