import * as React from 'react';

/**
 * 重置数组中所有 cell 的相对 left 的距离。
 * @param cells
 * @param extraWidth 额外为最后一个元素添加的的宽度，当存在纵向滚动条的时候设置。
 */
export default function resetLeftForCells(cells, extraWidth?: number) {
  let left = 0;
  const nextCells = [];

  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i];
    const nextCell = React.cloneElement(cell, {
      left,
      width: i === cells.length - 1 && extraWidth ? cell.props.width + extraWidth : cell.props.width
    });
    left += cell.props.width;
    nextCells.push(nextCell);
  }

  return nextCells;
}
