import React from 'react';
import { findDOMNode } from 'react-dom';
import { hasClass, addClass, removeClass } from 'dom-lib';

const ClassNameMixin = {

    getDefaultProps() {
        return {
            classPrefix: 'rsuite-table'
        };
    },
    prefix(className) {
        let {classPrefix } = this.props;
        let prefix = classPrefix ? classPrefix + '-' : '';
        return prefix + className;
    }
};

export default ClassNameMixin;
