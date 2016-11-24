/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(1);

	(function ($) {
	  $(function () {
	    jQuery.fn.visible = function () {
	      return this.css('visibility', 'visible');
	    };

	    jQuery.fn.invisible = function () {
	      return this.css('visibility', 'hidden');
	    };

	    jQuery.fn.visibilityToggle = function () {
	      return this.css('visibility', function (i, visibility) {
	        return visibility == 'visible' ? 'hidden' : 'visible';
	      });
	    };

	    $.fn.richarea = function (options) {
	      var $e = $(this);
	      $e.hide();

	      var $root = $("<div class='richarea'>" + "<div class=\"richarea-editor\">\n  <ul class=\"sortable\">\n    <li :class=\"{active: currentIdx==index }\" :data-index=\"index\" @click=\"select\" @dblclick=\"edit\" v-for=\"(item,index) in items\">\n      <div class=\"tools\">\n        <span class=\"move btn btn-success btn-xs glyphicon glyphicon-resize-vertical\"></span>\n        <span @click=\"add(index)\" class=\"add btn btn-default btn-xs glyphicon glyphicon-plus\"></span>\n        <span @click=\"edit\" class=\"settings btn btn-default btn-xs glyphicon glyphicon-cog\"></span>\n        <span @click=\"duplicate\" class=\"duplicate btn btn-default btn-xs glyphicon glyphicon-duplicate\"></span>\n        <span @click=\"remove\" class=\"delete btn btn-danger btn-xs glyphicon glyphicon-remove\"></span>\n      </div>\n      <div class=\"item\">\n        <layout :forms=\"forms\" :is=\"'c'+item.layout_id\" :item=\"item\"></layout>\n      </div>\n    </li>\n    <li class=\"disabled add text-center\">\n      <button @click.prevent=\"add(null)\" class=\"btn btn-primary btn-xl\">+</button>\n    </li>\n  </ul>\n  <div class=\"modal fade layout-settings\" role=\"dialog\">\n    <div class=\"modal-dialog\" role=\"document\">\n      <div class=\"modal-content\">\n        <div class=\"modal-header\">\n          <button class=\"close\" @click=\"close\">\n            <span class=\"glyphicon glyphicon-remove\"></span>\n          </button>\n          <h4 class=\"modal-title\">Edit Component</h4>\n        </div>\n        <div class=\"modal-body\">\n          <template v-if=\"currentLayout\">\n            <template v-if=\"Object.keys(currentLayout.fields).length>0\">\n              <div v-for=\"(field,fieldName) in currentLayout.fields\">\n                <div class=\"form-horizontal\">\n                  <div class=\"form-group\">\n                    <label class=\"col-xs-2 control-label\">{{fieldName | titlecase}}</label>\n                    <div class=\"col-xs-10\">\n                      <div v-if=\"field.editor=='text'\">\n                        <input class=\"form-control\" type=\"text\" v-model=\"currentItem.data[fieldName]\"></input>\n                      </div>\n                      <div v-if=\"field.editor=='textarea'\">\n                        <textarea class=\"form-control\" rows=\"3\" v-model=\"currentItem.data[fieldName]\"></textarea>\n                      </div>\n                      <div v-if=\"field.editor=='link'\">\n                        <input class=\"form-control\" type=\"text\" v-model=\"currentItem.data[fieldName].href\"></input>\n                        <input class=\"form-control\" type=\"text\" v-model=\"currentItem.data[fieldName].display\"></input>\n                      </div>\n                      <div v-if=\"field.editor=='image'\">\n                        <div :data-field=\"fieldName\" class=\"image-editor\">\n                          <input accept=\"image/gif,image/png,image/jpeg\" class=\"cropit-image-input\" type=\"file\"></input>\n                          <img :src=\"currentItem.data[fieldName].croppedImage\" class=\"reference\" style=\"width:100%; display: none\"/>\n                          <div class=\"cropit-preview\"></div>\n                          <input class=\"cropit-image-zoom-input\" type=\"range\"></input>\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </template>\n            <template v-else>\n              There are no fields to edit for this layout.\n            </template>\n          </template>\n        </div>\n        <div class=\"modal-footer\">\n          <button class=\"btn btn-default\"  @click=\"close\">Close</button>\n        </div>\n      </div>\n    </div>\n  </div>\n  \n  <div class=\"modal modal-fullscreen fade layouts-modal\" role=\"dialog\">\n    <div class=\"modal-dialog layout-selector\" role=\"document\">\n      <div class=\"modal-content\">\n        <div class=\"modal-header\">\n          <button class=\"close\" data-dismiss=\"modal\">\n            <span class=\"glyphicon glyphicon-remove\"></span>\n          </button>\n          <h4 class=\"modal-title\">Add Component</h4>\n        </div>\n        <div class=\"modal-body\">\n          <div>\n            <div :class=\"{'btn-success': selectedCategory == cat[0], 'btn-primary': selectedCategory != cat[0] }\" @click=\"selectCat(cat)\" class=\"btn btn-xs\" style=\"margin: 2px;\" v-for=\"cat in layoutCategories\">\n              {{cat[1]}}\n            </div>\n          </div>\n          <img class=\"layout\" data-dismiss=\"modal\" :data-layout-id=\"layout.id\" :src=\"layout.thumb\" v-for=\"(layout,index) in layouts\" v-if=\"inActiveCategories(layout)\" v-on:click=\"insert(layout.id)\"/>\n        </div>\n        <div class=\"modal-footer\">\n          <button class=\"btn btn-default\" data-dismiss=\"modal\">Close</button>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  \n</div>\n" + "</div>");
	      $e.after($root);

	      var RichAreaVueFactory = __webpack_require__(2);
	      options = $.extend(true, {}, {
	        root: $root,
	        items: []
	      }, options);
	      RichAreaVueFactory.create(options);
	    };
	  });
	})(jQuery);

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Array.prototype.move = function (old_index, new_index) {
	    if (old_index == new_index) return this;
	    if (new_index >= this.length) {
	        var k = new_index - this.length;
	        while (k-- + 1) {
	            this.push(undefined);
	        }
	    }
	    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	    return this; // for testing purposes
	};

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var RichAreaVueFactory = function () {
	  function RichAreaVueFactory() {
	    _classCallCheck(this, RichAreaVueFactory);
	  }

	  _createClass(RichAreaVueFactory, null, [{
	    key: 'create',
	    value: function create(options) {
	      options = $.extend(true, {}, {
	        layoutCategories: [],
	        userForms: [],
	        imageUploadUrl: null,
	        layouts: [],
	        items: []
	      }, options);

	      if (Object.keys(options.layouts).length == 0) {
	        throw new TypeError("You must define at least one layout.");
	      }

	      Object.keys(options.layouts).forEach(function (cid) {
	        var c = options.layouts[cid];
	        Vue.component('c' + c.id, {
	          props: ['item', 'forms'],
	          template: "<div class='layout-container'>" + c.template + "</div>",
	          filters: {
	            embedify: function embedify(url) {
	              function getId(url) {
	                var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
	                var match = url.match(regExp);

	                if (match && match[2].length == 11) {
	                  return match[2];
	                } else {
	                  return 'error';
	                }
	              }
	              var myId = getId(url);

	              return '//www.youtube.com/embed/' + myId;
	            },
	            linebreak: function linebreak(v) {
	              return v.replace("\n", "<br/>");
	            }
	          }
	        });
	      });

	      function ensureDefaultValues(item) {
	        var _this = this;

	        if (item instanceof Array) {
	          item.forEach(function (item) {
	            _this.ensureDefaultValues(item);
	          });
	          return item;
	        }
	        $.extend(true, item, { data: {} });
	        var layout = options.layouts[item.layout_id];
	        if (!layout) return;
	        var fields = layout.fields;
	        Object.keys(fields).forEach(function (key) {
	          if (key in item.data) return;
	          item.data[key] = fields[key].defaultValue;
	        });
	        return item;
	      }

	      var items = ensureDefaultValues($.extend(true, [], options.items));

	      function $editor() {
	        return $(options.root).find('.richarea-editor');
	      }

	      function $sortable() {
	        return $editor().find('.sortable');
	      }

	      var app = new Vue({
	        el: $editor().get(0),
	        data: {
	          content: null,
	          itemsJson: null,
	          currentIdx: null,
	          $currentLayout: null,
	          items: items,
	          layouts: options.layouts,
	          layoutCategories: options.layoutCategories,
	          selectedCategory: 0,
	          forms: options.userForms,
	          isCropperInitialized: false
	        },
	        computed: {
	          currentItem: function currentItem() {
	            return this.items[this.currentIdx];
	          },
	          currentLayout: function currentLayout() {
	            var currentItem = this.items[this.currentIdx];
	            if (!currentItem) return null;
	            return this.layouts[currentItem.layout_id];
	          }
	        },
	        filters: {
	          titlecase: function titlecase(text) {
	            var result = text.replace(/([A-Z])/g, " $1");
	            var finalResult = result.charAt(0).toUpperCase() + result.slice(1);
	            return finalResult;
	          },
	          jsonify: function jsonify(obj) {
	            return JSON.stringify(obj);
	          }
	        },
	        watch: {
	          currentIdx: function currentIdx(v) {
	            this.isCropperInitialized = false;
	            this.$nextTick(function () {
	              $sortable().find('.tools').hide();
	              if (v == null) return;
	              $sortable().find('li.active .tools').show();
	            });
	          },
	          items: {
	            handler: function handler(v, old) {
	              this.calc();
	            },
	            deep: true
	          }
	        },
	        methods: {
	          add: function add(idx) {
	            this.currentIdx = idx;
	            var $modal = $editor().find('.layouts-modal');
	            $modal.modal('show');
	          },
	          selectCat: function selectCat(cat) {
	            this.selectedCategory = cat[0];
	          },
	          inActiveCategories: function inActiveCategories(layout) {
	            if (this.selectedCategory == -1) return true;
	            for (var i = 0; i < layout.categories.length; i++) {
	              var id = layout.categories[i];
	              if (this.selectedCategory == id) return true;
	            }
	            return false;
	          },
	          notifyChange: function notifyChange() {
	            if (!options.onChange) return;
	            options.onChange({ html: this.content, data: this.items });
	          },
	          close: function close() {
	            $editor().find('.modal.in').modal('hide');
	            this.calc();
	          },
	          calc: function calc() {
	            var _this2 = this;

	            this.$nextTick(function () {
	              if ($editor().find('.modal.layout-settings.in').length > 0) return; // Suspend calculations while modal is one.
	              _this2.calcContent();
	              _this2.calcJson();
	              _this2.notifyChange();
	            });
	          },
	          calcJson: function calcJson() {
	            this.itemsJson = JSON.stringify(this.items);
	          },
	          calcContent: function calcContent() {
	            var htmls = [];
	            $sortable().find('.item .layout-container').each(function (idx, e) {
	              var $e = $(e).clone();
	              $e.find('[data-render]').each(function (idx, e) {
	                var $e = $(e);
	                $e.replaceWith($e.data('render'));
	              });
	              ['data-editor', 'data-field', 'data-default-value'].forEach(function (attr) {
	                $e.find('[' + attr + ']').removeAttr(attr);
	              });
	              var html = $e.html();
	              htmls.push(html);
	            });
	            var $container = $('<div>').addClass('richarea');
	            $container.html(htmls.join('\n'));
	            this.content = $container.get(0).outerHTML;
	          },
	          select: function select(event) {
	            var $li = $(event.target).closest('li');
	            this.currentIdx = $li.index();
	            this.$currentLayout = $li;
	          },
	          insert: function insert(layout_id) {
	            var o = ensureDefaultValues({ layout_id: layout_id });
	            var idx = $sortable().find('li.active').index();
	            if (idx >= 0) {
	              this.items.splice(idx, 0, o);
	              this.currentIdx = idx;
	            } else {
	              this.items.push(o);
	              this.currentIdx = this.items.length - 1;
	            }
	          },
	          edit: function edit(event) {
	            var $modal = $editor().find('.layout-settings');
	            $modal.modal('show');
	          },
	          initCropper: function initCropper(event) {
	            var _this3 = this;

	            var $modal = $editor().find('.layout-settings');
	            $modal.on('show.bs.modal', function () {
	              if (_this3.isCropperInitialized) return;
	              $modal.find('.image-editor').invisible();
	            });
	            $modal.on('shown.bs.modal', function () {
	              if (_this3.isCropperInitialized) return;

	              $modal.find('.image-editor').each(function (idx, e) {
	                var $e = $(e);
	                var $r = $(e).find('.reference');
	                var w = Math.floor($r.actual('width'));
	                var h = Math.floor($r.actual('height'));
	                var $export = $e.find('.export');
	                var fieldName = $e.data('field');
	                var shouldSave = false;
	                $e.cropit({
	                  exportZoom: $r.get(0).naturalWidth / w,
	                  imageBackground: false,
	                  imageBackgroundBorderWidth: 0,
	                  initialZoom: 'fill',
	                  width: w,
	                  height: h,
	                  maxZoom: 5,
	                  onFileReadError: function onFileReadError() {
	                    console.log('onFileReadError', arguments);
	                  },
	                  onImageError: function onImageError() {
	                    console.log('onImageError', arguments);
	                  },
	                  smallImage: 'allow', // Allow images that must be zoomed to fit
	                  onImageLoaded: function onImageLoaded() {
	                    if (!_this3.isCropperInitialized) {
	                      $e.cropit('zoom', _this3.currentItem.data[fieldName].zoom);
	                      $e.cropit('offset', _this3.currentItem.data[fieldName].offset);
	                      _this3.isCropperInitialized = true;
	                      $modal.find('.image-editor').visible();
	                    } else {
	                      shouldSave = true;
	                      var $fileInput = $e.find('[type=file]');
	                      var file = $fileInput.get(0).files[0];
	                      fr = new FileReader();
	                      fr.onload = function () {
	                        if (!options.imageUploadUrl) return;
	                        $.post(options.imageUploadUrl, {
	                          data: fr.result
	                        }, function (data, status) {
	                          console.log([data, status]);
	                          if (status == 'success' && data.status == 'success') {
	                            _this3.items[_this3.currentIdx].data[fieldName].originalImage = data.url;
	                            _this3.items[_this3.currentIdx].data[fieldName].croppedImage = data.url;
	                          }
	                        });
	                      };
	                      fr.readAsDataURL(file);
	                      _this3.$currentLayout.find('[data-field=' + fieldName + ']').attr('src', $e.cropit('export'));
	                    }
	                  },
	                  onZoomChange: function onZoomChange() {
	                    if (!_this3.isCropperInitialized) return;
	                    shouldSave = true;
	                    _this3.items[_this3.currentIdx].data[fieldName].zoom = $e.cropit('zoom');
	                    _this3.$currentLayout.find('[data-field=' + fieldName + ']').attr('src', $e.cropit('export'));
	                  },
	                  onOffsetChange: function onOffsetChange() {
	                    if (!_this3.isCropperInitialized) return;
	                    shouldSave = true;
	                    var o = $e.cropit('offset');
	                    _this3.items[_this3.currentIdx].data[fieldName].offset = { x: Math.floor(o.x), y: Math.floor(o.y) };
	                    _this3.$currentLayout.find('[data-field=' + fieldName + ']').attr('src', $e.cropit('export'));
	                  }
	                });
	                $e.cropit('imageSrc', _this3.items[_this3.currentIdx].data[fieldName].originalImage);

	                $modal.on('hide.bs.modal', function () {
	                  if (!shouldSave) return;
	                  if (!options.imageUploadUrl) return;
	                  $.post(options.imageUploadUrl, {
	                    data: $e.cropit('export')
	                  }, function (data, status) {
	                    console.log([data, status]);
	                    if (status == 'success' && data.status == 'success') {
	                      _this3.items[_this3.currentIdx].data[fieldName].croppedImage = data.url;
	                    }
	                  });
	                });
	              });
	            });
	          },
	          duplicate: function duplicate(event) {
	            this.items.splice(this.currentIdx, 0, $.extend(true, {}, this.items[this.currentIdx]));
	          },
	          remove: function remove(event) {
	            var ret = confirm('Are you sure you want to delete this item?');
	            if (!ret) return;
	            this.items.splice(this.currentIdx, 1);
	            this.currentIdx = null;
	          }

	        },
	        mounted: function mounted() {
	          var _this4 = this;

	          this.calc();
	          $editor().show();
	          $sortable().sortable({
	            placeholder: "alert alert-warning",
	            items: 'li:not(.disabled)',
	            handle: '.move',
	            helper: 'clone',
	            stop: function stop(event, ui) {
	              ui.placeholder.height(ui.item.height());
	              ui.placeholder.width(ui.item[0].offsetWidth);
	              var $e = $(ui.item);
	              var oidx = $e.data('index');
	              var nidx = $e.index();
	              _this4.items.move(oidx, nidx);
	              _this4.currentIdx = nidx;
	              $sortable().sortable('cancel');
	            },
	            cursor: 'move'
	          });
	          this.initCropper();
	          if ($.prototype.fullscreen) {
	            $editor().find('.layouts-modal').fullscreen();
	          }
	        }
	      });
	    }
	  }]);

	  return RichAreaVueFactory;
	}();

	module.exports = RichAreaVueFactory;

/***/ }
/******/ ]);