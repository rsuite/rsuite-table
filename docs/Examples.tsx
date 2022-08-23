import React from 'react';
import { Row, Col, Nav } from 'rsuite';
import CodeView from 'react-code-view';

interface ItemType {
  title: React.ReactNode;
  content: React.ReactNode;
}

interface ExamplesProps {
  dependencies?: any;
  list: ItemType[];
}

const getDefaultIndex = () => {
  const hash = document.location.hash.replace('#', '');
  return hash ? parseInt(hash) : 0;
};

const Examples = (props: ExamplesProps) => {
  const { list, dependencies } = props;
  const [index, setIndex] = React.useState(getDefaultIndex());

  return (
    <div>
      <Row>
        <Col md={4}>
          <Nav vertical>
            {list.map((item, i) => {
              return (
                <Nav.Item
                  key={i}
                  href={`#${i}`}
                  active={i === index}
                  onClick={() => {
                    setIndex(i);
                  }}
                >
                  {item.title}
                </Nav.Item>
              );
            })}
          </Nav>
        </Col>
        <Col md={20}>
          <CodeView key={index} dependencies={dependencies}>
            {list[index]?.content}
          </CodeView>
        </Col>
      </Row>
    </div>
  );
};

export default Examples;
