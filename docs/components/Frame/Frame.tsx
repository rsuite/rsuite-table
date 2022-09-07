import React, { useEffect, useState } from 'react';
import classNames from 'classnames';
import { Container, Sidebar, Sidenav, Content, DOMHelper } from 'rsuite';
import NavToggle from './NavToggle';
import Brand from '../Brand';
import Copyright from '../Copyright';

const { getHeight, on } = DOMHelper;

export interface NavItemData {
  eventKey: string;
  title: string;
  icon?: any;
  to?: string;
  target?: string;
  children?: NavItemData[];
}

export interface FrameProps {
  navs: React.ReactNode;
  children?: React.ReactNode;
}

const Frame = (props: FrameProps) => {
  const { navs, children } = props;
  const [expand, setExpand] = useState(true);
  const [windowHeight, setWindowHeight] = useState(getHeight(window));

  useEffect(() => {
    setWindowHeight(getHeight(window));
    const resizeListenner = on(window, 'resize', () => setWindowHeight(getHeight(window)));

    return () => {
      resizeListenner.off();
    };
  }, []);

  const containerClasses = classNames('page-container', {
    'container-full': !expand
  });

  const navBodyStyle: React.CSSProperties = expand
    ? { height: windowHeight - 112, overflow: 'auto' }
    : {};

  return (
    <Container className="frame">
      <Sidebar
        style={{ display: 'flex', flexDirection: 'column' }}
        width={expand ? 260 : 56}
        collapsible
      >
        <Sidenav.Header>
          <Brand showText={expand} />
        </Sidenav.Header>
        <Sidenav expanded={expand} appearance="subtle" defaultOpenKeys={['1']}>
          <Sidenav.Body style={navBodyStyle}>{navs}</Sidenav.Body>
        </Sidenav>
        <NavToggle expand={expand} onChange={() => setExpand(!expand)} />
      </Sidebar>

      <Container className={containerClasses}>
        <Content>{children}</Content>
        <Copyright />
      </Container>
    </Container>
  );
};

export default Frame;
