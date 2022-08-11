## What is the difference between Component and PureComponent? give an example where it might break my app.

Basically, PureComponents should be stateless. They are only dependent on passed properties. This allows for many optimizations,
for example to call render only if props actually change - if they are not, component should not be rerendered.

In Function components this could be achieved with `React.memo`. That would memoize component by props.

*Problem* - `setTimeout` won't trigger the change (with normal `Component` trigger works):

```typescript jsx
class Asd extends React.PureComponent<{},any> {
    constructor(props: any) {
        super(props);
        this.state = {
            values: {
                a: 3,
                b: 2,
            },
        }
    }

    componentDidMount() {
        setTimeout(() => {
            console.log("CHANGING THE STATE");
            const state = {...this.state};
            state.values.b = 6;
            this.setState(state);
        }, 3000)
    }

    render() {
        return <div>{this.state.values.a} - {this.state.values.b}</div>
    }
}
```
## Context + ShouldComponentUpdate might be dangerous. Can think of why is that?

ShouldComponentUpdate will check if state or props are modified, that might block rerender of its children. But to be honest I haven't used class components contexts. I'm used to ContextApi and function components.



## Describe 3 ways to pass information from a component to its PARENT.
   1. Callback passed by the parent
   2. ContextAPI
   3. Redux or similar (mobx etc.)
   4. Observables - this is rather hacky

## Give 2 ways to prevent components from re-rendering.
   1. Using PureComponents ex. `React.memo`
   2. Move state of context to separate Component and pass it also children ex.
```typescript jsx
const MyContext = React.createContext()

const MyApp = () => {
    const [value, setValue] = useState();
...
    return <MyContext.Provider value={value}>
        <MyComponent/>
    </MyContext.Provider>
}

// VS

const MyContextProvider = ({children}: Props) => {
    const [value, setValue] = useState();
...
    return <MyContext.Provider value={value}>
        {children}
    </MyContext.Provider>
}

const MyApp = () => {
...
    return <MyContextProvider>
        <MyComponent/>
    </MyContextProvider>
}

```
3. Make changes to HTMLElements with a reference (`useRef`) ex. add a css class instead of depending on `useState` to change `className`

## What is a fragment and why do we need it? Give an example where it might break my app.

Every component has to return a single node. Fragments (`<></>`) are used to describe 
some components/nodes that we would like to put on the same level of dom-tree as the parent for unnecessary nesting.

Problems I can see:
- Problem with layout not prepared for more elements 
- you cannot pass `key` attribute, need to use `React.Fragment`

## Give 3 examples of the HOC pattern.
   1. `React.memo`
   2. `compose` from Redux
   3. Custom made ex. `withRouting`

## What's the difference in handling exceptions in promises, callbacks and async...await.

`async` functions always return a promise, and `await` keyword is used to "unpack" a promise.
Async/Await approach enables Imperative programing within asynchronous context. 
One of the difference might be on exception handling ("try-catch" vs `Promise.catch`). It also worth to pay attention to running multiple async calls, because in naive approach, async await will wait on every `await` instead of triggering all independent calls, ex.

```typescript

const result1 = await asyncCall1() // will wait for result1 to complete before call async2
const result2 = await asyncCall2()

// VS

const promise1 = asyncCall1()
const promise2 = asyncCall2()

const [result1, result2] = Promise.all(promise2,promise2)

```

## How many arguments does setState take and why is it async.

A single argument which can be either a value to be set, or a function that based on a current value, returns computed one.
It is async, because we are dispatching an action to react mechanism. Setting state doesn't trigger rerender immediately.

## List the steps needed to migrate a Class to Function Component.

1. Change component lifecycle methods to `useEffect`
2. Split `this.state` to smaller chunks and implement them using `useState`
3. If something depends on a class field with "the newest value", implement using `useRef`
4. [Redux] Change MapDispatchToProps and MapSelectorsToProps with related hooks
5. If something is initialized with a constructor, try to optimise with `useMemo`
6. Try to move methods to useCallback for optimization
7. Change render function to return

## List a few ways styles can be used with components.

1. `import ./App.css`
2. inline - `style={{}}`
3. CSS-in-JS - styled-components, emotion

## How to render an HTML string coming from the server.

1. [Dangerous] - `<div dangerouslySetInnerHTML={html}/>` - should use some additional parser to escape dangerous tags/code
2. [Dangerous] - google had a sandbox, but it was proven insecure
3. It is better to have intermediate representation, ex. Markdown
