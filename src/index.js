// @flow
import React, { Component, type Node } from 'react';
import PropTypes from 'prop-types';

export type ProviderProps<T> = {
  value: T,
  children?: Node
};

export type ConsumerProps<T> = {
  children: (value: T) => Node
};

export type Provider<T> = Component<ProviderProps<T>>;
export type Consumer<T> = Component<ConsumerProps<T>>;

export type Context<T> = {
  Provider: Class<Provider<T>>,
  Consumer: Class<Consumer<T>>
};

let uniqueId = 0;

function createReactContext<T>(defaultValue: T): Context<T> {
  const contextProp = '__create-react-context-' + uniqueId++ + '__';

  class Provider extends Component<ProviderProps<T>> {
    static childContextTypes = {
      [contextProp]: PropTypes.any.isRequired
    };

    getChildContext() {
      return {
        [contextProp]: this.props.value
      };
    }

    render() {
      return this.props.children;
    }
  }

  class Consumer extends Component<ConsumerProps<T>> {
    static contextTypes = {
      [contextProp]: PropTypes.any
    };

    render() {
      let value;

      if (this.context.hasOwnProperty(contextProp)) {
        value = this.context[contextProp];
      } else {
        value = defaultValue;
      }

      return this.props.children(value);
    }
  }

  return {
    Provider,
    Consumer
  };
}

export default createReactContext;
