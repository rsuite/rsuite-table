import React from 'react';
import { Row, Col, Nav, ButtonToolbar, Button } from 'rsuite';
import CodeView from 'react-code-view';

const CustomCodeView = ({ ...props }) => (
  <Row>
    <Col md={12}>
      <CodeView {...props} />
    </Col>
  </Row>
);

class Examples extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0
    };
  }
  render() {
    const { list, dependencies } = this.props;
    const { index } = this.state;
    return (
      <div>
        <ButtonToolbar size="xs">
          {list.map((item, i) => {
            return (
              <Button
                size="xs"
                shape={index === i ? 'primary' : 'default'}
                key={i}
                onClick={() => {
                  this.setState({ index: i });
                }}
              >
                {item.title}
              </Button>
            );
          })}
        </ButtonToolbar>
        <CustomCodeView key={index} dependencies={dependencies}>
          {list[index].content}
        </CustomCodeView>
      </div>
    );
  }
}

export default Examples;
