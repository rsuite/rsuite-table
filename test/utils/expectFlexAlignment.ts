export default function expectFlexAlignment(
  element: Element | null,
  property: 'justify-content' | 'align-items',
  direction: 'start' | 'end'
) {
  if (!element) {
    throw new Error('Expected an element to check ' + property);
  }

  const value = getComputedStyle(element).getPropertyValue(property);

  // Chrome 158 serializes the flex-* keywords using their flow-* aliases.
  expect(value, property).to.be.oneOf([`flex-${direction}`, `flow-${direction}`]);
}
