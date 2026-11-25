import React from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import useScrollListener from '../src/hooks/useScrollListener';
import type { ScrollbarInstance } from '../src/Scrollbar';

describe('Horizontal scrollbar during a virtualized resize commit', () => {
  it('uses the current content offset when the resize effect has already moved the thumb', () => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const tableWidth = { current: 260 };
    const scrollX = { current: -120 };
    const scrollY = { current: 0 };
    const operationLog: { kind: string; offset: number }[] = [];
    let thumbPosition = 64;
    const thumb: ScrollbarInstance = {
      root: host,
      handle: host,
      onWheelScroll(delta: number) {
        thumbPosition += (delta * tableWidth.current) / 600;
        operationLog.push({ kind: 'relative', offset: thumbPosition });
      },
      resetScrollBarPosition(offset = 0) {
        thumbPosition = offset;
        operationLog.push({ kind: 'absolute', offset });
      }
    };

    let scroll: ReturnType<typeof useScrollListener>;
    function Fixture() {
      scroll = useScrollListener({
        rtl: false,
        data: [],
        height: 200,
        getTableHeight: () => 200,
        contentHeight: { current: 200 },
        headerHeight: 40,
        tableBodyRef: { current: null },
        scrollbarXRef: { current: thumb },
        scrollbarYRef: { current: null },
        tableRef: { current: host },
        contentWidth: { current: 600 },
        tableWidth,
        scrollY,
        minScrollY: { current: 0 },
        minScrollX: { current: -280 },
        scrollX,
        setScrollX: value => {
          scrollX.current = value;
        },
        setScrollY: value => {
          scrollY.current = value;
        },
        virtualized: true,
        forceUpdatePosition: () => {},
        deferUpdatePosition: () => {}
      });
      return null;
    }

    try {
      flushSync(() => root.render(<Fixture />));
      // The dimension ref changes before the virtualized wheel update commits.
      tableWidth.current = 320;
      scroll!.onScrollByKeydown({
        currentTarget: host,
        target: host,
        key: 'ArrowRight',
        preventDefault() {}
      } as unknown as React.KeyboardEvent);
      expect(scrollX.current).to.equal(-160);
      expect(operationLog[0]?.kind).to.equal('absolute');
      expect(operationLog[0]?.offset).to.be.closeTo((160 * 320) / 600, 0.01);
      expect(thumbPosition).to.be.closeTo((160 * 320) / 600, 0.01);
    } finally {
      flushSync(() => root.unmount());
      host.remove();
    }
  });
});
