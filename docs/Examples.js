import React from 'react';
import { Row, Col, Nav } from 'rsuite';
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
    console.log(index);

    return (
      <div>
        <Nav tabs>
          {list.map((item, i) => {
            return (
              <Nav.Item
                eventKey={i}
                active={index === i}
                key={i}
                onClick={() => {
                  this.setState({ index: i });
                }}
              >
                {item.title}
              </Nav.Item>
            );
          })}
        </Nav>
        <CustomCodeView key={index} dependencies={dependencies}>
          {list[index].content}
        </CustomCodeView>
      </div>
    );
  }
}

export default Examples;
