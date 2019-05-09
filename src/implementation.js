// @flow
import React, { Component, type Node } from 'react';
import warning from 'warning';

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
      console.log(value);
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
  let __createReactContextZgo321__ = [];

  class Provider extends Component<ProviderProps<T>> {
    constructor(props){
      super(props);
      __createReactContextZgo321__[__createReactContextZgo321__.length++] = createEventEmitter(this.props.value);
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
            __createReactContextZgo321__[__createReactContextZgo321__.length-2].set(nextProps.value, changedBits);
          }
        }
      }
    }

    render() {
      return this.props.children;
    }
  }

  class Consumer extends Component<ConsumerProps<T>, ConsumerState<T>> {
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
      if (__createReactContextZgo321__.length>0) {
        __createReactContextZgo321__[__createReactContextZgo321__.length-1].on(this.onUpdate);
      }
      let { observedBits } = this.props;
      this.observedBits =
        observedBits === undefined || observedBits === null
          ? MAX_SIGNED_31_BIT_INT // Subscribe to all changes by default
          : observedBits;
    }

    componentWillUnmount() {
      if (__createReactContextZgo321__.length>0) {
        __createReactContextZgo321__[__createReactContextZgo321__.length-1].off(this.onUpdate);
      }
    }

    getValue(): T {
      if (__createReactContextZgo321__.length>0) {
        return __createReactContextZgo321__[__createReactContextZgo321__.length-1].get();
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
      return onlyChild(this.props.children)(this.state.value);
    }
  }

  return {
    Provider,
    Consumer
  };
}

export default createReactContext;
