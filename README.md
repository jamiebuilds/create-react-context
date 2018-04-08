# create-react-context

> Polyfill for the [proposed React context API](https://github.com/reactjs/rfcs/pull/2)

## Install

```sh
yarn add create-react-context
```

You'll need to also have `react` and `prop-types` installed.

## API

```js
const Context = createReactContext(defaultValue);
// <Context.Provider value={providedValue}>{children}</Context.Provider>
// ...
// <Context.Consumer>{value => children}</Context.Consumer>
```

## Example

```js
// @flow
import React, { type Node } from 'react';
import createReactContext, { type Context } from 'create-react-context';

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
```

## Usage with React 15 and below

`Provider` just returns its children in its `render` method, and `Consumer` returns the result of child function call. This means that whatever value you give as `Provider` children, or return from `Consumer` child function, it should be a valid `render` return type for your current React version. For React 15, it includes React element, boolean, and null, but doesn't include fragments (arrays), strings, or numbers.


```js
// Works in React 15 and below

<Context.Provider><span>foo</span></Context.Provider>

<Context.Provider>
  <div>
    <div/>
    <div/>
  </div>
</Context.Provider>

<Context.Consumer>{value => <span>{Number(value)}</span>}</Context.Consumer>

<Context.Consumer>
  {value => (
    <div>
      <div/>
      <div/>
    </div>
  )}
</Context.Consumer>
```

```js
// Doesn't work in React 15 and below

<Context.Provider>foo</Context.Provider>

<Context.Provider>
  <div/>
  <div/>
</Context.Provider>

<Context.Consumer>{value => Number(value)}</Context.Consumer>

<Context.Consumer>
  {value => [
    <div/>,
    <div/>
  ]}
</Context.Consumer>
```

