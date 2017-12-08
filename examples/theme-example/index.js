//@flow
import React from 'react';
import { render } from 'react-dom';
import { ThemeToggler, Title, Emoji } from './theme-context';

const App = () => (
  <ThemeToggler>
    <Title>Really cool context</Title>
    <Emoji />
  </ThemeToggler>
);

render(<App />, document.getElementById('container'));
