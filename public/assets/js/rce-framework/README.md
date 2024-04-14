# RCE Framework

RCE (Root Components and Event-bus) emphasizes getting back to the roots of component-based development. RCE's component builder is a lightweight, event-driven JavaScript framework for building highly interactive and modular web applications. By leveraging an event bus system, RCE facilitates communication between components without requiring them to be directly aware of each other, enabling a decoupled and maintainable architecture. 

### Features
- Event-Driven Architecture: Components communicate through a centralized event bus, promoting loose coupling and enhanced modularity.
- Component Lifecycle Hooks: Utilize hooks like beforeCreate, onMount, and afterUpdate for fine-grained control over the component lifecycle.
- State Management: Manage component states with ease, allowing for reactive updates and efficient rendering.
- Template Rendering: Define and manipulate component templates, supporting both inline and external templates for dynamic content rendering.
- No compiler or build process: The original framework is written in vanilla JavaScript and is readily extensible at less than 1500 lines of code. 

### Limitations
- Developer Experience: Requires proficiency in vanilla JavaScript and relies on a strong understanding of fundamental patterns with a large focus on being intentional.
- Verbosity: This is not a declarative system; you will be writing a lot of code with explicit system instructions. There isn't a templating language or special utility classes that serve multiple purposes. (Maybe one day we'll make it more class based at best).
- Process Orientation: An opinionated system focusing on impact, business value, and explicit workflows. Common actions make it easier to estimate production, and generate documentation for component libraries and process diagrams. For example. no build process means minor changes won't cost the organization countless hours of production.
- Type Handling: Use of JsDocs is highly encouraged.

## Getting Started
### Installation
You can include the RCE framework in your project by adding the Factory.js file to your HTML file or importing it into your JavaScript module.

``` javascript
<script type="module">

    // Build configuration driven components
    import { Factory, ComponentConfigs, ComponentProps } from '/rce/Factory.js';

    // Trigger signals in components. Subscribers will receive signals and can react
    import { EventBus, GlobalComponentEvents } from '/rce/EventBus.js';  

</script>
```

### Creating a Component
Define a component configuration object's state, properties, and lifecycle hooks. (Only configure what you need; omit the rest from your configuration.)

``` javascript
ComponentConfigs.myComponentConfig = {
    eventBus: [ 'GlobalComponentEvents' ],
    state: {
        componentName: 'MyComponent',
        myKey: 'My value'
        /* Additional state properties... */
    },
    props: { /* Store commonly reused schema and eventlisteners */ }
    hooks: {
        beforeCreate : function( state ) { },
        beforeUpdate : function( delta ) { }, 
        onUpdate     : function( delta ) { },
        afterUpdate  : function( delta ) { }, 
        afterCreate  : function( state ) { },
        beforeMount  : function( state ) { }, 
        onMount      : function( state ) { },                
        afterMount   : function( state ) { }
    },
    get: { /* Get values from state */ },
    commit: { /* Commit changes to state */ },
    dispatch: { /* Dispatch actions to generate or respond to state change */ },
    template : `
        <div>
            <h1 id="textHere"></h1>
            <form>
                <input id="someInput" type="text"/>
            </form>
        </div>
    `, 
    debug: true, /* Default value false */
};
```

### Registering a Component
Register your component with the RCE framework to bring it to life.

``` javascript
Factory.registerComponent( Component.myComponentConfig );
```

### Listening and Emitting Events
Components can listen to events from the event bus and emit events to communicate with other components.

``` javascript
/**
 * Step 1 - Subscribe to an event bus
 */

ComponentConfigs.componentOne.eventBus[] = 'MyBus';
ComponentConfigs.componentTwo.eventBus = ['MyBus', 'AnotherBus'];

/**
 * Step 2 - 
 * 
 * Commit new values within a dispatched action. This triggers 
 * a signal that is caught by the event bus and distributed to 
 * modules subscribed to that bus. 
 * 
 * Note: The signal is only published if there is a delta between 
 *       componentOne's previous state and future state
 */

componentOne.dispatch.SomeAction = (newInput) => {
    // Do something with the newInput ...

    // ... Save the input
    this.component().commit.state({
        myKey: processedInput
    });
} 

/**
 * Step 3 - React to the signal in another component
 */

componentTwo.dispatch.update = ( delta ) => {
    console.log( delta.myKey );
}
```

## Documentation
For detailed documentation on component configuration, lifecycle hooks, state management, and event handling, refer to the RCE Documentation.

## Examples
Check out the examples directory for sample applications and use cases to get started with RCE.


---
License
Component Builder is GNU GENERAL PUBLIC LICENSE licensed.