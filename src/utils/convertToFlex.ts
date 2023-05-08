export const verticalAlignMap = {
  top: 'flex-start',
  middle: 'center',
  bottom: 'flex-end'
};

export const textAlignMap = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end'
};

// Convert verticalAlign to alignItems.
export function verticalAlignToAlignItems(verticalAlign) {
  return verticalAlignMap[verticalAlign] || verticalAlign || 'flex-start';
}

// Convert textAlign to justifyContent.
export function textAlignToJustifyContent(textAlign) {
  return textAlignMap[textAlign] || textAlign || 'flex-start';
}
