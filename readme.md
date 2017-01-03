# RichArea Content Editor for Bootstrap

RichArea offers a component-based approach to editing layouts and content in a WYSIWYG fashion. Instead of allowing the user complete control over markup and layout like a standard WYSIWYG editor, RichArea takes a different approach: it uses layout components where the layout is fixed but the content is editable via either standard text/textarea, Markdown, or more advanced controls.

RichArea comes with 300 responsive layout components with these edit controls:

* Text
* Text area
* Markdown area
* Images
* YouTube video embeds
* Dropdown lists
* Hyperlinks

Features:

* Full WYSIWYG content editing
* Retrieve both HTML output and RichArea content data structures
* Render mobile-first Bootstrap components 

## Quickstart

RichArea is designed to be used with Webpack. It does not contain a distribution file. See the RichArea Starter Kit for a working demo:

     git clone git@github.com:benallfree/bootstrap-richarea-starter.git
     cd bootstrap-richarea-starter
     npm run build

### Creating

    <div id="richarea"></div>
    
    RichArea.create({
      container: document.getElementById('richarea'),
    });

### Events

To get notified when content changes:

    RichArea.create({
      onChange: function(content)
      {
        console.log(content.html); // Plain HTML rendering
        console.log(content.data); // Item data array (JSON compatible)
      }
    });

### Custom Layouts

To use a custom set of layouts (please note, you are responsible for loading them however you need to):

    var myLayouts = {...};
    RichArea.create({
      layouts: myLayouts,
    });

### Custom Categories

To use a custom set of categories:

    var mycats = [...];
    RichArea.create({
      categories: myCats,
    });

### Images

If you want RichArea to upload them to your server instead, use this:

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

RichArea is built via Webpack. See the RichArea Starter Kit for details.

### Generating Thumbnails:

    brew install imagemagick
    brew install graphicsmagick
    node ./scripts/thumbnails.js

