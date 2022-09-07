import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import {
  Popover,
  Whisper,
  Toggle,
  Button,
  ButtonGroup,
  Checkbox,
  Stack,
  Divider,
  Input
} from 'rsuite';
import clone from 'lodash/clone';
import isFunction from 'lodash/isFunction';
import get from 'lodash/get';
import without from 'lodash/without';
import App from './App';
import { Table, Column, Cell, HeaderCell, ColumnGroup } from '../src';
import fakeData from './data/users';
import fakeTreeData from './data/treeData';
import fakeBigTreeData from './data/bigTreeData';
import fakeDataForColSpan from './data/usersForColSpan';
import fakeDataForRowSpan from './data/usersForRowSpan';
import fakeLargeData from './data/fakeLargeData.json';
import fakeObjectDataListStore, { createFakeRowObjectData } from './data/fakeObjectDataListStore';
import GearIcon from '@rsuite/icons/Gear';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import 'rsuite/Popover/styles/index.less';
import 'rsuite/Toggle/styles/index.less';
import 'rsuite/Grid/styles/index.less';
import 'rsuite/Button/styles/index.less';
import 'rsuite/ButtonGroup/styles/index.less';
import 'rsuite/Checkbox/styles/index.less';
import 'rsuite/Nav/styles/index.less';
import 'rsuite/Input/styles/index.less';
import 'rsuite/Stack/styles/index.less';
import 'rsuite/Divider/styles/index.less';
import './less/index.less';

const dependencies = {
  Checkbox,
  Button,
  ButtonGroup,
  Popover,
  Whisper,
  Toggle,
  fakeData,
  fakeTreeData,
  fakeBigTreeData,
  fakeLargeData,
  fakeDataForColSpan,
  fakeDataForRowSpan,
  Table,
  Column,
  ColumnGroup,
  Cell,
  HeaderCell,
  clone,
  createFakeRowObjectData,
  fakeObjectDataListStore,
  isFunction,
  get,
  without,
  useDrag,
  useDrop,
  HTML5Backend,
  DndProvider,
  GearIcon,
  Stack,
  Divider,
  Input
};

const examples = [
  {
    title: 'Virtualized',
    content: require('./md/Virtualized.md')
  },
  {
    title: 'Fixed Column',
    content: require('./md/FixedColumnTable.md')
  },
  {
    title: 'Automatic height',
    content: require('./md/AutoHeightTable.md')
  },
  {
    title: 'Fill height',
    content: require('./md/FillHeightTable.md')
  },

  {
    title: 'Affix Header',
    content: require('./md/AffixTable.md')
  },

  {
    title: 'Affix Horizontal Scrollbar',
    content: require('./md/AffixHorizontalScrollbar.md')
  },
  {
    title: 'Fluid',
    content: require('./md/FluidColumnTable.md')
  },
  {
    title: 'Resizable',
    content: require('./md/ResizableColumnTable.md')
  },
  {
    title: 'Word wrap',
    content: require('./md/WordWrapTable.md')
  },
  {
    title: 'Custom Cell',
    content: require('./md/CustomColumnTable.md')
  },
  {
    title: 'Sort',
    content: require('./md/SortTable.md')
  },
  {
    title: 'Tree',
    content: require('./md/TreeTable.md')
  },

  {
    title: 'Big Tree',
    content: require('./md/BigTreeTable.md')
  },

  {
    title: 'Expandable',
    content: require('./md/Expanded.md')
  },
  {
    title: 'Editable',
    content: require('./md/EditTable.md')
  },
  {
    title: 'Loading',
    content: require('./md/LoadingTable.md')
  },
  {
    title: 'Colspan Cell',
    content: require('./md/ColspanTable.md')
  },
  {
    title: 'Rowspan Cell',
    content: require('./md/RowspanTable.md')
  },
  {
    title: 'Column Group',
    content: require('./md/ColumnGroupTable.md')
  },
  {
    title: 'Custom Columns',
    content: require('./md/CustomColumns.md')
  },

  {
    title: 'Hidden header',
    content: require('./md/HideTableHeader.md')
  },
  {
    title: 'Empty',
    content: require('./md/EmptyDataTable.md')
  },
  {
    title: 'Dynamic',
    content: require('./md/DynamicTable.md')
  },
  {
    title: 'Infinite Loader',
    content: require('./md/InfiniteLoader.md')
  },

  {
    title: 'Draggable Example',
    content: require('./md/DraggableTable.md')
  },
  {
    title: 'Update Data',
    content: require('./md/UpdateData.md')
  }
];

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLDivElement);

root.render(
  <StrictMode>
    <App dependencies={dependencies} examples={examples} />
  </StrictMode>
);
