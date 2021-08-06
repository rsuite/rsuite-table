import { useEffect, useLayoutEffect } from 'react';
import { canUseDOM } from 'dom-lib';

const useIsomorphicLayoutEffect = canUseDOM ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
