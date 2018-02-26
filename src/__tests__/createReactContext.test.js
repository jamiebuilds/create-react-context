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
          }}
        >
          Toggle theme
        </button>
        {this.props.children}
      </ThemeContext.Provider>
    );
  }
}

class Title extends React.Component<{ children: Node }> {
  shouldComponentUpdate() {
    return false;
  }

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

  expect(wrapper).toMatchSnapshot('with provider - init');
  wrapper.find('button').simulate('click');
  expect(wrapper).toMatchSnapshot('with provider - after click');
});

test('can skip consumers with bitmask', () => {
  let renders = { Foo: 0, Bar: 0 }

  const Context = createReactContext({foo: 0, bar: 0}, (a, b) => {
    let result = 0;
    if (a.foo !== b.foo) {
      result |= 0b01;
    }
    if (a.bar !== b.bar) {
      result |= 0b10;
    }
    return result;
  });

  function Provider(props) {
    return (
      <Context.Provider value={{foo: props.foo, bar: props.bar}}>
        {props.children}
      </Context.Provider>
    );
  }

  function Foo() {
    return (
      <Context.Consumer observedBits={0b01}>
        {value => {
          renders.Foo += 1
          return <span prop={'Foo: ' + value.foo} />;
        }}
      </Context.Consumer>
    );
  }

  function Bar() {
    return (
      <Context.Consumer observedBits={0b10}>
        {value => {
          renders.Bar += 1
          return <span prop={'Bar: ' + value.bar} />;
        }}
      </Context.Consumer>
    );
  }

  class Indirection extends React.Component<*> {
    shouldComponentUpdate() {
      return false;
    }
    render() {
      return this.props.children;
    }
  }

  function App(props) {
    return (
      <Provider foo={props.foo} bar={props.bar}>
        <Indirection>
          <Indirection>
            <Foo />
          </Indirection>
          <Indirection>
            <Bar />
          </Indirection>
        </Indirection>
      </Provider>
    );
  }

  const wrapper = mount(<App foo={1} bar={1} />);
  expect(renders.Foo).toBe(1)
  expect(renders.Bar).toBe(1)
  expect(wrapper.contains(
    <span prop='Foo: 1' />,
    <span prop='Bar: 1' />,
  )).toBe(true)

  // Update only foo
  wrapper.setProps({ foo: 2, bar: 1 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(1)
  expect(wrapper.contains(
    <span prop='Foo: 2' />,
    <span prop='Bar: 1' />,
  )).toBe(true)

  // Update only bar
  wrapper.setProps({ bar: 2, foo: 2 })
  expect(renders.Foo).toBe(2)
  expect(renders.Bar).toBe(2)
  expect(wrapper.contains(
    <span prop='Foo: 2' />,
    <span prop='Bar: 2' />,
  )).toBe(true)

  // Update both
  wrapper.setProps({ bar: 3, foo: 3 })
  expect(renders.Foo).toBe(3)
  expect(renders.Bar).toBe(3)
  expect(wrapper.contains(
    <span prop='Foo: 3' />,
    <span prop='Bar: 3' />,
  ))
});

test('warns if calculateChangedBits returns larger than a 31-bit integer', () => {
  jest.spyOn(global.console, 'error')

  const Context = createReactContext(
    0,
    (a, b) => Math.pow(2, 32) - 1, // Return 32 bit int
  );

  const wrapper = mount(
    <Context.Provider value={1}>
      <Context.Consumer>{
        value => value
      }</Context.Consumer>
    </Context.Provider>
  );

  // Update
  wrapper.setProps({ value: 2 });

  wrapper.unmount();

  if (process.env.NODE_ENV !== 'production') {
    expect(console.error).toHaveBeenCalledTimes(1)
    expect(console.error).lastCalledWith('Warning: calculateChangedBits: Expected the return value to be a 31-bit integer. Instead received: 4294967295')
  }
});
