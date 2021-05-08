import createContext from './utils/createContext';
import translateDOMPositionXY from './utils/translateDOMPositionXY';
import isRTL from './utils/isRTL';

export interface TableContextProps {
  rtl: boolean;
  hasCustomTreeCol: boolean;
  isTree: boolean;
  translateDOMPositionXY: (style: React.CSSProperties, x: number, y: number) => void;
  classPrefix?: string;
}

const TableContext = createContext<TableContextProps>({
  rlt: isRTL(),
  isTree: false,
  hasCustomTreeCol: false,
  translateDOMPositionXY
});

export default TableContext;
