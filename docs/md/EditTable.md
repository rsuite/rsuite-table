
> 可编辑的表格，只需要自定义一个 `Cell` 就行了

```js
export const EditCell = ({ rowData, dataKey, onChange, ...props }) => {
  return (
    <Cell {...props}>
      {rowData.status === 'EDIT' ? (
        <input
          className="input"
          defaultValue={rowData[dataKey]}
          onChange={(event) => {
            onChange && onChange(rowData.id, dataKey, event.target.value);
          }}
        />
      ) : rowData[dataKey]}
    </Cell>
  );
};
```
