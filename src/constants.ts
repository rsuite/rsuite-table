export const LAYER_WIDTH = 30;
export const SCROLLBAR_MIN_WIDTH = 14;
export const SCROLLBAR_WIDTH = 10;
export const CELL_PADDING_HEIGHT = 26;
export const RESIZE_MIN_WIDTH = 20;
export const SORT_TYPE = { DESC: 'desc', ASC: 'asc' };

// transition-duration (ms)
export const TRANSITION_DURATION = 1000;
// transition-timing-function (ease-out)
export const BEZIER = 'cubic-bezier(0, 0, .58, 1)';

// An attribute value added to the data row to identify whether it is expanded, used in Tree.
export const EXPANDED_KEY = Symbol('expanded');

// An attribute value added for the data row, identifying the key of the parent node, used in Tree.
export const PARENT_KEY = Symbol('parent');

// The attribute value added for the data row, which identifies the depth of the node (the number of parent nodes),
// and is used in the Tree.
export const TREE_DEPTH = Symbol('treeDepth');
