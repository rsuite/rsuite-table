import _ from 'lodash';

// @flow
function flattenData(data: any[]) {
  const flattenItems = [];

  function loop(data, _parent) {
    if (!_.isArray(data)) {
      return;
    }

    data.forEach(item => {
      item._parent = _parent;
      flattenItems.push({
        ...item
      });
      if (item.children) {
        loop(item.children, item);
      }
    });
  }

  loop(data, null);
  return flattenItems;
}

export default flattenData;
