import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';

configure({ adapter: new Adapter() });

const testsContext = require.context('.', true, /Spec.js$/);
testsContext.keys().forEach(testsContext);
