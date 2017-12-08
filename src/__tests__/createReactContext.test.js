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
    return (
      // Pass the current context value to the Provider's `value` prop.
      // Changes are detected using strict comparison (Object.is)
      <ThemeContext.Provider value={this.state.theme}>
        <button
          onClick={() => {
            this.setState(state => ({
              theme: state.theme === 'light' ? 'dark' : 'light'
            }));
          }}>
          Toggle theme
        </button>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

class Title extends React.Component<{ children: Node }> {
  render() {
    return (
      // The Consumer uses a render prop API. Avoids conflicts in the
      // props namespace.
      <ThemeContext.Consumer>
        {theme => (
          <h1 style={{ color: theme === 'light' ? '#000' : '#fff' }}>
            {this.props.children}
          </h1>
        )}
      </ThemeContext.Consumer>
    );
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

  expect(wrapper).toMatchSnapshot();
  wrapper.find('button').simulate('click');
  expect(wrapper).toMatchSnapshot();
});
