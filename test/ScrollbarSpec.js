import React from 'react';
import Scrollbar from '../src/Scrollbar';
import { fireEvent, render, screen } from '@testing-library/react';

describe('Scrollbar', () => {
  it('Should output a scrollbar', () => {
    render(<Scrollbar />);

    expect(screen.getByRole('scrollbar')).to.have.class('rs-scrollbar');
  });

  it('Should be vertical', () => {
    render(<Scrollbar vertical />);

    expect(screen.getByRole('scrollbar')).to.have.class('rs-scrollbar-vertical');
  });

  it('Should render a scroll handle', () => {
    render(<Scrollbar scrollLength={1000} length={100} />);

    expect(screen.getByRole('button').style.width).to.equal('10%');
  });

  it('Should call onMouseDown callback', () => {
    const onMouseDown = sinon.spy();

    render(<Scrollbar onMouseDown={onMouseDown} />);

    fireEvent.mouseDown(screen.getByRole('button'));

    expect(onMouseDown).to.have.been.calledOnce;
  });

  it('Should have a custom style', () => {
    render(<Scrollbar style={{ fontSize: 12 }} />);

    expect(screen.getByRole('scrollbar')).to.have.style('font-size', '12px');
  });

  it('Should not call `onScroll` callback', () => {
    const ref = React.createRef();
    render(<Scrollbar length={100} scrollLength={1000} onScroll={scroll} ref={ref} />);

    ref.current.onWheelScroll(100);

    expect(screen.getByRole('button').style.transform).to.equal('translate3d(10px, 0px, 0px)');
  });
});
