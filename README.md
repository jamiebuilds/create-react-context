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
// Context.provide(providedValue, children)
// ...
// Context.consume(value => children)
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
    // Pass the current context value as the Provider's `value`.
    // Changes are detected using strict comparison (Object.is)
    return ThemeContext.provide(this.state.theme,
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
      )
    );
  }
}

class Title extends React.Component<{ children: Node }> {
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
```
