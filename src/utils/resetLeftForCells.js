import React from 'react';
export default function resetLeftForCells(cells) {
  let left = 0;
  const nextCells = [];

  for (let i = 0; i < cells.length; i++) {
    let cell = cells[i];
    let nextCell = React.cloneElement(cell, { left });
    left += cell.props.width;
    nextCells.push(nextCell);
  }

  return nextCells;
}
