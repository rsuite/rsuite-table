import React from 'react';
import { render } from '@testing-library/react';

export function testTestIdProp(element, renderOptions) {
  it('Should accept data-testid prop', () => {
    const { getByTestId } = render(
      React.cloneElement(element, { 'data-testid': 'element' }),
      renderOptions
    );

    expect(getByTestId('element')).to.exist;
  });
}

export function testClassNameProp(
  element,
  customClassName,
  renderOptions,
  getRootElement = view => view.container.firstChild
) {
  it('Should accept custom className', () => {
    const view = render(
      React.cloneElement(element, { 'data-testid': 'element', className: customClassName }),
      renderOptions
    );

    const rootElement = getRootElement(view);

    expect(rootElement).to.have.class(customClassName);
    expect(rootElement.className.split(customClassName).length).to.equal(
      2,
      `className "${customClassName}" should not appear multiple times`
    );
  });
}

export function testClassPrefixProp(
  element,
  renderOptions,
  getRootElement = view => view.container.firstChild
) {
  it('Should accept custom className prefix', () => {
    const customClassPrefix = 'custom-prefix';
    const view = render(
      React.cloneElement(element, { 'data-testid': 'element', classPrefix: customClassPrefix }),
      renderOptions
    );
    expect(getRootElement(view)).to.have.class(new RegExp('^rs-' + customClassPrefix));
  });
}

export function testStyleProp(
  element,
  renderOptions,
  getStyleElement = view => view.container.firstChild
) {
  it('Should accept custom style', () => {
    const fontSize = '12px';
    const view = render(
      React.cloneElement(element, { 'data-testid': 'element', style: { fontSize } }),
      renderOptions
    );

    expect(getStyleElement(view)).to.have.style('font-size', fontSize);
  });
}

interface TestStandardPropsOptions {
  renderOptions?: any;
  customClassName?: string | boolean;
  getRootElement?: (view: any) => HTMLElement;
  getStyleElement?: (view: any) => HTMLElement;
}

export function testStandardProps(element, options: TestStandardPropsOptions = {}) {
  const { displayName } = element.type;
  const { renderOptions, customClassName, getRootElement, getStyleElement } = options;

  describe(`${displayName} - Standard props`, () => {
    it('Should have a display name', () => {
      expect(displayName).to.exist;
    });

    testTestIdProp(element, renderOptions);
    if (customClassName !== false) {
      testClassNameProp(
        element,
        typeof customClassName === 'string' ? customClassName : 'custom-class',
        renderOptions,
        getRootElement
      );
    }
    testClassPrefixProp(element, renderOptions, getRootElement);
    testStyleProp(element, renderOptions, getStyleElement);
  });
}
