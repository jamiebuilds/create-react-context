// @flow
import React from 'react';
import createReactContext from '../../src';

type Theme = 'light' | 'dark';
// Pass a default theme to ensure type correctness
const ThemeContext: Context<Theme> = createReactContext('light');

export class ThemeToggler extends React.Component<
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

export class Title extends React.Component<{ children: Node }> {
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

export class Emoji extends React.Component<{ children: Node }> {
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => (
          <div
            style={{
              fontSize: '35px',
              background: 'white',
              height: '40px',
              width: '40px'
            }}
          >
            {theme === 'light' ? '⚡️' : '🕶'}
          </div>
        )}
      </ThemeContext.Consumer>
    );
  }
}
