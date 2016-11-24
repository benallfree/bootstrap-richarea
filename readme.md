# RichArea Content Editor for Bootstrap

RichArea offers a component-based approach to editing layouts and content in a WYSIWYG fashion. Instead of allowing the user complete control over markup and layout like a standard WYSIWYG editor, RichArea takes a different approach: it uses layout components where the layout is fixed but the content is editable.

RichArea comes with 300 responsive layout components with built-in support for editing:

* Text
* Images
* Video embeds

Features:

* Full WYSIWYG content editing
* Retrieve both HTML output and RichArea content data structures
* Render components 


In addition, use RichArea extensions for even more components and functionality:

* RichArea Server Side Images

## Quickstart

See the [Codepen demo]().

    npm require --save-dev bootstrap-richarea

This plugin requires Bootstrap 3 or 4 CSS and JS, jQuery, and Vue. These are not bundled with RichArea.

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.5/css/bootstrap.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha.5/js/bootstrap.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/vue/2.1.0/vue.min.js"></script>    

Then:

    <script src="https://cdn.jsdelivr.net/bootstrap-modal-fullscreen/1.0.0/bootstrap-richarea.min.js"></script>


## Usage

### Creating

    <textarea id="richarea"></textarea>
    
    $(function() {
      $('#richarea').richarea();
    });

### Getting Data

To get HTML and layout data:

    $('#richarea').richarea('html');
    $('#richarea').richarea('data');

### Events

To get notified when content changes:

    $('#richarea').richarea({
      onChange: function()
      {
        console.log($(this).richarea('data'));
        console.log($(this).richarea('html'));
      }
    });

### Custom Layouts

To use a custom set of layouts (please note, you are responsible for loading them however you need to):

    var myLayouts = {...};
    $('#richarea').richarea({
      layouts: myLayouts,
    });


### Custom Categories

To use a custom set of categories:

    var mycats = [...];
    $('#richarea').richarea({
      categories: myCats,
    });

### Images

By default, images are stored as Data URLs in `richarea('html')`. If you want RichArea to upload them to your server instead, use this:

    $('#richarea').richarea({
      imageUploadUrl: '/my/upload/handler',
    });

RichArea will `POST` to the URL specified and expects back a JSON response:

    {
      status: "success|error",
      url: "/path/to/image/on/server.png",
    }


## Customizing CSS

If you're using a Bootstrap theme and can build your own RichArea CSS, include your `variables.scss` and then `./src/sass/_richarea.scss`.

It might be easier though just to override RichArea's color choices:

    .richarea
    {
      &.richarea-editor {
        ul.sortable {
          li {
            .tools {
              background: rgba($gray, 0.2);
            }
            &.active {
              .item
              {
                &:after
                {
                  background: rgba($gray-lighter, 0.44);
                }
              }
            }
          }      
        }
        .modal-body.component-selector {
          background-color: $gray-lighter;
          color: $gray-darker;
        }
        img {
          &.component {
            border: 1px solid $gray-lighter;
          }
        }  
      }
    }

Or just the plain old CSS:

    .richarea.richarea-editor ul.sortable li .tools {
      background: rgba(85, 85, 85, 0.2); }
      
    .richarea.richarea-editor ul.sortable li.active .item:after {
      background: rgba(238, 238, 238, 0.44); }
    
    .richarea.richarea-editor .modal-body.component-selector {
      background-color: #eeeeee;
      color: #222222; }
      
    .richarea.richarea-editor img.component {
      border: 1px solid #eeeeee; }

## Building

gulp
