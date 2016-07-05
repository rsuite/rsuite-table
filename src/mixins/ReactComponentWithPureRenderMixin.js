import shallowEqual from '../utils/shallowEqual';

const ReactComponentWithPureRenderMixin = {
    shouldComponentUpdate: function (nextProps, nextState) {
        return !shallowEqual(this.props, nextProps) ||
            !shallowEqual(this.state, nextState);
    }
};

export default ReactComponentWithPureRenderMixin;
