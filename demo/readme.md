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

To build RichArea and accompanying JS:

    npm install
    gulp


Thumbnails are a separate task because they take so long.

    brew install imagemagick
    brew install graphicsmagick
    gulp thumbnails

## Extending

RichArea is extensible in two main ways:

1. New layouts
2. New editable data types

By default, RichArea includes about 30 layouts `text`, `textarea`, and `image` editors. You can do a lot with these, but in some cases, you may want more layouts and field types.

For example, the `richarea-all-layouts` package contains 300 layouts and the `richarea-image-cropper` extension replaces the default image editor with a much more capable one (but which requires additional dependencies).

### Creating New Layouts

Making a new layout is easy. See `samples/example3.html`.

    $(function() {
      $('#richarea').richarea({
        extraLayouts: [
          {
            id: 'my-header',
            thumb: '/path/to/my/image.png',
            fields: {
              myFieldName: {
                editor: 'text',
                defaultValue: 'Hello, world',
              },
            },
            categories: [0],
            template: `
              <h1>This is Ben's Header. Don't mess with it.</h1>
              <h2>{{ item.data.myFieldName }}</h2>
            `
          }
        ]
      });
    });    

### Creating New Editors

Making new editors requires making a [local Vue component](https://vuejs.org/v2/guide/components.html#Local-Registration). Here is a sample editor and a layout that uses it.

    <div id="richarea"></div>
    
    $(function() {
      // Define the display layout for a street address
      let addressLayout = {
        id: 'bca-address',                                // Something unique, I prefix all my custom layouts with my initials
        thumb: '/path/to/my/image/or/base64/data/url',    // The sample image of what this layout looks like
        fields: {                                         // The field default values are what will appear in the 
          street1: {                                      // editor when the layout is first placed there.
            editor: 'text',
            defaultValue: '123 Mayberry Drive',
          },
          street2: {
            editor: 'text',
            defaultValue: 'Unit 432',
          },
          city: {
            editor: 'text',
            defaultValue: 'Reno',
          },
          state: {
            editor: 'text',
            defaultValue: 'NV',
          },
          zip: {
            editor: 'text',
            defaultValue: '89519',
          },
        },
        // The most important part - what this layout looks like!
        // All tempaltes must have a single root node - I use <div>
        template: `                                       
          <div>
            <div v-if="item.data.street1">
              <b>{{ item.data.street1 }}</b>
            </div>
            <div v-if="item.data.street2">
              {{ item.data.street2 }}
            </div>
            <div>
              {{ item.data.city }}<span v-if="item.data.street1 && (item.data.state || item.data.zip)">, </span>{{item.data.state}}<span v-if="item.data.state && item.data.zip">&nbsp;&nbsp;</span>{{item.data.zip}}
            </div>
          </div>
        `
      };
      
      // This is the data for a locally-registere Vue component. Add all your logic, functions, and event handling here.
      let addressVueComponent = {
        props: ['item', 'fieldName'],
        template: `
          <div>
            <input type="text" placeholder="Street 1" v-model="item.data[fieldName].street1" />
            <br/>
            <input type="text" placeholder="Street 2" v-model="item.data[fieldName].street2" />
            <br/>
            <input type="text" placeholder="City" v-model="item.data[fieldName].city" />
            <br/>
            <input type="text" placeholder="State" v-model="item.data[fieldName].state" />
            <br/>
            <input type="text" placeholder="Zip" v-model="item.data[fieldName].zip" />
            <br/>
        `,
        data: {},
        mounted: {},
        calculated: {},
      };
          
      
      $('#richarea').richarea({
        additionalEditors: {
          address: addressVueComponent,
        },
        additionalLayouts: {
        }
      })
    });
