export var EventBus = (function(debug = false) {

    var instanceStore = {};

    var builder = function( props = {}, state = {} ) {

        var _private = {
            id            : state.id,           
            props         : {}, 
            state         : {}, 
            notification  : {
                publishers : [] // An array of arrays (not objects)
            }, 
            componentStore   : {}, 
        };

        var _public = {  
            getters       : {}, 
            mutations     : {}, 
            actions       : {}
        }
    
        /**
         * Notifications
         */

        _private.notification.registerPublishers = function( componentName ) {

            _private.notification.publishers[ componentName ] = [];

        }

        _private.notification.notifySubscribers = function( noticeParams ) {

            let subscriberNames = _private.notification.publishers[ noticeParams.notifierKey ];
            let subscriberComponent = undefined;
            let busId = get( 'getBusId' );

            if(debug) { console.warn( 'dispatch notification: ', busId, noticeParams.notifierKey, subscriberNames ) };
   
            if( subscriberNames !== undefined ) {
                  
                for( let i = 0; i < subscriberNames.length; i++ ) {
  
                    subscriberComponent = get( 'getComponent', { 'componentKey' : subscriberNames[ i ] } );

                    if( subscriberComponent !== undefined && subscriberComponent !== false ) {
                        subscriberComponent.dispatch.update( noticeParams.notifierKey, noticeParams.notifierStateDelta, busId );
                    } else {
                        if(debug) { console.warn( 'EventBus plugin; EventBus ID: "' + busId + '" - unable to retrieve component from component store. Expected component key: "' + subscriberNames[ i ] + '"' ) };
                    }
    
                }

            }

        }

        /* Internal actions */
        _public.actions = {
    
            registerComponent : function( state, parameters = {} ) {
                
                // Add parent ID to subcomponent 
                let subcomponent = parameters[ 'componentObj' ]; 
                let subcomponentParents = ( subcomponent[ 'eventBus' ] !== undefined ) ? subcomponent[ 'eventBus' ] : [];

                subcomponentParents.push( get( 'getBusId' ) );
                subcomponentParents = subcomponentParents.unique(); // Remove duplicates

                parameters[ 'componentObj' ].commit.state({ eventBus : subcomponentParents });

                commit( 'addComponent', { 
                        'key'    : parameters[ 'key' ], 
                        'object' : parameters[ 'componentObj' ]
                    });
            
            },
 
            notifyBus : function( state, parameters = {} ) {

                _private.notification.notifySubscribers( parameters );
                
            }, 

            addSubscribers : function( state, params = {} ) {

                let publisherKey  = params.publisherKey; // Expects an unnamed
                let subscriberKey = params.subscriberKey;    // Expects an unnamed array
                let publisher     = _private.notification.publishers[ publisherKey ]; 

                if( publisher === '' || publisher === undefined ) {
                    console.warn( 'EventBus: observers not registered; publisher ID not found' );
                    return false;
                }

                publisher.push( subscriberKey );

                // Remove Duplicates
                _private.notification.publishers[ publisherKey ] = publisher.unique(); 
    
            }, 
            
        }
        
        /* Internal Mutations */
        _public.mutations = {
    
            addComponent : function( state, parameters = {} ) {
                
                let componentKey = parameters[ 'key' ]; 
                let componentObj = parameters[ 'object' ];
        
                if( componentKey == undefined || componentObj == undefined ) { 
                    console.warn( 'EventBus: Component instance was not stored; id or object missing. Instance objection below: ' );
                    console.warn( ( componentObj !== undefined ) ? '--> ' + componentObj.get.state( 'key' ) : '--> key missing' );
                }
                
                // Add component to storage
                _private.componentStore[ componentKey ] = componentObj;

                // Initialize observer object for component. Object represents a list of components
                // that should be notified if this component's state changes. 
                _private.notification.registerPublishers( componentKey );
        
            }
        
        };
    
        /* Internal Getters */
        _public.getters = {
            
            getComponent : function( state, payload = {} ) {
                let componentExists = _private.componentStore.hasOwnProperty( payload.componentKey );
                return ( componentExists ) ? _private.componentStore[ payload.componentKey ] : componentExists;
            },
        
            getAllComponents : function( state, payload = {} ) {
                return _private.componentStore;
            }, 

            getBusId : function( state, payload = {} ) {
                return _private.id;
            }, 

            getPublishers : function( state, payload = {} ) {

                if( payload.publisherId == '' || payload.publisherId === undefined ) {
                    return _private.notification.publishers;
                } else {
                    return _private.notification.publishers[ payload.publisherId ];
                }

            }, 
        
        };
    
        // Access getters
        var get = function( getterName, parameters = {} ) {
            
            if( _public.getters[ getterName ] === undefined ) {
                console.error( 'EventBus: getter "' + getterName + '", not defined' );
                return;
            }

            return _public.getters[ getterName ]( _private.state, parameters );
    
        }
    
        // Access actions
        var dispatch = function( actionName, parameters = {} ) {

            if( _public.actions[ actionName ] === undefined ) {
                console.error( 'EventBus: action "' + actionName + '", not defined' );
                return;
            }

            return _public.actions[ actionName ]( _private.state, parameters );
    
        }
    
        // Access mutations
        var commit = function( mutationName, parameters = {} ) {

            if( _public.mutations[ mutationName ] === undefined ) {
                console.warn( 'EventBus: mutation "' + mutationrName + '", not defined' );
                return;
            }

            return _public.mutations[ mutationName ]( _private.state, parameters );
    
        }

        return {
            dispatch : dispatch, 
            commit   : commit, 
            get      : get, 
            app      : _public
        }

    }

    var registerBus = function( params = {} ) {

        // Handle expected parameters
        params.state = ( params === undefined ) ? undefined : params.state;

        // Do not create an eventBus without a name
        if( params.state.id === undefined|| params.state.id == '' ) {
            console.error( 'Fatal Error - EventBus: Failed to register new instance; ID not provided' );
            return false;
        }

        // Avoid overwriting existing components
        var existingEventBus = this.getAllBuses();

        for( let i = 0; i < existingEventBus.length; i++ ) {

            if( this.getBus( existingEventBus[ i ] ).getBusId() ) {
                console.error( 'Fatal Error - EventBus: Failed to register new instance; ID already exists' );
                return false; 
            }

        }

        this.storeBus(
            params.state.id, 
            new EventBus.construct( params.props, params.state )
        );

    }

    var storeBus = function( instanceId, instanceObj ) {
    
        instanceStore[ instanceId ] = instanceObj;

    }

    var getBus = function( nameOfInstance = '' ) {

        return ( nameOfInstance !== '' ) ? instanceStore[ nameOfInstance ] : instanceStore;

    }

    var deleteBus = function( nameOfInstance ) {
        
        // TODO: 1) Devare component object from store 
        //       2) Remove event listeners
    
    }

    // Polyfill for making sure elements are unique within an array

    if( Array.prototype.unique === undefined ) {

        Array.prototype.unique = function() {

            let a = this.concat();
 
            for(let i=0; i<a.length; ++i) {
                for(let j=i+1; j<a.length; ++j) {
                    if(a[i] === a[j]) {
                        a.splice(j--, 1);
                    }
                }
            }

            return a;
        };

    }

    return {
        construct   : builder,
        registerBus : registerBus,
        storeBus    : storeBus,
        getBus      : getBus, 
        getAllBuses : getBus,
        deleteBus   : deleteBus
    }
    
})();

// Initialize application
EventBus.registerBus({ 
    state: { id : 'GlobalComponentEvents' } 
});

// Make application available to other applications and modules
export var GlobalComponentEvents = EventBus.getBus( 'GlobalComponentEvents' );