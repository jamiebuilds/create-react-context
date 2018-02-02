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

export type ConsumerState<T> = {
  value: T
};

export type Provider<T> = Component<ProviderProps<T>>;
export type Consumer<T> = Component<ConsumerProps<T>, ConsumerState<T>>;

export type Context<T> = {
  Provider: Class<Provider<T>>,
  Consumer: Class<Consumer<T>>
};

function createEventEmitter(value) {
  let handlers = [];
  return {
    on(handler) {
      handlers.push(handler);
    },

    off(handler) {
      handlers = handlers.filter(h => h !== handler);
    },

    get() {
      return value;
    },

    set(newValue) {
      value = newValue;
      handlers.forEach(handler => handler(value));
    }
  };
}

function onlyChild(children) {
  return children[0] || children;
}

let uniqueId = 0;

function createReactContext<T>(defaultValue: T): Context<T> {
  const contextProp = '__create-react-context-' + uniqueId++ + '__';

  class Provider extends Component<ProviderProps<T>> {
    emitter = createEventEmitter(this.props.value);

    static childContextTypes = {
      [contextProp]: PropTypes.object.isRequired
    };

    getChildContext() {
      return {
        [contextProp]: this.emitter
      };
    }

    componentWillReceiveProps(nextProps) {
      if (this.props.value !== nextProps.value) {
        this.emitter.set(nextProps.value);
      }
    }

    render() {
      return onlyChild(this.props.children);
    }
  }

  class Consumer extends Component<ConsumerProps<T>, ConsumerState<T>> {
    static contextTypes = {
      [contextProp]: PropTypes.object
    };

    state: ConsumerState<T> = {
      value: this.getValue()
    };

    componentDidMount() {
      if (this.context[contextProp]) {
        this.context[contextProp].on(this.onUpdate);
      }
    }

    componentWillUnmount() {
      if (this.context[contextProp]) {
        this.context[contextProp].off(this.onUpdate);
      }
    }

    getValue(): T {
      if (this.context[contextProp]) {
        return this.context[contextProp].get();
      } else {
        return defaultValue;
      }
    }

    onUpdate = () => {
      this.setState({
        value: this.getValue()
      });
    };

    render() {
      return onlyChild(this.props.children)(this.state.value);
    }
  }

  return {
    Provider,
    Consumer
  };
}

export default createReactContext;
