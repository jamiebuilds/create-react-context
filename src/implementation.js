// @flow
import React, { Component, type Node } from 'react';
import PropTypes from 'prop-types';
import gud from 'gud';
import warning from 'fbjs/lib/warning';
import Fragment from 'react-dot-fragment';

const MAX_SIGNED_31_BIT_INT = 1073741823;

// Inlined Object.is polyfill.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
function objectIs(x, y) {
  if (x === y) {
    return x !== 0 || 1 / x === 1 / (y: any);
  } else {
    return x !== x && y !== y;
  }
}

type RenderFn<T> = (value: T) => Node;

export type ProviderProps<T> = {
  value: T,
  children?: Node
};

export type ConsumerProps<T> = {
  children: RenderFn<T> | [RenderFn<T>],
  observedBits?: number
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

    set(newValue, changedBits) {
      value = newValue;
      handlers.forEach(handler => handler(value, changedBits));
    }
  };
}

function onlyChild(children): any {
  return Array.isArray(children) ? children[0] : children;
}

function createReactContext<T>(
  defaultValue: T,
  calculateChangedBits: ?(a: T, b: T) => number
): Context<T> {
  const contextProp = '__create-react-context-' + gud() + '__';

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
        let oldValue = this.props.value;
        let newValue = nextProps.value;
        let changedBits: number;

        if (objectIs(oldValue, newValue)) {
          changedBits = 0; // No change
        } else {
          changedBits =
            typeof calculateChangedBits === 'function'
              ? calculateChangedBits(oldValue, newValue)
              : MAX_SIGNED_31_BIT_INT;
          if (process.env.NODE_ENV !== 'production') {
            warning(
              (changedBits & MAX_SIGNED_31_BIT_INT) === changedBits,
              'calculateChangedBits: Expected the return value to be a ' +
                '31-bit integer. Instead received: %s',
              changedBits
            );
          }

          changedBits |= 0;

          if (changedBits !== 0) {
            this.emitter.set(nextProps.value, changedBits);
          }
        }
      }
    }

    render() {
      return <Fragment>{this.props.children}</Fragment>;
    }
  }

  class Consumer extends Component<ConsumerProps<T>, ConsumerState<T>> {
    static contextTypes = {
      [contextProp]: PropTypes.object
    };

    observedBits: number;

    state: ConsumerState<T> = {
      value: this.getValue()
    };

    componentWillReceiveProps(nextProps) {
      let { observedBits } = nextProps;
      this.observedBits =
        observedBits === undefined || observedBits === null
          ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
          : observedBits;
    }

    componentDidMount() {
      if (this.context[contextProp]) {
        this.context[contextProp].on(this.onUpdate);
      }
      let { observedBits } = this.props;
      this.observedBits =
        observedBits === undefined || observedBits === null
          ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
          : observedBits;
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

    onUpdate = (newValue, changedBits: number) => {
      const observedBits: number = this.observedBits | 0;
      if ((observedBits & changedBits) !== 0) {
        this.setState({ value: this.getValue() });
      }
    };

    render() {
      return (
        <Fragment>{onlyChild(this.props.children)(this.state.value)}</Fragment>
      );
    }
  }

  return {
    Provider,
    Consumer
  };
}

export default React.createContext || createReactContext;
