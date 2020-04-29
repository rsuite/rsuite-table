/**
 * https://stackoverflow.com/questions/36682241/testing-functional-components-with-renderintodocument
 */
import React from 'react';
import { findDOMNode } from 'react-dom';
import ReactTestUtils from 'react-dom/test-utils';

class TestWrapper extends React.Component {
  render() {
    return this.props.children;
  }
}

export function getInstance(children) {
  // isReactComponent is only defined if children is of React.Component class
  // so we can test against this to verify this is a functional component
  if (!(children.type.prototype && children.type.prototype.isReactComponent)) {
    const instanceRef = React.createRef();

    ReactTestUtils.renderIntoDocument(
      <TestWrapper>{React.cloneElement(children, { ref: instanceRef })}</TestWrapper>
    );

    return instanceRef.current;
  }
  return ReactTestUtils.renderIntoDocument(children);
}

export function getDOMNode(children) {
  return findDOMNode(getInstance(children));
}

export const findDOM = findDOMNode;

export default TestWrapper;
