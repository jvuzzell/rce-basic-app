import { Factory, ComponentConfigs } from '../assets/js/rce-framework/Factory.js'; 

(function(
    Factory,
    ComponentConfigs
){
    let initialState = {
        componentName : 'exampleComponent', 
        heading : 'Readme Page'
    };

    // Step 1 - Configuration
    ComponentConfigs.exampleComponent = {

        eventBus : [ 'GlobalComponentEvents' ],
        state : initialState, 
        props : {
            eventListeners: {
                onChangeFormInput: {
                    listener : 'keyup',
                    selector : '[data-input]', 
                    callback : ( event, component, componentKey ) => {
                        component.dispatch.commitHeading( event.target.value );
                    }
                }, 
            }
        },
        hooks : {

            onMount : function( state ) { 
                this.component().dispatch.insertTemplate( '#app' ); 
                this.component().dispatch.updateHeading( state.heading);
            }, 

            onUpdate : function( delta ) { 
                this.component().dispatch.updateHeading( delta.heading);
            }

        },  
        dispatch : {
            
            commitHeading : function( inputValue ) {
                this.component().commit.state({ 'heading' : inputValue });
            },

            updateHeading : function( heading ) { 
                let node = this.component().get.inlineTemplateNode();
                node.querySelector('[data-heading]').innerText = heading;
            },

        },
        template : `
            <div>
                <h1 data-heading></h1>
                <form>
                    <input data-input type="text"/>
                </form>
            </div>
        `
    }

    // Step 2 - Registration
    Factory.registerComponent( ComponentConfigs.exampleComponent );

})(
    Factory,
    ComponentConfigs
);