import { EventBus } from "./EventBus.js";

// Create global namespaces for modules 
export var ComponentConfigs = {}; // aka componentConfig
export var ComponentProps = {};

// Builder
export var Factory = (function( EventBus ) {

    var componentStore = {};

    // Module Features
    var builder = function( componentConfig = {}, inlineTemplateNode ) {

        var debug = (componentConfig.debug) ? componentConfig.debug : false;

        // Public Methods
        var _public = {
            get      : {}, 
            commit   : {},
            dispatch : {}, 
            hooks    : {
                beforeCreate : function( state ) { if(!debug) {return}; console.info( '1. This will not run unless defined during component registration', state ); },
                beforeUpdate : function( delta ) { if(!debug) {return}; console.log( '2. Module will update: ' + this.component().get.state( 'key' ), delta ); }, 
                onUpdate     : function( delta ) { if(!debug) {return}; console.log( '3. Module updating: ' + this.component().get.state( 'key' ), delta ); },
                afterUpdate  : function( delta ) { if(!debug) {return}; console.log( '4. Module updated: ' + this.component().get.state( 'key' ), delta );  }, 
                afterCreate  : function( state ) { if(!debug) {return}; console.log( '5. Module was created: ' + state.key ) },
                beforeMount  : function( state ) { if(!debug) {return}; console.log( '6. Module will mount: ' + state.key ); }, 
                onMount      : function( state ) { if(!debug) {return}; console.log( '7. Module mounting: ' + state.key ); },                
                afterMount   : function( state ) { if(!debug) {return}; console.log( '8. Module has mounted: ' + state.key ); }
            }

        };

        // Private
        var component = {
            ref       : '',
            props     : {}, 
            state     : {
                key : '',                    // Placeholder; created dynamically at the time the component is instantiated
                componentName : '',             // Placeholder; this the common name of the component determined by the developer manually, is not unique
                eventBus : [], // Placeholder; this is updated when the the component is registered to eventBus
                eventListeners : {}, 
                firstRenderFlag : true
            }, 
            inlineTemplateNode : inlineTemplateNode, 
            template : (componentConfig.template) ? componentConfig.template : null
        };

        var _private = {};

        /**
         * Update eventBus, notifies eventBus(s) that a change has occured within a given component 
         */

        _private.notifyEventBus = function( notifierKey = '', notifierStateDelta = {} ) {

            const eventBus = _public.get.state( 'eventBus' );

            for( let i = 0; i < eventBus.length; i++ ) {
                EventBus.getBus( eventBus[ i ] ).dispatch(
                    'notifyBus', 
                    {
                        'notifierType'       : 'component',
                        'notifierKey'        : notifierKey,  
                        'notifierStateDelta' : notifierStateDelta
                    }
                );
            }

        }

        _private.hasStateChanged = function( newState ) {

            const currentState    = _public.get.state(); 
            let comparison        = {};
            let intentionalChange = false; // True if any value within comparison.diff !== null 
            
            comparison.stateChanged = false;
            comparison.diff         = _private.compareObjects( currentState, newState );

            for( let key in comparison.diff ) {
                
                // Handling Unintentional Changes in State changes
                // 
                // Evaluate the comparison.diff for values other than null. 
                // If the current state has key-value pairs that the new state 
                // does not then the comparison.diff will contain the key 
                // with a value of null. This counts as true change however, 
                // we are going to interpret null as an unintentional change in state.
                // 
                // In order for a developer to commit an intentional change where 
                // the new state of includes a key-value pair with value = null, 
                // then consider removing the key from the currentState or setting the
                // value of currentState at the given key-value pair to an undefined, 
                // empty string, zero, negative one or false.

                if( comparison.diff[ key ] === null ) {
                    continue; 
                } else {
                    intentionalChange = true; 
                    break; // if even one field has intentionally changed then exit loop
                }

            }     
                
            if( Object.keys( comparison.diff ).length > 0 && intentionalChange === true ) {
                comparison.stateChanged = true;
            }

            return comparison;
            
        }

        /* Getters */

        _public.get.state = function( fieldName = '' ) {

            return ( fieldName == '' ) ? component.state : component.state[ fieldName ];

        }

        _public.get.props = function( fieldName = '' ) {

            return ( fieldName == '' ) ? component.props : component.props[ fieldName ];

        }

        _public.get.ref = function() {

            return component.ref;

        }

        _public.get.observers = function( observerName = '' ) {

            if( observerName !== '' ) {
                observerIndex = component.observers.indexOf( observerName );
                observer = component.observers[ observerIndex ];
            }

            return ( observerName == '' ) ? component.observers : observer;

        }

        _public.get.inlineTemplateNode = function() {
            
            let node = null; 

            node = ( component.inlineTemplateNode === null ) ? _public.dispatch.createTemplateNode() : component.inlineTemplateNode;
            if( node === null ) { 
                console.error( 'Inline template does not exist' );
            }
            return node;

        }

        _public.get.templateString = function() {

            return component.template;

        }

        /* Mutations */

        _public.commit.state = function( newState = {}, triggerRender = true, triggerNotification = true ) {
            
            // 1) If state is different then update 

            const differencesInState = _private.hasStateChanged( newState ); // Returns object

            if( differencesInState.stateChanged === true ) {

                // 2) Update current state object with only the things that changed

                for( let key in differencesInState.diff ) {
                
                    // Skip so that we don't overwrite values in current state with null
                    if( differencesInState.diff[ key ] === null ) continue;

                    component.state[ key ] = differencesInState.diff[ key ];

                }

                if (debug) { console.log( 'Change in state: ', newState ) };

                // 3) Re-render existing node
                if( !triggerRender ) return; 
                _public.dispatch.render( newState );
                
                // 4) Notify observers
                if( !triggerNotification ) return;
                _private.notifyEventBus( _public.get.state ('key' ), newState );
            
            }

        }

        _public.commit.props = function( newProps = {} ) {

            for( let key in newProps ) {
                component.props[ key ] = newProps[ key ];
            }     

        }

        _public.commit.ref = function( newRef = '' ) { 

            component.ref = newRef;

        }

        /* Actions */

        _public.dispatch.update = function( notifierKey, notifierStateDelta ) {

            // This is a response to an EventBus Notification
            // Developers are responsible for defining this method
            
        }

        _public.dispatch.notifyEventBus = function( notifierKey, notifierStateDelta ) {

            _private.notifyEventBus( notifierKey, notifierStateDelta );

        }

        _public.dispatch.insertTemplate = function( selector, insertType = 'append' ) {

            let templateNode = _public.get.inlineTemplateNode(); 

            if(templateNode) {
                let documentNode = document.querySelector( selector );

                if(insertType === 'append') { 
                    documentNode.appendChild( templateNode );   
                } else { 
                    documentNode.prependChild( templateNode );
                }
            }
        }, 

        _public.dispatch.mount = function() {

            // 1) Hook beforeMount - compile template
            _public.hooks.beforeMount( _public.get.state() );

            // 2) Hook onMount - add template to DOM
            _public.hooks.onMount( _public.get.state() );

            // 3) Hook afterMount - post processing
            _public.hooks.afterMount( _public.get.state() );

            component.state.firstRenderFlag = false;

            // 4) Notify the rest of the eventBus
            _public.dispatch.notifyEventBus( _public.get.state( 'key' ), _public.get.state() );

        }

        _public.dispatch.render = function( delta = {} ) {

            // 1) Hook beforeUpdate- compile template
            _public.hooks.beforeUpdate( delta );

            // 2) Hook onUpdate - add template to DOM
            _public.hooks.onUpdate( delta );

            // 3) Hook afterUpdate - post processing
            _public.hooks.afterUpdate( delta );

        }

        _public.dispatch.registerInstance = function( componentConfig = {} ) {

            // Update Gets

            if( 
                componentConfig.get !== undefined && 
                componentConfig.get !== null && 
                typeof( componentConfig.get ) !== "object" 
            ) {

                const getKeys = Object.keys( componentConfig.get );

                for( let i = 0; i < getKeys.length; i++ ) {
                    _public.get[ getKeys[ i ] ] = componentConfig.get[ getKeys[ i ] ];
                }
                
            }
            
            // Update Commits (Changes in state)

            if( 
                componentConfig.commit !== undefined && 
                componentConfig.commit !== null && 
                typeof( componentConfig.commit ) === "object" 
            ) {

                const commitKeys = Object.keys( componentConfig.commit );

                for( let i = 0; i < commitKeys.length; i++ ) {
                    _public.commit[ commitKeys[ i ] ] = componentConfig.commit[ commitKeys[ i ] ];
                }

            }

            // Update dispatches (Actions)

            if( 
                componentConfig.dispatch !== undefined && 
                componentConfig.dispatch !== null && 
                typeof( componentConfig.dispatch ) === "object" 
            ) {

                const dispatchKeys = Object.keys( componentConfig.dispatch );

                for( let i = 0; i < dispatchKeys.length; i++ ) {
                    _public.dispatch[ dispatchKeys[ i ] ] = componentConfig.dispatch[ dispatchKeys[ i ] ];
                }

            }

            // Update Hooks (Intrinsic/Custom)

            if( 
                componentConfig.hooks !== undefined && 
                componentConfig.hooks !== null && 
                typeof( componentConfig.hooks ) === "object" 
            ) {

                var hookKeys = Object.keys( componentConfig.hooks );
                var keyToUse = ''; // Used to identify/select _public key

                for( let i = 0; i < hookKeys.length; i++ ) {

                    switch( hookKeys[ i ] ) {
                        
                        case 'beforeCreate' : 
                            keyToUse = 'beforeCreate';
                            break;

                        case 'created' : 
                            keyToUse = 'created';
                            break;

                        case 'beforeMount' : 
                            keyToUse = 'beforeMount';
                            break;

                        case 'onMount' : 
                            keyToUse = 'onMount';
                            break;

                        case 'afterMount' : 
                            keyToUse = 'afterMount';
                            break;

                        case 'beforeUpdate' : 
                            keyToUse = 'beforeUpdate';
                            break;

                        case 'onUpdate' : 
                            keyToUse = 'onUpdate';
                            break;

                        case 'afterUpdate' : 
                            keyToUse = 'afterUpdate';
                            break;

                        default : 
                            keyToUse = hookKeys[ i ];
                            break;
                    
                    }

                    // Replace the 'create', 'beforeMount', 'onMount', and 'afterMount' functions
                    // with the incoming method specified by the developer OR add a custom hook 
                    // specified by the developer 

                    _public.hooks[ keyToUse ] = componentConfig.hooks[ hookKeys[ i ] ];
            
                }

            }

            let triggerRender = false; // Waiting to mount check 

            // Update the component's internal component object
            _public.commit.ref( componentConfig.ref );
            _public.commit.props( componentConfig.props );           
            _public.commit.state( componentConfig.state, triggerRender );
             
            componentConfig.ref = null; //clean up 
            return _public;

        }

        _public.dispatch.createInlineTemplate = function( template, componentKey ) {

            var inlineTemplateNode = Factory.templateToHTML( template ); 
            inlineTemplateNode.setAttribute( 'data-key', componentKey );

            component.inlineTemplateNode = inlineTemplateNode; 

            return _public.get.inlineTemplateNode();

        }

        // Alias for createInlineTemplate()
        _public.dispatch.createNodeFromTemplate = function( template, componentKey ) {

            return _public.dispatch.createInlineTemplate( template, componentKey );

        }

        _public.dispatch.createTemplateNode = function() {

            var inlineTemplateNode = Factory.templateToHTML( component.template ); 

            try {
                inlineTemplateNode.setAttribute( 'data-key', _public.get.state( 'key' ) );
            } catch (error) {
                console.error('Template does not exist');
                return false;
            }

            component.inlineTemplateNode = inlineTemplateNode; 

            return _public.get.inlineTemplateNode();

        }

        // Grant access to all _public methods within each of the children of the _public class

        _public.get.component = function() {

            return {
                commit   : _public.commit, 
                dispatch : _public.dispatch, 
                hooks    : _public.hooks
            };

        };

        _public.dispatch.component = function() {

            return {
                get    : _public.get, 
                commit : _public.commit, 
                hooks  : _public.hooks
            };

        };

        _public.commit.component = function() {

            return {
                get      : _public.get, 
                dispatch : _public.dispatch, 
                hooks    : _public.hooks
            };

        };

        _public.hooks.component = function() {

            return {
                get      : _public.get,  
                commit   : _public.commit, 
                dispatch : _public.dispatch, 
                hooks    : _public.hooks
            }; 

        };

        /*!
         * Find the differences between two objects and push to a new object
         * (c) 2019 Chris Ferdinandi & Jascha Brinkmann, MIT License, https://gomakethings.com & https://twitter.com/jaschaio
         * @param  {Object} currentState The original object
         * @param  {Object} newState The object to compare against it
         * @return {Object} An object of differences between the two
         */

        _private.compareObjects = function( currentState = {}, newState = {} ) {

            // Make sure an object to compare is provided
            if (!newState || Object.prototype.toString.call(newState) !== '[object Object]') {
                return currentState;
            }

            //
            // Variables
            //

            var diffs = {};
            var key;

            //
            // Methods
            //

            /**
             * Check if two arrays are equal
             * @param  {Array}   arr1 The first array
             * @param  {Array}   arr2 The second array
             * @return {Boolean}      If true, both arrays are equal
             */
            const arraysMatch = function (arr1, arr2) {

                // Check if the arrays are the same length
                if (arr1.length !== arr2.length) return false;

                // Check if all items exist and are in the same order
                for (let i = 0; i < arr1.length; i++) {
                    if (arr1[i] !== arr2[i]) return false;
                }

                // Otherwise, return true
                return true;

            };

            /**
             * Compare two items and push non-matches to object
             * @param  {*}      item1 The first item
             * @param  {*}      item2 The second item
             * @param  {String} key   The key in our object
             */
            const compare = function (item1, item2, key) {

                // Get the object type
                let type1 = Object.prototype.toString.call(item1);
                let type2 = Object.prototype.toString.call(item2);

                // If type2 is undefined it has been removed
                if (type2 === '[object Undefined]') {
                    diffs[key] = null;
                    return;
                }

                // If items are different types
                if (type1 !== type2) {
                    diffs[key] = item2;
                    return;
                }

                // If an object, compare recursively
                if (type1 === '[object Object]') {
                    let objDiff = _private.compareObjects(item1, item2);
                    if (Object.keys(objDiff).length > 1) {
                        diffs[key] = objDiff;
                    }
                    return;
                }

                // If an array, compare
                if (type1 === '[object Array]') {
                    if (!arraysMatch(item1, item2)) {
                        diffs[key] = item2;
                    }
                    return;                }

                // Else if it's a function, convert to a string and compare
                // Otherwise, just compare
                if ( type1 === '[object Function]' ) {

                    if ( item1.toString() !== item2.toString() ) {

                        diffs[ key ] = item2;

                    }

                } else {

                    if ( item1 !== item2 ) {

                        diffs[ key ] = item2;

                    }

                }

            };

            //
            // Compare our objects
            //

            // Loop through the first object
            for (key in currentState) {

                if (currentState.hasOwnProperty(key)) {

                    compare(currentState[key], newState[key], key);

                }

            }

            // Loop through the second object and find missing items
            for (key in newState) {

                if (newState.hasOwnProperty(key)) {

                    if (!currentState[key] && currentState[key] !== newState[key] ) {
                        diffs[key] = newState[key];
                    }

                }

            }

            // Return the object of differences
            return diffs;

        }

        // This runs immediately when the constructor is called
        _public.dispatch.registerInstance( componentConfig );

        // This binds the _public to the component exposing them for consumption publically
        return (function(){
            
            return _public;

        })();

    };

    // Plugin Features
    var ensureUniqueKey = function( newKey, existingKeys, componentName ) {

        let needNewKey = false; 

        // TODO: Create a hash table of component instances
        for( let i = 0; i < existingKeys.length; i++ ) {

            if( newKey === existingKeys[ i ] ) { 
                needNewKey = true;
                break;
            }

        }

        return ( needNewKey ) ? ensureUniqueKey( returnRandomKey( componentName ), existingKeys, componentName ) : newKey;
        
    }

    var returnRandomKey = function( componentName ) {

        return 'component_' + componentName + '_' + Math.floor(Math.random() * Math.floor(100000));

    }

    var registerComponent = function( componentConfig, manualRegistration = false ) {
        let state = componentConfig.state; 
        let newModuleKey = '';
        let componentsCreated = {}; // More than one component can be created at this time because of inline templating

        if( state.componentName === undefined || state.componentName === null ) {
            console.warn( 'EventBus: component instance not registered; state.componentName not specified' );
            return false;
        }

        // If Inline Templates are detected then each item becomes a sub component of the parent component 

        // If there are inline templates then create an instance of the component with that inline template
        // Otherwise the component will be created as an standalone instance of the component 

        let inlineTemplateSelector = '[data-inline-template="' + componentConfig.state.componentName + '"]';
        let inlineTemplateNodeList = document.querySelectorAll( inlineTemplateSelector );

        if( inlineTemplateNodeList.length > 0 ) {
          
            for( let i = 0; i < inlineTemplateNodeList.length; i++ ) {
                
                // Make sure that we are not we are not duplicating component registration
                // TODO: Detect subcomponents
                let existingModuleInstance = Factory.getComponentByKey( inlineTemplateNodeList[ i ].getAttribute( 'data-key' ) );
              
                if( !existingModuleInstance ) {

                    if( inlineTemplateNodeList[ i ].getAttribute( 'data-ref' ) !== null ) {

                        componentConfig.ref = inlineTemplateNodeList[ i ].getAttribute( 'data-ref' );

                    }

                    newModuleKey = instantiateComponent( componentConfig, inlineTemplateNodeList[ i ] );

                    // add data-key attribute to prevent a dupe component instance the next time a new 
                    inlineTemplateNodeList[ i ].setAttribute( 'data-key', newModuleKey ); 
                    componentsCreated[ newModuleKey ] = getComponentByKey( newModuleKey );

                    // Custom tasks performed after component has been created and reactivity has been established.
                    // Otherwise, standard routines will be performed which including notifications to related 
                    // eventBuses that the state of a component has been updated, and the component itself will render
                    
                    componentsCreated[ newModuleKey ].dispatch.mount(); 

                    // Set Event Listeners
                    setEventListeners( componentConfig );

                } 

            }

        } else { 

            if( !manualRegistration ) {
                // Register without an inline template
                newModuleKey = instantiateComponent( componentConfig );
                componentsCreated[ newModuleKey ] = getComponentByKey( newModuleKey );
                componentsCreated[ newModuleKey ].dispatch.mount(); 

                // Set Event Listeners
                setEventListeners( componentConfig );
            }

        }

        if( manualRegistration ) {

            newModuleKey = instantiateComponent( componentConfig );
            componentsCreated[ newModuleKey ] = getComponentByKey( newModuleKey );
            componentsCreated[ newModuleKey ].dispatch.mount(); 

        }

        // Return component
        return componentsCreated;

    }

    const setEventListeners = function( componentConfig ) {

        // Add Eventlisteners (Eventlisteners are added to the Window as named functions)
        if(
            componentConfig.props !== undefined && 
            componentConfig.props.eventListeners !== undefined && 
            componentConfig.props.eventListeners !== null && 
            typeof( componentConfig.props.eventListeners ) === "object" 
        ) {

            let eventConfigs = componentConfig.props.eventListeners; 
            let configKeys = Object.keys( eventConfigs );
            let componentKey = componentConfig.state.key;
            let component = getComponentByKey( componentKey ); 
        
            for(let i = 0; i < configKeys.length; i++) {

                let eventConfig = eventConfigs[ configKeys[i] ];
                let node = component.get.inlineTemplateNode(); 
                
                if (node === null) return false;

                if( eventConfig.selector === 'self' || eventConfig.selector === '' ||  eventConfig.selector === undefined ) {
                    try {
                        node.addEventListener( eventConfig.listener, (e) => { 
                            eventConfig.callback(e, component, componentKey ) 
                        });
                    } catch( error ) {
                        console.error( "Not a valid event listener: " + eventConfig.listener )
                    }
                } else {
                    try {
                        node.querySelector(eventConfig.selector).addEventListener( eventConfig.listener, (e) => { 
                            eventConfig.callback(e, component, componentKey ) 
                        });
                    } catch( error ) {
                        console.error( error );
                    }
                }

            }

            let triggerRender = false; 
            component.commit.state( { eventListenersExist : true }, triggerRender );

        }

    }

    const instantiateComponent = function( componentConfig, inlineTemplateNode = null ) {

        // Be sure not to re-register nodes that have already been registered
        const allModules = Factory.getAllComponents();
        const componentState = componentConfig.state;
        let componentKey = '';
        let beforeCreateExists = false; 

        // Determine whether user has defined custom 
        if( 
            componentConfig.hooks !== undefined && 
            componentConfig.hooks !== null && 
            typeof( componentConfig.hooks ) === "object" 
        ) {

            if( 
                componentConfig.hooks.beforeCreate !== undefined && 
                componentConfig.hooks.beforeCreate !== null && 
                typeof( componentConfig.hooks.beforeCreate ) === "function" 
            ) {
                
                beforeCreateExists = true; 

            }

        } 

        // Validate Module ID is unique
        if( componentState.key === undefined ) {
            componentKey = ensureUniqueKey( returnRandomKey( componentState.componentName ), Object.keys( allModules ), componentState.componentName );
        } else {
            componentKey = ensureUniqueKey( componentState.key, Object.keys( allModules ), componentState.componentName );
        }

        // Update ID within state to ensure that the state is consistent with valid value
        componentConfig.state.key = componentKey; 

        if( beforeCreateExists ) {
            // Perform tasks before component has been created
            componentConfig.hooks.beforeCreate( componentConfig.state, inlineTemplateNode ); 
        }

        // Store component in Factory
        storeComponent(
            componentKey, 
            new Factory.construct( componentConfig, inlineTemplateNode )
        );

        // Register component with parent eventBuses
        if(
            componentConfig.eventBus !== undefined && 
            componentConfig.eventBus !== null && 
            typeof( componentConfig.eventBus ) === "object" 
        ) {
            
            setParentBus( componentKey, componentConfig ); 

        }

        // Register components that this component should react to
        if(
            componentConfig.subscriptions !== undefined && 
            componentConfig.subscriptions !== null && 
            typeof( componentConfig.subscriptions ) === "object" 
        ) {

            setEventSubscriptions( componentKey, componentConfig );

        } else {
            // Check to see if parentEventBuss have been specified
            if(
                componentConfig.eventBus !== undefined && 
                componentConfig.eventBus !== null && 
                typeof( componentConfig.eventBus ) === "object" 
            ) {
                for( let i = 0; i < componentConfig.eventBus.length; i++ ) {
                    subscribeToAllEventNotifications( componentKey, componentConfig.eventBus[ i ] );
                }
            }
        }

        // Custom tasks performed after component has been created and reactivity has been established.
        // Otherwise, standard routines will be performed which including notifications to related 
        // eventBuses that the state of a component has been updated, and the component itself will render
        const newComponent = getComponentByKey( componentKey );      
        newComponent.hooks.afterCreate( newComponent.get.state() ); 
  
        return componentKey;

    }

    const setParentBus = function( componentKey, componentConfig ) {

        for( let i = 0; i < componentConfig.eventBus.length; i++ ) {
            
            let eventBus = EventBus.getBus( componentConfig.eventBus[ i ] );

            // Register component to given eventBuses
            eventBus.dispatch( 
                'registerComponent', { 
                    'key'       : componentKey, 
                    'componentObj' : getComponentByKey( componentKey )
                });

        }

    }

    const storeComponent = function( instanceKey, instanceObj ) {

        componentStore[ instanceKey ] = instanceObj;

    }

    const getComponentByKey = function( nameOfInstance = '' ) {

        return ( nameOfInstance !== '' && nameOfInstance !== null && nameOfInstance !== undefined ) ? componentStore[ nameOfInstance ] : false;

    }

    const getAllComponents = function() {
 
        return componentStore;

    } 

    const getComponentsByName = function( componentName = '' ) {

        const componentKeys = Object.keys( getAllComponents() );
        let componentsByModuleName = {};

        for( let i = 0; i < componentKeys.length; i++ ) {

            let currentModule = getComponentByKey( componentKeys[ i ] ); 

            if( currentModule.get.state( 'componentName' ) === componentName ) {
 
                componentsByModuleName[ componentKeys[ i ] ] = currentModule;
                
            }
    
        }  

        return componentsByModuleName; 

    }

    const getComponentByName = function( $name = '' ) {

        let componentList = Factory.getComponentsByName( $name );
        let componentKeys = Object.keys( componentList );
        return componentList[ componentKeys[ 0 ] ];

    }

    const setEventSubscriptions = function( subscriberKey = '', subscriptionPlan = {} ) {

        const eventBusKeys = Object.keys( subscriptionPlan.subscriptions );

        for( let x = 0; x < eventBusKeys.length; x++ ) {

            // Ensure that the component is registered with the eventBus first
            const subscriptionApp = EventBus.getBus( eventBusKeys[ x ] );

            // Ensure that that the component that is subscribing to the eventBus
            // is registered to the eventBus first 
            if( !subscriptionApp.get( 'getComponent', { 'componentKey' : subscriberKey } ) ) {
            
                Factory.setParentBus( subscriberKey, {
                    eventBus : [ eventBusKeys[ x ] ]
                });

            }

        }

        /**
         * Subscribe component to the given observable components
         */

        for( let i = 0; i < eventBusKeys.length; i++ ) {
  
            const eventBus = EventBus.getBus( eventBusKeys[ i ] );
            const publisherKeys = subscriptionPlan.subscriptions[ eventBusKeys[ i ] ]; 

            for( let j = 0; j < publisherKeys.length; j++ ) {
                // Subscribe observers  
                eventBus.dispatch(
                    'addSubscribers', {
                        publisherKey  : publisherKeys[ j ], 
                        subscriberKey : subscriberKey
                    });                  

                // Subscribe to observers     
                eventBus.dispatch(
                    'addSubscribers', {
                        publisherKey  : subscriberKey, 
                        subscriberKey : publisherKeys[ j ]
                    });                  
            }
            
        }

    }

    const subscribeToAllEventNotifications = function( componentKey, eventBusId ) {
        
        if( eventBusId === undefined ) {
            console.warn( 'Factory Plugin, subscribeToAllEventNotifications: eventBusId is undefined. Subscriptions failed.' );
            return false;
        }

        // Find all components subscribed to the given eventBus
        const subscriptionApp = EventBus.getBus( eventBusId );

        if( subscriptionApp !== undefined && subscriptionApp.hasOwnProperty( 'get' ) ) {

            // Retrieve all components from that eventBus 
            let componentsOfSubscriptionApp = subscriptionApp.get( 'getAllComponents' ); 

            // Subscribe to each component
            let allSubscriptionModuleKeys = Object.keys( componentsOfSubscriptionApp );
            let indexOfthisModuleKey = allSubscriptionModuleKeys.indexOf( componentKey );

            // We do not want to subscribe this component to itself
            allSubscriptionModuleKeys.splice( indexOfthisModuleKey, 1 ); 

            Factory.setEventSubscriptions( componentKey, {
                'subscriptions': {
                    [eventBusId] : allSubscriptionModuleKeys
                },
            });

        } else {

            console.warn( 'Module subscriptions for eventBus failed: ' + eventBusId );

        }
         
    }

    /**
    * Convert a template string into HTML DOM nodes
    * @param  {String} str The template string
    * @return {Node}       The template HTML
    */
    const templateToHTML = function (str) {

        let support = (function () {
            if (!window.DOMParser) return false;
            let parser = new DOMParser();
            try {
                parser.parseFromString('x', 'text/html');
            } catch(err) {
                return false;
            }
            return true;
        })();

       // If DOMParser is supported, use it
       if (support) {
           const parser = new DOMParser();
           let doc = parser.parseFromString(str, 'text/html'); 
           return doc.body.querySelector( '*' );
       }

       // Otherwise, fallback to old-school method
       let htmlTagExp = new RegExp( /<[a-zA-Z](.*?[^?])?>/ );
       let openingTag = str.match( htmlTagExp )[ 0 ].replace( />|</gi, '' ); 
       let dom = document.createElement(openingTag);
       dom.innerHTML = str;
       return dom;
   
   };

    // Polyfill for making sure elements are unique within an array
    if( Array.prototype.unique === undefined ) {

        Array.prototype.unique = function() {
            let a = this.concat();
            for(let i=0; i<a.length; ++i) {
                for(let j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j])
                        a.splice(j--, 1);
                }
            }
        
            return a;
        };

    } 

    return {
        construct                        : builder,
        registerComponent                : registerComponent,
        storeComponent                   : storeComponent,
        getComponentByKey                : getComponentByKey, 
        getAllComponents                 : getAllComponents, 
        getComponentsByName              : getComponentsByName,
        getComponentByName               : getComponentByName, 
        setEventSubscriptions            : setEventSubscriptions, 
        setParentBus                     : setParentBus,
        subscribeToAllEventNotifications : subscribeToAllEventNotifications, 
        templateToHTML                   : templateToHTML, 
        setEventListeners                : setEventListeners
    }

})(
    EventBus
);