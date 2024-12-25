import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import GearIcon from '@rsuite/icons/Gear';
import ArrowDownIcon from '@rsuite/icons/ArrowDown';
import ArrowUpIcon from '@rsuite/icons/ArrowUp';
import SortIcon from '@rsuite/icons/Sort';
import fakeDataForColSpan from './data/usersForColSpan';
import fakeDataForRowSpan from './data/usersForRowSpan';
import App from './App';
import {
  Popover,
  Whisper,
  Toggle,
  Button,
  ButtonGroup,
  Checkbox,
  Stack,
  Divider,
  Input,
  Loader,
  Placeholder,
  Tabs,
  VStack,
  HStack
} from 'rsuite';
import { clone, isFunction, get, without } from 'lodash-es';
import { Table, Column, Cell, HeaderCell, ColumnGroup } from '../src';
import { createUser, mockUsers, mockTreeData } from './data/mock';
import { useDrag, useDrop, DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { faker } from '@faker-js/faker';

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
import 'rsuite/Tabs/styles/index.less';
import './less/index.less';

const dependencies = {
  Checkbox,
  Button,
  ButtonGroup,
  Popover,
  Whisper,
  Toggle,
  fakeDataForColSpan,
  fakeDataForRowSpan,
  Table,
  Column,
  ColumnGroup,
  Cell,
  HeaderCell,
  clone,
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
  Input,
  Loader,
  faker,
  createUser,
  mockUsers,
  mockTreeData,
  ArrowDownIcon,
  ArrowUpIcon,
  SortIcon,
  Placeholder,
  Tabs,
  VStack,
  HStack
};

const examples = [
  {
    title: 'Virtualized',
    content: require('./examples/Virtualized.md')
  },
  {
    title: 'Fixed Column',
    content: require('./examples/FixedColumnTable.md')
  },
  {
    title: 'Automatic height',
    content: require('./examples/AutoHeightTable.md')
  },
  {
    title: 'Fill height',
    content: require('./examples/FillHeightTable.md')
  },

  {
    title: 'Affix Header',
    content: require('./examples/AffixTable.md')
  },

  {
    title: 'Affix Horizontal Scrollbar',
    content: require('./examples/AffixHorizontalScrollbar.md')
  },
  {
    title: 'Fluid',
    content: require('./examples/FluidColumnTable.md')
  },
  {
    title: 'Resizable',
    content: require('./examples/ResizableColumnTable.md')
  },
  {
    title: 'Word wrap',
    content: require('./examples/WordWrapTable.md')
  },
  {
    title: 'Custom Cell',
    content: require('./examples/CustomCellTable.md')
  },
  {
    title: 'Custom Column',
    content: require('./examples/CustomColumnTable.md')
  },
  {
    title: 'Sort',
    content: require('./examples/SortTable.md')
  },
  {
    title: 'Tree',
    content: require('./examples/TreeTable.md')
  },

  {
    title: 'Big Tree',
    content: require('./examples/BigTreeTable.md')
  },

  {
    title: 'Expandable',
    content: require('./examples/Expanded.md')
  },
  {
    title: 'Editable',
    content: require('./examples/EditTable.md')
  },
  {
    title: 'Loading',
    content: require('./examples/LoadingTable.md')
  },
  {
    title: 'Colspan Cell',
    content: require('./examples/ColspanTable.md')
  },
  {
    title: 'Rowspan Cell',
    content: require('./examples/RowspanTable.md')
  },
  {
    title: 'Column Group',
    content: require('./examples/ColumnGroupTable.md')
  },
  {
    title: 'Custom Columns',
    content: require('./examples/CustomColumns.md')
  },

  {
    title: 'Hidden header',
    content: require('./examples/HideTableHeader.md')
  },
  {
    title: 'Empty',
    content: require('./examples/EmptyDataTable.md')
  },
  {
    title: 'Dynamic',
    content: require('./examples/DynamicTable.md')
  },
  {
    title: 'Infinite Loader',
    content: require('./examples/InfiniteLoader.md')
  },

  {
    title: 'Draggable Example',
    content: require('./examples/DraggableTable.md')
  },
  {
    title: 'Update Data',
    content: require('./examples/UpdateData.md')
  },
  {
    title: 'Show full text',
    content: require('./examples/fullText.md')
  }
];

const root = ReactDOM.createRoot(document.getElementById('app') as HTMLDivElement);

root.render(
  <StrictMode>
    <App dependencies={dependencies} examples={examples} />
  </StrictMode>
);
