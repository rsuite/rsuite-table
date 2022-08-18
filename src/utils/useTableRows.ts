import { useState, useCallback, useRef } from 'react';
import getHeight from 'dom-lib/getHeight';
import useUpdateLayoutEffect from './useUpdateLayoutEffect';
import useMount from './useMount';
import isEmpty from 'lodash/isEmpty';
import { RowDataType, RowKeyType } from '../@types/common';

interface TableRowsProps {
  prefix: (str: string) => string;
  wordWrap?: boolean | 'break-all' | 'break-word' | 'keep-all';
  data: readonly RowDataType[];
  expandedRowKeys: RowKeyType[];
}

/**
 * The row information of the table, get the DOM of all rows, and summarize the row height.
 * @param props
 * @returns
 */
const useTableRows = (props: TableRowsProps) => {
  const { prefix, wordWrap, data, expandedRowKeys } = props;
  const [tableRowsMaxHeight, setTableRowsMaxHeight] = useState<number[]>([]);
  const tableRows = useRef<{ [key: string]: [HTMLElement, any] }>({});

  const bindTableRowsRef = (index: number | string, rowData: any) => (ref: HTMLElement) => {
    if (ref) {
      tableRows.current[index] = [ref, rowData];
    }
  };

  const calculateRowMaxHeight = useCallback(() => {
    if (wordWrap) {
      const nextTableRowsMaxHeight: number[] = [];
      const curTableRows = Object.values(tableRows.current);

      for (let i = 0; i < curTableRows.length; i++) {
        const [row] = curTableRows[i];
        if (row) {
          const cells = row.querySelectorAll(`.${prefix('cell-wrap')}`) || [];
          const cellArray = Array.from(cells);
          let maxHeight = 0;

          for (let j = 0; j < cellArray.length; j++) {
            const cell = cellArray[j];
            const h = getHeight(cell);
            maxHeight = Math.max(maxHeight, h);
          }

          nextTableRowsMaxHeight.push(maxHeight);
        }
      }

      // Can't perform a React state update on an unmounted component
      if (!isEmpty(tableRows.current)) {
        setTableRowsMaxHeight(nextTableRowsMaxHeight);
      }
    }
  }, [prefix, wordWrap]);

  useMount(() => {
    setTimeout(calculateRowMaxHeight, 1);
  });

  useUpdateLayoutEffect(() => {
    /**
     * After the data is updated, the height of the cell DOM needs to be re-acquired,
     * and what is often obtained is not the latest DOM that has been rendered.
     * So use `setTimeout` to delay obtaining the height of the cell DOM.
     * TODO: To be improved
     */
    setTimeout(calculateRowMaxHeight, 1);
  }, [data, expandedRowKeys]);

  return {
    bindTableRowsRef,
    tableRowsMaxHeight,
    tableRows
  };
};

export default useTableRows;
