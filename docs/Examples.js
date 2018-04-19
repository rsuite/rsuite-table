import React from 'react';
import { Row, Col } from 'rsuite';
import CodeView from 'react-code-view';

const CustomCodeView = ({ ...props }) => (
  <Row>
    <Col md={12}>
      <CodeView {...props} />
    </Col>
  </Row>
);

const Examples = ({ list, dependencies }) => {
  return (
    <div>
      {list.map((item, index) => (
        <CustomCodeView key={index} dependencies={dependencies}>
          {item}
        </CustomCodeView>
      ))}
    </div>
  );
};

export default Examples;
