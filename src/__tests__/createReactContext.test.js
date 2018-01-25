// @flow
import 'raf/polyfill';
import createReactContext, { type Context } from '../';
import React, { type Node } from 'react';
import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

type Theme = 'light' | 'dark';
// Pass a default theme to ensure type correctness
const ThemeContext: Context<Theme> = createReactContext('light');

class ThemeToggler extends React.Component<
  { children: Node },
  { theme: Theme }
> {
  state = { theme: 'light' };
  render() {
    // Pass the current context value as the Provider's `value`.
    // Changes are detected using strict comparison (Object.is)
    return ThemeContext.provide(
      this.state.theme,
      <React.Fragment>
        <button
          onClick={() => {
            this.setState(state => ({
              theme: state.theme === 'light' ? 'dark' : 'light'
            }));
          }}
        >
          Toggle theme
        </button>
        {this.props.children}
      </React.Fragment>
    );
  }
}

class Title extends React.Component<{ children: Node }> {
  shouldComponentUpdate() {
    return false;
  }

  render() {
    // The Consumer uses a render prop API. Avoids conflicts in the
    // props namespace.
    return ThemeContext.consume(theme => (
      <h1 style={{ color: theme === 'light' ? '#000' : '#fff' }}>
        {this.props.children}
      </h1>
    ));
  }
}

test('without provider', () => {
  const wrapper = mount(<Title>Hello World</Title>);
  expect(wrapper).toMatchSnapshot();
});

test('with provider', () => {
  const wrapper = mount(
    <ThemeToggler>
      <Title>Hello World</Title>
    </ThemeToggler>
  );

  expect(wrapper).toMatchSnapshot('with provider - init');
  wrapper.find('button').simulate('click');
  expect(wrapper).toMatchSnapshot('with provider - after click');
});
