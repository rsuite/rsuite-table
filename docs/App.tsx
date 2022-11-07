import React from 'react';
import { Nav } from 'rsuite';
import CodeView from 'react-code-view';
import Frame from './components/Frame';
import TableIcon from '@rsuite/icons/Table';
import GithubIcon from '@rsuite/icons/legacy/Github';
import BookIcon from '@rsuite/icons/legacy/Book';
import kebabCase from 'lodash/kebabCase';

interface ExampleType {
  title: string;
  content: React.ReactNode;
}

interface ExamplesProps {
  dependencies?: any;
  examples: ExampleType[];
}

const getDefaultIndex = () => {
  const hash = document.location.hash.replace('#', '');
  return hash || 'virtualized';
};

const afterCompile = (code: string) => {
  return code.replace(/import\ [\*\w\,\{\}\ \n]+\ from\ ?[\."'@/\w-]+;/gi, '');
};

const App = (props: ExamplesProps) => {
  const { examples, dependencies } = props;
  const [index, setIndex] = React.useState(getDefaultIndex());

  const content = examples.find(item => kebabCase(item.title) === index)?.content;

  return (
    <Frame
      navs={
        <Nav vertical>
          <Nav.Menu
            placement="rightStart"
            trigger="hover"
            title="Examples"
            eventKey="1"
            icon={<TableIcon />}
          >
            {examples.map((item, i) => {
              const navKey = kebabCase(item.title);

              return (
                <Nav.Item
                  key={i}
                  href={`#${navKey}`}
                  active={navKey === index}
                  onClick={() => {
                    setIndex(navKey);
                  }}
                >
                  {item.title}
                </Nav.Item>
              );
            })}
          </Nav.Menu>
          <Nav.Item
            eventKey="apis"
            target="_blank"
            icon={<BookIcon />}
            href="https://github.com/rsuite/rsuite-table#api"
          >
            APIs
          </Nav.Item>
          <Nav.Item
            eventKey="components"
            target="_blank"
            icon={<GithubIcon />}
            href="https://github.com/rsuite/rsuite-table"
          >
            Github
          </Nav.Item>
        </Nav>
      }
    >
      <CodeView key={index} dependencies={dependencies} afterCompile={afterCompile}>
        {content}
      </CodeView>
    </Frame>
  );
};

export default App;
