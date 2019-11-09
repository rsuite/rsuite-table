export default function findAllParents(rowData, rowKey) {
  const parents = [];

  if (!rowData) {
    return parents;
  }

  function findParent(data) {
    if (data) {
      parents.push(data[rowKey]);
      if (data._parent) {
        findParent(data._parent);
      }
    }
  }
  findParent(rowData._parent);
  return parents;
}
