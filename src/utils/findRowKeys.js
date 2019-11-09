export default function findRowKeys(rows, rowKey, expanded) {
  let keys = [];
  for (let i = 0; i < rows.length; i++) {
    let item = rows[i];
    if (item.children) {
      keys.push(item[rowKey]);
      keys = [...keys, ...findRowKeys(item.children, rowKey)];
    } else if (expanded) {
      keys.push(item[rowKey]);
    }
  }
  return keys;
}
