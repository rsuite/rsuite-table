import { useCallback, useRef } from 'react';
import type { FocusEvent, FocusEventHandler, MutableRefObject, RefObject } from 'react';
import type { RowDataType } from '../types';

interface FocusedRow {
  index: number;
  element: HTMLElement;
}

interface VirtualizedFocusProps<Row> {
  enabled?: boolean;
  tableRef: RefObject<HTMLElement>;
  tableRows: MutableRefObject<Record<string, [HTMLElement, Row]>>;
  data: readonly Row[];
  rowKey?: keyof Row;
  update: () => void;
  onBlurCapture?: FocusEventHandler<HTMLDivElement>;
}

function findFocusedRow<Row extends RowDataType>({
  tableRef,
  tableRows,
  data,
  rowKey
}: VirtualizedFocusProps<Row>): FocusedRow | null {
  const table = tableRef.current;
  const active = table?.ownerDocument.activeElement;
  if (!table || !active || !table.contains(active)) return null;

  // Match the owned row ref, including when a cell contains another table.
  for (let node: Element | null = active; node && node !== table; node = node.parentElement) {
    const index = Number(node.getAttribute('aria-rowindex')) - 2;
    if (index < 0 || !Number.isInteger(index)) continue;
    const cached = tableRows.current[index];
    if (!cached || cached[0] !== node) continue;

    let currentIndex = index;
    if (rowKey && typeof cached[1][rowKey] !== 'undefined') {
      const key = cached[1][rowKey];
      if (data[index]?.[rowKey] !== key) {
        currentIndex = data.findIndex(row => row[rowKey] === key);
      }
    }
    if (currentIndex < 0 || currentIndex >= data.length) return null;
    return { index: currentIndex, element: cached[0] };
  }
  return null;
}

export default function useVirtualizedFocus<Row extends RowDataType>(
  props: VirtualizedFocusProps<Row>
) {
  const { enabled, onBlurCapture, update } = props;
  const retainedRow = useRef<HTMLElement | null>(null);
  retainedRow.current = null;
  const focusedRow = enabled ? findFocusedRow(props) : null;
  const handleBlurCapture = useCallback(
    (event: FocusEvent<HTMLDivElement>) => {
      onBlurCapture?.(event);
      const row = retainedRow.current;
      const next = event.relatedTarget;
      if (
        row?.contains(event.target as Node) &&
        (!next || !('nodeType' in next) || !row.contains(next as Node))
      ) {
        update();
      }
    },
    [onBlurCapture, update]
  );
  return { focusedRow, retainedRow, onBlurCapture: handleBlurCapture };
}
