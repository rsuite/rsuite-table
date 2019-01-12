import _ from 'lodash';

// @flow
function flattenData(data: any[]) {
  const flattenItems = [];
  let _depth = -1;

  function loop(data, _parent) {
    if (!_.isArray(data)) {
      return;
    }

    _depth++;

    data.forEach(item => {
      flattenItems.push({
        ...item,
        _depth,
        _parent
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
