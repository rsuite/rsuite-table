import { EffectCallback, useEffect } from 'react';

const useMount = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, []);
};

export default useMount;
