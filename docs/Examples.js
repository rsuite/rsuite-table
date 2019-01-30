import React from 'react';
import { Row, Col, Nav } from 'rsuite';
import CodeView from 'react-code-view';

const CustomCodeView = ({ ...props }) => (
  <Col md={10}>
    <CodeView {...props} />
  </Col>
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
        <Row>
          <Col md={2}>
            <Nav>
              {list.map((item, i) => {
                return (
                  <Nav.Item
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
          </Col>
          <CustomCodeView key={index} dependencies={dependencies}>
            {list[index].content}
          </CustomCodeView>
        </Row>
      </div>
    );
  }
}

export default Examples;
