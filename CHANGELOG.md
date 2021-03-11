# 3.14.5

- **Bugfix**: fix(gatsby): fix sortColumn not getting fired in Gatsby production build

# 3.14.4

- **Bugfix**: fix(table): fix that the `ColumnGroup` array cannot be rendered in the Table

# 3.14.3

- **Bugfix**: Fix the type definition error of typescript (#195)
- **Bugfix**: Fixed ColumnGroup does not support `classPrefix` (#193)
- **Bugfix**: Fixed Row missing custom rowKey (#191)
- **Bugfix**: Fixed the unhandled scroll bar width when the Cell is fixed on the right (#189)

# 3.14.2

- **Bugfix**: Fix the table height problem caused by affixHeader (#185)

# 3.14.1

- **Improve**: Use ARIA to improve accessibility
- **Bugfix**: Fix Cell rendering redundant padding when it is not a tree column
- **Bugfix**: fix(HeaderCell): missing children prop type

# 3.14.0

- **Improve**: Add accessibility properties.
- **Bugfix**: Fix not working with `gatsbyjs`.
- **Bugfix**: Fixed invalid custom column width when dragging the column.
- **Bugfix**: Fix the problem that the vertical scroll bar is not displayed after the Tree is expanded.
- **Bugfix**: Fix the problem that the data is not updated after the isTree property is changed.

# 3.13.2

- **Bugfix**: Fix that after turning on virtualization and turning off shouldUpdateScroll, there will be a React error with page stack overflow. #163 #164

# 3.13.1

- **Bugfix**: Fixed an issue that exceeded the maximum update depth

# 3.13.0

- **Feature**: Add an optional onRowContextMenu property
- **Feature**: Add ColumnGroup
- **Bugfix**: Fix rsuite#1044

# 3.12.0

- **Feature**: Support `shouldUpdateScroll` on `<Table>`

# 3.11.3

- **Bugfix**: Improved to `children` compatible with complex structures.

# 3.11.2

- **Bugfix**: Fix the problem that the table header has no shadow.

# 3.11.1

- **Bugfix**: Fix the situation where the `affixHeader` cannot be applied to non-fixed columns.

# 3.11.0

- **Bugfix**: Fix `resizable` to be compatible with `affixHeader`
- **Feature**: Support `onDataUpdated` on `<Table>`
- **Improve**: Improved `wordWrap` property for compatibility with `rowHeight`.

# 3.10.1

- **Bugfix**: Fix the problem that the position will be reset after clicking the scroll bar

# 3.10.0

- **Feature**: Support affixHorizontalScrollbar on Table

# 3.9.5

- **Bugfix**: Fixed the problem that the scroll bar is not reset when the data is updated.

# 3.9.3

- **Bugfix**: Fixed the problem that the `resizable` property of the columns of the table would not work.

# 3.9.2

- **Bugfix**: Fixed incorrect scroll bar position when manually triggering the scroll method.
- **Bugfix**: Fixed table cannot adjust column width.
- **Bugfix**: Fixed misalignment of table header text.

# 3.9.0

- **Feature**: Added `expanded` parameter in `renderTreeToggle`.
- **Feature**: Added support `treeCol` on `<Column>`.
- **Chore**: Migrate from Flow to Typescript.
- **Breaking**: Remove the `setRowHeight` property,`rowHeight` supports function values.

# 3.8.4

- Fixed an issue where `scrollTop` would not work

# 3.8.3

- `<Table>` The "empty" status is not displayed by default when loading

# 3.8.2

- Fix RTL related bugs #121

# 3.8.1

- Improve the performance of virtualized table #120

# 3.8.0

- Added support for css import #118
- Fixed the `affixHeader` feature, which does not hide the table header when the scrolling range is outside the Table body #109
- Added support for RTL #101
- Fix #114 #116

# 3.7.1

- Fix move scrollbar issues #106

# 3.7.0

- Support for `affixHeader` on `<Table>`

# 3.6.1

- Fix \_constants is not defined #103

# 3.6.0

- Added support for RTL #101

# 3.5.9

- Fixed scroll position after data update #100

# 3.5.8

- Fixed a rendering error when the column in the table was null #99
- Fixed a problem with scrolling white screen after changing height #97

# 3.5.7

- Fixed component not re-rendered after `sortType` update.
- Fix the position of the scroll bar when the height of the table changes
- Fix validation of merged cells for custom children

# 3.5.6

- Fixed an issue where the scrollbar position was not updated after the data was updated

# 3.5.5

- Fix `expandedRowKeys` not controlled (#90)
- Support event parameter in `onRowClick` (#89)
- Custom function parameters in `<Cell>` support `rowIndex` (#88)

# 3.5.4

- Fix `expandedRowKeys` is invalid when rowKey is 0

# 3.5.3

- Fix: Unable to preventDefault inside passive event listener due to target being treated as passive

# 3.5.2

- Fixed a scrollbar being reset in the case of `virtualized`

# 3.5.1

- Fixed scrollbar position not updated after data update

# 3.5.0

- Support `renderEmpty` and `renderLoading` on `<Table>`
- Support `verticalAlign` on `<Table.Column>`
- Fix: Unable to preventDefault inside passive event listener due to target being treated as passive

# 3.4.11

- Fixed a scrollbar event invalid on the internal elements of the table

# 3.4.10

- Fixed icon style problem with Table Tree
- Fixed invalid `autoHeight` property when table data is empty

# 3.4.9

- Fixed an error that occurred when the tree table word wrap

# 3.4.8

- Fix IE 10 compatibility issues

# 3.4.7

> January 30, 2019

- Fixed a passively triggered onScroll event that caused the scrollbar to be misaligned
- Cache data for Tree

# 3.4.4

- Fix typos

# 3.4.3

> January 23, 2019

- Fix dynamic column not updated

# 3.4.1

> January 17, 2019

- Fix scrollbar position

# 3.4.0

> January 17, 2019

- Support virtualized, effectively render large tabular data #55

# 3.3.2

> January 9, 2019

- The `children` property support function for `<Cell>` in `<Table>`

# 3.3.1

> January 3, 2019

- Support fixed column to the right

# 3.3.0 (deprecate)

> December 29, 2018

- Support fixed column to the right

# 3.2.0

- Support server side rendering
- Refactored the logic of sorting

# 3.1.7

- Feature: Support `rowClassName` on Table
- Feature: Support `defaultSortType` on `<Table>` and let `sortType` be controlled
- Chore: Update element-resize-event

# 3.1.6

- Bugfix: The scroll bar is not reset after the column has changed

# 3.1.5

- Bugfix: Column Widths change affects the scroll bar ([#rsuite-224])

[rsuite-224]: https://github.com/rsuite/rsuite/issues/224

# 3.1.3

- Bugfix: The default value of `sortType` on `<Table>` should be `desc` ([#40])

[40]: https://github.com/rsuite/rsuite-table/pull/40

# 3.1.2

- Bugfix: `flexGrow` is invalid when there is only one column ([#39])

[39]: https://github.com/rsuite/rsuite-table/pull/39

# 3.1.1

- Feature: Support `onResize` on `<Table.Column>` ([#37])
- Bugfix: The scrollbar position is reset when the data is loaded ([#36])

[37]: https://github.com/rsuite/rsuite-table/pull/37
[36]: https://github.com/rsuite/rsuite-table/pull/36

# 3.1.0

- Chore: Migrated to new lifecycle method

# 3.0.7

- Chore: filter the ref value of `null` for `tableRows`([#33])

[32]: https://github.com/rsuite/rsuite-table/pull/33

# 3.0.6

- Chore: Remove dependency for `rsuite-theme` ([#32])

[32]: https://github.com/rsuite/rsuite-table/pull/32

# 3.0.5

> 2018-7-3

- Feature: Support `showHeader` on `<Table>` ([#30])
- Feature: Support `autoHeight` and `minHeight` on `<Table>` ([#29])
- Feature: Support `cellBordered` on `<Table>` ([#28])

[30]: https://github.com/rsuite/rsuite-table/pull/30
[29]: https://github.com/rsuite/rsuite-table/pull/29
[28]: https://github.com/rsuite/rsuite-table/pull/28

# 3.0.4

> 2018-6-26

- Feature: Support `loadAnimation` on `<Table>` ([#27])
- Bugfix: The position was updated incorrectly when the scrollbar was clicked on `<Table>` ([#26])

[27]: https://github.com/rsuite/rsuite-table/pull/27
[26]: https://github.com/rsuite/rsuite-table/pull/26

# 3.0.3

> 2018-6-25

- Chore: Allowed header height can be 0 ([#25])
- Chore: Update style for loading ([#25])
- Bugfix: Set minimum height for table body ([#24])

[25]: https://github.com/rsuite/rsuite-table/pull/25
[24]: https://github.com/rsuite/rsuite-table/pull/24

# 3.0.2

> 2018-6-10

- Support `bodyRef` on `<Table>` ([#23])
- When the height of the content is updated, reset the scroll bar position ([#22])

[23]: https://github.com/rsuite/rsuite-table/pull/23
[22]: https://github.com/rsuite/rsuite-table/pull/22

# 3.0.1

- Update shouldComponentUpdate check

# 2.0.1

- 修复多个 bug
- 修改 renderTreeToggle
- 支持 `bordered` 属性
- 支持 `treeToggle` 和 `treeToggleBy` 属性
- 支持 touch events
- `<Column>` 支持 `colSpan` 属性, 可以合并列单元格
- Scrollbar 支持点击滚动到指定位置
- 更新 `rsuite-theme`, 解决分页按钮禁用样式问题

# 2.0.0

- 升级 React 版本 15.\* ,同时兼容 0.14.9 版本
- 删除 Minxin, 改用高阶组件
- 改进表格许多性能问题
- 添加了对 `loading` 状态的支持
- 添加了 `编辑的表格` 的示例

# 1.1.11

- 自定义滚动条代替系统原生滚动，大幅提高了滚动表格时候的性能

# 1.1.8

- Column 设置默认宽度为 100
- 修复，在 Column 是 null 时候报错
- 修复，在动态列时候 flexGrow 值无效
