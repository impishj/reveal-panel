/*
 *
 * jQuery Reveal Panel Plugin 0.1 
 * Works with bootstrap and foundation or without eirther
 *
 * Based on:
 * jQuery Reveal Plugin 1.1
 * www.ZURB.com
 * Copyright 2010, ZURB
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
*/
/*globals jQuery */

/*
 * Requires (in this order):
 * jquery
 * Modernizer with media querys (.mq)  
 * jquerypp.swipe.js (jquerypp.com)
*/
function getCurrentDocWidth(currentAnimationType) {
  //console.log("Current Animation Type: "+currentAnimationType)

  var PanelType = "fadeAndPop";
  if(currentAnimationType=="mpanel") {

    if(Modernizr.mq('only screen and (max-width:768px)') == true){
        PanelType = "panel";
      } else { 
        // There should be a way to change this hmmmm...
        PanelType = "fadeAndPop" 
    }
  }

  if(currentAnimationType=="panel") {
      PanelType = "panel";
  }

  return PanelType;
  
}

(function ($) {

  'use strict';
  //
  // Global variable.
  // Helps us determine if the current modal is being queued for display.
  //
  var modalQueued = false;

  //
  // Bind the live 'click' event to all anchor elemnets with the data-reveal-id attribute.
  //
  $(document).on('click', '[data-reveal-id]', function ( event ) {
    //
    // Prevent default action of the event.
    //
    event.preventDefault();
    //
    // Get the clicked anchor data-reveal-id attribute value.
    //
    var modalLocation = $( this ).attr( 'data-reveal-id' );

    //
    // see if user has set panel id
    //
    if($(this).attr('data-reveal-content')!=undefined){ 
      var panelPointer = $(this).attr('data-reveal-content');
      //
      // place a marker where your about to move the div from.
      //
      $('#'+panelPointer).after('<span id="panelTempMarker"></span>'); 
      //
      // move content from data-reveal-content to the modal div (data-reveal-id)
      //
      $('#'+panelPointer).appendTo('#'+modalLocation); 
      //
      // make modal content shows up reguardless of visibility classes that may be applied
      //
      $('#'+panelPointer).addClass('show-on-panel'); 
    } else {
      var panelPointer = "nopanel" 
    }

    if($(this).attr('data-animation')!=undefined){ 
      var panelType = $(this).attr('data-animation');
    }

    if($(this).attr('data-reveal-menu')!=undefined){ 
      var isMenu = true
      console.log("it's a menu")
    }  else { var isMenu = false }    

    if($(this).attr('data-reveal-swipe')!=undefined){ 
      var swipeToClose = true
      console.log("Swipe is enabled")
    }  else { var swipeToClose = false }    
      
    //
    // Find the element with that modalLocation id and call the reveal plugin.
    //
    $( '#' + modalLocation ).reveal( $( this ).data(), modalLocation, panelPointer, panelType, isMenu, swipeToClose );

  });

  /**
   * @module reveal
   * @property {Object} [options] Reveal options
   */
  $.fn.reveal = function ( options, modalPointer, panelPointer, panelType, isMenu, swipeToClose ) {
    // ensure that if panel-mobile-only is in data-animation= then we use the slide animation for desktop situations

    var startingScroll = $('body').scrollTop();
    // , startingScroll
      /*
       * Cache the document object.
       */
    var $doc = $( document ),
        /*
         * Default property values.
         */
        defaults = {
          /**
           * Possible options: fade, fadeAndPop, none
           *
           * @property animation
           * @type {String}
           * @default fadeAndPop
           */
          animation: 'fadeAndPop',
          /*
          * Track the original animation type we set:
          */
          animationtype: panelType,
          /**
           * Speed at which the reveal should show. How fast animtions are.
           *
           * @property animationSpeed
           * @type {Integer}
           * @default 300
           */
          animationspeed: 300,
          /**
           * Should the modal close when the background is clicked?
           *
           * @property closeOnBackgroundClick
           * @type {Boolean}
           * @default true
           */
          closeOnBackgroundClick: true,
          /**
           * Specify a class name for the 'close modal' element.
           * This element will close an open modal.
           *
           @example
           <a href='#close' class='close-reveal-modal'>Close Me</a>
           *
           * @property dismissModalClass
           * @type {String}
           * @default close-reveal-modal
           */
          dismissModalClass: 'close-reveal-modal',
          /**
           * Specify a callback function that triggers 'before' the modal opens.
           *
           * @property open
           * @type {Function}
           * @default function(){}
           */
          open: $.noop,
          /**
           * Specify a callback function that triggers 'after' the modal is opened.
           *
           * @property opened
           * @type {Function}
           * @default function(){}
           */
          opened: $.noop,
          /**
           * Specify a callback function that triggers 'before' the modal prepares to close.
           *
           * @property close
           * @type {Function}
           * @default function(){}
           */
          close: $.noop,
          /**
           * Specify a callback function that triggers 'after' the modal is closed.
           *
           * @property closed
           * @type {Function}
           * @default function(){}
           */
          closed: $.noop
        }
    ;
    //
    // Extend the default options.
    // This replaces the passed in option (options) values with default values.
    //
    if(panelType!=undefined){
    options.animation = getCurrentDocWidth(panelType);
    }
    options = $.extend( {}, defaults, options );



    // //console.log(options) logging because when animationSpeed wasn't working(on chrome), took out camel case and then there was no duplicate property
    // all instances of animationSpeed have been replaced with animationspeed, the data attribute within chrome at least can still be data-animationSpeed 

    //
    // Apply the plugin functionality to each element in the jQuery collection.
    //
    return this.not('.reveal-modal.open').each( function () {
        //
        // Cache the modal element
        //
      var modal = $( this ),
        //
        // Get the current css 'top' property value in decimal format.
        //
        topMeasure = parseInt( modal.css( 'top' ), 10 ),
        //
        // Calculate the top offset.
        //
        topOffset = modal.height() + topMeasure,
        //
        // Helps determine if the modal is locked.
        // This way we keep the modal from triggering while it's in the middle of animating.
        //
        locked = false,
        //
        // Get the modal background element.
        //
        modalBg = $( '.reveal-modal-bg' ),
        //
        // Show modal properties
        //
        cssOpts = {
          //
          // Used, when we show the modal.
          //
          open : {
            'left': '50%', //! touchpanel addition
            //
            // Set the 'top' property to the document scroll minus the calculated top offset.
            //
            'top': 0,
            //
            // Opacity gets set to 0.
            //
            'opacity': 0,
            //
            // Show the modal
            //
            'visibility': 'visible',
            //
            // Ensure it's displayed as a block element.
            //
            'display': 'block'
          },
          //
          // Used, when we hide the modal.
          //
          close : {
            //
            // set default left value ( necessary because of touchpanel)
            //
            'left': '50%', //! touchpanel addition
            //
            // Set the default 'top' property value.
            //
            'top': topMeasure,
            //
            // Has full opacity.
            //
            'opacity': 1,
            //
            // Hide the modal
            //
            'visibility': 'hidden',
            //
            // Ensure the elment is hidden.
            //
            'display': 'none'
          }

        },
        //
        // Initial closeButton variable.
        //
        $closeButton;
        var $mCloseButton;

      //
      // Do we have a modal background element?
      //
      if ( modalBg.length === 0 ) {
        
        if(options.animation != "panel" || isMenu==true){
        //
        // No we don't. So, let's create one.
        //
        modalBg = $( '<div />', { 'class' : 'reveal-modal-bg' } )
        //
        // Then insert it after the modal element.
        //
        .insertAfter( modal );
        //
        // Now, fade it out a bit.
        //
        modalBg.fadeTo( 'fast', 0.8 );
        }
      }

      //
      // Helper Methods
      //

      /**
       * Unlock the modal for animation.
       *
       * @method unlockModal
       */
      function unlockModal() {
        locked = false;
      }

      /**
       * Lock the modal to prevent further animation.
       *
       * @method lockModal
       */
      function lockModal() {
        locked = true;
      }

      /**
       * Closes all open modals.
       *
       * @method closeOpenModal
       */
      function closeOpenModals() {
        //
        // Get all reveal-modal elements with the .open class.
        //
        var $openModals = $( ".reveal-modal.open" );
        //
        // Do we have modals to close?
        //

        if ( $openModals.length === 1 ) {
          //
          // Set the modals for animation queuing.
          //
          modalQueued = true;
          //
          // Trigger the modal close event.
          //
          returnContent();
          $openModals.trigger( "reveal:close" );
        }

      }
      /**
       * Animates the modal opening.
       * Handles the modal 'open' event.
       *
       * @method openAnimation
       */
      function openAnimation() {
        //
        // First, determine if we're in the middle of animation.
        //
        if ( !locked ) {
          //
          // We're not animating, let's lock the modal for animation.
          //
          lockModal();
          //
          // Close any opened modals.
          //
          closeOpenModals();
          //
          // Now, add the open class to this modal.
          //
          modal.addClass( "open" );


          //
          // Are we executing the 'touchpanel' OPEN animation?
          //
          if ( options.animation === "panel"  ) {

            // yep animation type is indeed panel so add .touchpanel css to modal
            //
            $('body').css({"overflow-y":"hidden"}); // prevents safari from showing two scrollbars
             if( $('html').hasClass('lt-android-3') || $('html').hasClass('lt-ios5') ){
              
             } else{
                $('body').css({"overflow-x":"hidden"})
             }

             //
             // handle menu case
             //
            
            modal.addClass('touchpanel');
            //modal.css({"left":"-100%","width":"80%"});

            var PanAmount = "-100%";
            var modalPanAmount = "0%";

            if(isMenu==true){
              modal.css({"left":"-80%","width":"80%"});
              PanAmount = "80%";
              modalPanAmount = "0%";
              modalBg.fadeIn( options.animationspeed / 2 )
              
            } else {
              modal.css({"left":"100%","width":"100%"});
            }

            // provide starting values
            ////console.log("open panel make top property:"+startingScroll);
            modal.css({
                "top":startingScroll-10,
                "visibility":"visible",
                "display":"block",
                "position":"absolute"
              });
                
            $('body').stop().animate({"left":PanAmount},options.animationspeed,
              function () {
                // call back function once we're done animating
                //
                // return scroll position and panel position to top so the user can't scroll up into empty space
                // yes we could have done this with position fixed but ios and android have sparse support for those properties 
                if( $('html').hasClass('lt-android-3') || $('html').hasClass('lt-ios5') ){
                  $('body').scrollTop(0)
                  $('.touchpanel').css({"top":"0px"})
                } else {
                  $('body').css({"overflow":"hidden"});
                  $('.touchpanel').css({"position":"fixed","left":"0%","overflow-x":"hidden","overflow-y":"scroll","top":"0px"});
                  //$('body').scrollTop(0)
                }

                modal.trigger( 'reveal:opened' );
               
                // add touch event listener 
                if(isMenu==true && swipeToClose==true){
                  //
                  // Make gesturies
                  //
                  $('.touchpanel').on({
                  'swipeleft' : function(ev) {
                    modal.trigger( 'reveal:close' );
                  }
                });  
                } else if(swipeToClose==true){
                $('.touchpanel').on({
                  'swiperight' : function(ev) {
                    modal.trigger( 'reveal:close' );
                  }
                });  
                }
                

                
                } // end callback function
              ); // end body animation 

          

          } // end if 'touchpanel'




          //
          // Are we executing the 'fadeAndPop' animation?
          //
          if ( options.animation === "fadeAndPop" ) {
            //
            // Yes, we're doing the 'fadeAndPop' animation.
            // Okay, set the modal css properties.
            //
            //
            // Set the 'top' property to the document scroll minus the calculated top offset.
            //
            cssOpts.open.top = $doc.scrollTop() - topOffset;  

            if(options.animationtype=="mpanel"){
            var openModalTopPos = ''; // get the top position from reveal-modal class instead of calculating it. 
            } else {
            var openModalTopPos = $doc.scrollTop() + topMeasure + 'px';       
            }

            //
            // Flip the opacity to 0.
            //
            cssOpts.open.opacity = 0;
            //
            // Set the css options.
            //
            modal.css( cssOpts.open );
            //
            // Fade in the background element, at half the speed of the modal element.
            // So, faster than the modal element.
            //
            modalBg.fadeIn( options.animationspeed / 2 );

            //
            // Let's delay the next animation queue.
            // We'll wait until the background element is faded in.
            //
            modal.delay( options.animationspeed / 2 )
            //
            // Animate the following css properties.
            //
            .animate( {
              //
              // Set the 'top' property to the document scroll plus the calculated top measure.
              //
              "top": openModalTopPos,
              // "top": $doc.scrollTop() + topMeasure + 'px',
              //
              // Set it to full opacity.
              //
              "opacity": 1

            },
            /*
             * Fade speed.
             */
            options.animationspeed,
            /*
             * End of animation callback.
             */
            function () {
              //
              // Trigger the modal reveal:opened event.
              // This should trigger the functions set in the options.opened property.
              //
              modal.trigger( 'reveal:opened' );

            }); // end of animate.

          } // end if 'fadeAndPop'

          //
          // Are executing the 'fade' animation?
          //
          if ( options.animation === "fade" ) {
            //
            // Yes, were executing 'fade'.
            // Okay, let's set the modal properties.
            //
            cssOpts.open.top = $doc.scrollTop() + topMeasure;
            //
            // Flip the opacity to 0.
            //
            cssOpts.open.opacity = 0;
            //
            // Set the css options.
            //
            modal.css( cssOpts.open );
            //
            // Fade in the modal background at half the speed of the modal.
            // So, faster than modal.
            //
            modalBg.fadeIn( options.animationspeed / 2 );

            //
            // Delay the modal animation.
            // Wait till the modal background is done animating.
            //
            modal.delay( options.animationspeed / 2 )
            //
            // Now animate the modal.
            //
            .animate( {
              //
              // Set to full opacity.
              //
              "opacity": 1
            },

            /*
             * Animation speed.
             */
            options.animationspeed,

            /*
             * End of animation callback.
             */
            function () {
              //
              // Trigger the modal reveal:opened event.
              // This should trigger the functions set in the options.opened property.
              //
              modal.trigger( 'reveal:opened' );

            });

          } // end if 'fade'

          //
          // Are we not animating?
          //
          if ( options.animation === "none" ) {
            //
            // We're not animating.
            // Okay, let's set the modal css properties.
            //
            //
            // Set the top property.
            //
            cssOpts.open.top = $doc.scrollTop() + topMeasure;
            //
            // Set the opacity property to full opacity, since we're not fading (animating).
            //
            cssOpts.open.opacity = 1;
            //
            // Set the css property.
            //
            modal.css( cssOpts.open );
            //
            // Show the modal Background.
            //
            modalBg.css( { "display": "block" } );
            //
            // Trigger the modal opened event.
            //
            modal.trigger( 'reveal:opened' );

          } // end if animating 'none'

        }// end if !locked

      }// end openAnimation

      function returnContent() {
        if(panelPointer!="nopanel"){
          $('#'+panelPointer).removeClass('show-on-panel');
          $('#'+modalPointer+' #'+panelPointer).insertBefore('#panelTempMarker');          
        }
      }


      function openVideos() {
        var video = modal.find('.flex-video'),
            iframe = video.find('iframe');
        if (iframe.length > 0) {
          iframe.attr("src", iframe.data("src"));
          video.fadeIn(100);
        }
      }

      //
      // Bind the reveal 'open' event.
      // When the event is triggered, openAnimation is called
      // along with any function set in the options.open property.
      //
      modal.bind( 'reveal:open.reveal', openAnimation );
      modal.bind( 'reveal:open.reveal', openVideos);

      /**
       * Closes the modal element(s)
       * Handles the modal 'close' event.
       *
       * @method closeAnimation
       */
      function closeAnimation() {
        //
        // First, determine if we're in the middle of animation.
        //
        if ( !locked ) {
          //
          // We're not animating, let's lock the modal for animation.
          //
          lockModal();
          //
          // Clear the modal of the open class.
          //
          modal.removeClass( "open" );

          //
          // Are we using the 'fadeAndPop' animation?
          //
          if ( options.animation === "fadeAndPop" ) {
            //
            // Yes, okay, let's set the animation properties.
            //
            modal.animate( {
              //
              // Set the top property to the document scrollTop minus calculated topOffset.
              //
              "top":  $doc.scrollTop() - topOffset + 'px',
              //"left": '50%',
              //
              // Fade the modal out, by using the opacity property.
              //
              "opacity": 0

            },
            /*
             * Fade speed.
             */
            options.animationspeed / 2,
            /*
             * End of animation callback.
             */
            function () {
              //
              // Set the css hidden options.
              //
              modal.css( cssOpts.close );
              

            });
            //
            // Is the modal animation queued?
            //
            if ( !modalQueued ) {
              //
              // Oh, the modal(s) are mid animating.
              // Let's delay the animation queue.
              //
              modalBg.delay( options.animationspeed )
              //
              // Fade out the modal background.
              //
              .fadeOut(
              /*
               * Animation speed.
               */
              options.animationspeed,
             /*
              * End of animation callback.
              */
              function () {
                //
                // put content back where it came from
                //
                returnContent();
                //
                // Trigger the modal 'closed' event.
                // This should trigger any method set in the options.closed property.
                //
                modal.trigger( 'reveal:closed' );



              });

            } else {
              //
              // We're not mid queue.
              //
              // put content back where it came from
              //
              returnContent();
              // Trigger the modal 'closed' event.
              // This should trigger any method set in the options.closed propety.
              //
              modal.trigger( 'reveal:closed' );

            } // end if !modalQueued

          } // end if animation 'fadeAndPop'



          //
          // Are we using the 'panel' CLOSE animation?
          //
          if ( options.animation === "panel" ) {



            $('.touchpanel').off();
            $('body').css({"overflow":"auto"});

            
            var modalPanAmount = "100%";
            if(isMenu==true){
              modalPanAmount = "-80%";
            } 

            var newScrollPosCalc, newScrollPosBody, newScrollPosTouch = "";
            var newScrollPosTouch = $('.touchpanel').scrollTop()
            var newScrollPosBody = $('body').scrollTop()
            
            var newScrollPosCalc = newScrollPosBody - newScrollPosTouch -10;
            
            $('.touchpanel').css({"position":"absolute","left":modalPanAmount,"top":newScrollPosCalc});

            modal.trigger( 'reveal:closed' );
            
            $('body').stop().animate({"left":"0%"},options.animationspeed, function(){
                //
                // put content back where it came from
                //
                returnContent();
                //
                // clear an inline style that panel used and ends up overriding 
                //
                modal.css({"width":""}); 
                modal.removeClass('touchpanel');
                modal.css( cssOpts.close );
                
            });

            //
            // Is the modal animation queued?
            //
            if ( !modalQueued ) {
              //
              // Oh, the modal(s) are mid animating.
              // Let's delay the animation queue.
              //
              modalBg.delay( options.animationspeed )
              //
              // Fade out the modal background.
              //
              .fadeOut(
              /*
               * Animation speed.
               */
              options.animationspeed,
             /*
              * End of animation callback.
              */
              function () {
                //
                // put content back where it came from
                //
                returnContent();
                //
                // Trigger the modal 'closed' event.
                // This should trigger any method set in the options.closed property.
                //
                modal.trigger( 'reveal:closed' );



              });

            } else {
              //
              // We're not mid queue.
              //
              // put content back where it came from
              //
              returnContent();
              // Trigger the modal 'closed' event.
              // This should trigger any method set in the options.closed propety.
              //
              modal.trigger( 'reveal:closed' );

            } // end if !modalQueued

          } // end if animation 'panel'


          //
          // Are we using the 'fade' animation.
          //
          if ( options.animation === "fade" ) {
            //modal.stop();
            //
            // Yes, we're using the 'fade' animation.
            //
            modal.animate( { "opacity" : 0 },
              /*
               * Animation speed.
               */
              options.animationspeed,
              /*
               * End of animation callback.
               */
              function () {
              //
              // Set the css close options.
              //
              modal.css( cssOpts.close );

            }); // end animate

            //
            // Are we mid animating the modal(s)?
            //
            if ( !modalQueued ) {
              //
              // Oh, the modal(s) are mid animating.
              // Let's delay the animation queue.
              //
              modalBg.delay( options.animationspeed )
              //
              // Let's fade out the modal background element.
              //
              .fadeOut(
              /*
               * Animation speed.
               */
              options.animationspeed,
                /*
                 * End of animation callback.
                 */
                function () {
                  //
                  // Trigger the modal 'closed' event.
                  // This should trigger any method set in the options.closed propety.
                  //
                  modal.trigger( 'reveal:closed' );
                  //
                  // put content back where it came from
                  //
                  returnContent();

              }); // end fadeOut

            } else {
              //
              // We're not mid queue.
              // Trigger the modal 'closed' event.
              // This should trigger any method set in the options.closed propety.
              //

              modal.trigger( 'reveal:closed' );
              //
              // put content back where it came from
              //
              returnContent();


            } // end if !modalQueued

          } // end if animation 'fade'

          //
          // Are we not animating?
          //
          if ( options.animation === "none" ) {
            //
            // We're not animating.
            // Set the modal close css options.
            //
            modal.css( cssOpts.close );
            //
            // Is the modal in the middle of an animation queue?
            //
            if ( !modalQueued ) {
              //
              // It's not mid queueu. Just hide it.
              //
              modalBg.css( { 'display': 'none' } );
            }

            //
            // put content back where it came from
            //
            returnContent();

            // Trigger the modal 'closed' event.
            // This should trigger any method set in the options.closed propety.
            //
            modal.trigger( 'reveal:closed' );

          } // end if not animating
          //
          // Reset the modalQueued variable.
          //
          modalQueued = false;
        } // end if !locked

      } // end closeAnimation








      /**
       * Destroys the modal and it's events.
       *
       * @method destroy
       */
      function destroy() {
        //
        // Unbind all .reveal events from the modal.
        //
        modal.unbind( '.reveal' );
        //
        // Unbind all .reveal events from the modal background.
        //
        modalBg.unbind( '.reveal' );
        //
        // Unbind all .reveal events from the modal 'close' button.
        //
        $closeButton.unbind( '.reveal' );
        $mCloseButton.unbind( '.reveal' );
        //
        // Unbind all .reveal events from the body.
        //
        $( 'body' ).unbind( '.reveal' );

      }

      function closeVideos() {
        var video = modal.find('.flex-video'),
            iframe = video.find('iframe');
        if (iframe.length > 0) {
          iframe.data("src", iframe.attr("src"));
          iframe.attr("src", "");
          video.fadeOut(100);  
        }
      }

      //
      // Bind the modal 'close' event
      //
      modal.bind( 'reveal:close.reveal', closeAnimation );
      modal.bind( 'reveal:closed.reveal', closeVideos );
      //
      // Bind the modal 'opened' + 'closed' event
      // Calls the unlockModal method.
      //
      modal.bind( 'reveal:opened.reveal reveal:closed.reveal', unlockModal );
      //
      // Bind the modal 'closed' event.
      // Calls the destroy method.
      //
      modal.bind( 'reveal:closed.reveal', destroy );
      //
      // Bind the modal 'open' event
      // Handled by the options.open property function.
      //
      modal.bind( 'reveal:open.reveal', options.open );
      //
      // Bind the modal 'opened' event.
      // Handled by the options.opened property function.
      //
      modal.bind( 'reveal:opened.reveal', options.opened );
      //
      // Bind the modal 'close' event.
      // Handled by the options.close property function.
      //
      modal.bind( 'reveal:close.reveal', options.close );
      //
      // Bind the modal 'closed' event.
      // Handled by the options.closed property function.
      //
      modal.bind( 'reveal:closed.reveal', options.closed );

      //
      // We're running this for the first time.
      // Trigger the modal 'open' event.
      //
      modal.trigger( 'reveal:open' );




      //
      // Get the closeButton variable element(s).
      //
     $closeButton = $( '.' + options.dismissModalClass )
     //
     // Bind the element 'click' event and handler.
     //
     .bind( 'click.reveal', function () {
        //
        // Trigger the modal 'close' event.
        //
        modal.trigger( 'reveal:close' );

      });


      //
      // Get the closeButton variable element(s).
      //
     $mCloseButton = $( '.closeModal' )
     //
     // Bind the element 'click' event and handler.
     //
     .bind( 'click.reveal', function () {
        //
        // Trigger the modal 'close' event.
        //
        modal.trigger( 'reveal:close' );

      });

     //
     // Should we close the modal background on click?
     //
     if ( options.closeOnBackgroundClick ) {
      //
      // Yes, close the modal background on 'click'
      // Set the modal background css 'cursor' propety to pointer.
      // Adds a pointer symbol when you mouse over the modal background.
      //
      modalBg.css( { "cursor": "pointer" } );
      //
      // Bind a 'click' event handler to the modal background.
      //
      modalBg.bind( 'click.reveal', function () {
        //
        // Trigger the modal 'close' event.
        //
        modal.trigger( 'reveal:close' );

      });

     }

     //
     // Bind keyup functions on the body element.
     // We'll want to close the modal when the 'escape' key is hit.
     //
     $( 'body' ).bind( 'keyup.reveal', function ( event ) {
      //
      // Did the escape key get triggered?
      //
       if ( event.which === 27 ) { // 27 is the keycode for the Escape key
         //
         // Escape key was triggered.
         // Trigger the modal 'close' event.
         //
         modal.trigger( 'reveal:close' );
       }

      }); // end $(body)

    }); // end this.each

  }; // end $.fn

} ( jQuery ) );