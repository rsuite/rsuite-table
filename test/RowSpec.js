import React from 'react';
import Row from '../src/Row';
import { getDOMNode } from './utils';

describe('Row', () => {
  it('Should output a row', () => {
    const Title = 'Title';
    const instanceDom = getDOMNode(<Row>Title</Row>);
    assert.include(instanceDom.className, 'rs-row');
    assert.equal(instanceDom.style.height, '46px');
    assert.equal(instanceDom.innerText, Title);
  });

  it('Should have a min width', () => {
    const instanceDom = getDOMNode(<Row width={100}>Title</Row>);

    assert.equal(instanceDom.style.minWidth, '100px');
  });

  it('Should have a height', () => {
    const instanceDom = getDOMNode(<Row height={100} />);

    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should have a height when set isHeaderRow', () => {
    const instanceDom = getDOMNode(<Row headerHeight={100} isHeaderRow />);

    assert.equal(instanceDom.style.height, '100px');
  });

  it('Should have a top', () => {
    const instanceDom = getDOMNode(<Row top={100} />);

    assert.equal(instanceDom.style.transform, 'translate3d(0px, 100px, 0px)');
  });

  it('Should have a custom className', () => {
    const instanceDom = getDOMNode(<Row className="custom" />);
    assert.ok(instanceDom.className.match(/\bcustom\b/));
  });

  it('Should have a custom style', () => {
    const fontSize = '12px';
    const instanceDom = getDOMNode(<Row style={{ fontSize }} />);
    assert.equal(instanceDom.style.fontSize, fontSize);
  });
});
