import React, {PropTypes} from 'react';
import classNames from 'classnames';
import ClassNameMixin from './mixins/ClassNameMixin';
import ReactComponentWithPureRenderMixin from './mixins/ReactComponentWithPureRenderMixin';
import DOMMouseMoveTracker from './utils/DOMMouseMoveTracker';

function clamp(value, min, max) {
    if (value < min) {
        return min;
    }
    if (value > max) {
        return max;
    }
    return value;
}

const ColumnResizeHandle = React.createClass({
    mixins: [
        ClassNameMixin,
        ReactComponentWithPureRenderMixin
    ],
    propTypes: {
        columnWidth: PropTypes.number,
        columnLeft: PropTypes.number,
        onColumnResize: PropTypes.func,
        onColumnResizeEnd: PropTypes.func,
        onColumnResizeMove: PropTypes.func,
    },
    getInitialState() {
        return {
            columnWidth: this.props.columnWidth,
            cursorDelta: 0,
            visible: false
        };
    },
    _onMove(deltaX, deltaY) {

        if (!this.isKeyDown) {
            return;
        }

        var newWidth = this.state.cursorDelta + deltaX;
        var newColumnWidth = clamp(this.props.columnWidth + newWidth, 20);

        this.setState({
            columnWidth: newColumnWidth,
            cursorDelta: newWidth
        });

        this.props.onColumnResizeMove(newColumnWidth, this.props.columnLeft);
    },

    _onColumnResizeEnd() {

        this.isKeyDown = false;

        this.props.onColumnResizeEnd(
            this.state.columnWidth,
            this.state.cursorDelta
        );

        if (this._mouseMoveTracker) {
            this._mouseMoveTracker.releaseMouseMoves();
            this._mouseMoveTracker = null;
        }

        this.setState({
            visible: false
        });
    },
    _getMouseMoveTracker() {
        return this._mouseMoveTracker || new DOMMouseMoveTracker(
            this._onMove,
            this._onColumnResizeEnd,
            document.body
        );
    },
    _onColumnResizeMouseDown(event) {

        this._mouseMoveTracker = this._getMouseMoveTracker();
        this.isKeyDown = true;
        this.setState({
            visible: true,
            cursorDelta: 0
        });

        this.props.onColumnResize(
            this.props.columnWidth,
            this.props.columnLeft, {
                clientX: event.clientX,
                clientY: event.clientY,
                preventDefault: function () { }
            }
        );


    },
    componentWillReceiveProps(newProps) {
        if (this.isKeyDown && newProps.initialEvent && !this._mouseMoveTracker.isDragging()) {
            this._mouseMoveTracker.captureMouseMoves(newProps.initialEvent);
        }
    },
    componentWillUnmount() {
        this._mouseMoveTracker.releaseMouseMoves();
        this._mouseMoveTracker = null;
    },
    render() {


        let {columnLeft} = this.props;
        let {columnWidth, visible} = this.state;

        let styles = {
            width: 6,
            left: columnWidth + columnLeft - 2
        };

        let classes = classNames({ visible }, this.prefix('column-resize-spanner'));

        return (
            <div
                className={classes}
                style={styles}
                onMouseDown={this._onColumnResizeMouseDown}
                onMouseUp={this._onColumnResizeMouseUp}
                ref="spanner"
                >
            </div>
        );
    }
});

export default ColumnResizeHandle;
