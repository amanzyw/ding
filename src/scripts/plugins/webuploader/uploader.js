$(document).ready(function(){


    var $window = $(window),
        Cropper = function(element, options) {
            options = $.isPlainObject(options) ? options : {};
            this.$image = $(element);
            this.defaults = $.extend({}, Cropper.defaults, this.$image.data(), options);
            this.init();
        };

    Cropper.prototype = {
        construstor: Cropper,

        init: function() {
            this.setAspectRatio(this.defaults.aspectRatio);
            this.render();
        },

        render: function(callback) {
            var that = this,
                $image = this.$image,
                $clone,
                src;

            if (this.active) {
                return;
            }

            if (this.$clone) {
                this.$clone.remove(); // Remove the old clone
            }

            src = $image.attr("src"); // Don't use "prop"
            $clone = $('<img src="' + src + '">');

            $clone.on("load", function() {
                var image;

                $clone.off("load");

                if (this.naturalWidth && this.naturalHeight) {
                    image = {
                        naturalHeight: this.naturalHeight,
                        naturalWidth: this.naturalWidth
                    };
                } else {
                    Cropper.fn.size($clone, {
                        height: "auto",
                        width: "auto"
                    });

                    image = Cropper.fn.size($clone);
                    image = {
                        naturalHeight: image.height,
                        naturalWidth: image.width
                    };
                }

                Cropper.fn.size($clone, {
                    height: "100%",
                    width: "100%"
                });

                image.aspectRatio = image.naturalWidth / image.naturalHeight;
                that.src = src;
                that.image = image;
                that.active = true;
                that.createCropper();
            });

            if ($.isFunction(callback)) {
                $image.on("ready.cropper", callback);
            }

            this.$clone = $clone;
            $image.after($clone);
        },

        unrender: function() {
            if (this.active) {
                this.active = false;
                this.removeCropper();
                this.src = "";
                this.image = null;
                this.cropper = null;
                this.dragger = null;
            }
        },

        rerender: function() {
            this.unrender();
            this.render();
        },

        resize: function() {
            clearTimeout(this.resizing);
            this.resizing = setTimeout($.proxy(this.rerender, this), 200);
        },

        createCropper: function() {
            this.$cropper = $(Cropper.template);
            this.$dragger = this.$cropper.find(".cropper-dragger");
            Cropper.fn.toggle(this.$image);
            this.$image.after(this.$cropper);
            this.$cropper.prepend(this.$clone);

            if (!this.defaults.modal) {
                Cropper.fn.toggle(this.$cropper.find(".cropper-modal"));
            }

            this.setPreview();
            this.addListener();
        },

        removeCropper: function() {
            this.removeListener();
            this.$preview = null;
            this.$clone.remove();
            this.$clone = null;
            this.$dragger = null;
            this.$cropper.remove();
            this.$cropper = null;
            Cropper.fn.toggle(this.$image);
        },

        addListener: function() {
            this.$cropper.bind("mousedown touchstart", $.proxy(this.dragstart, this));
            this.$cropper.bind("mousemove touchmove", $.proxy(this.dragmove, this));
            this.$cropper.bind("mouseup mouseleave touchend touchleave", $.proxy(this.dragend, this));
            $window.on("resize", $.proxy(this.resize, this));
        },

        removeListener: function() {
            this.$cropper.unbind("mousedown touchstart", this.dragstart);
            this.$cropper.unbind("mousemove touchmove", this.dragmove);
            this.$cropper.unbind("mouseup mouseleave touchend touchleave", this.dragend);
            $window.off("resize", this.resize);
        },

        setPreview: function() {
            var preview = this.defaults.preview;

            this.$preview = this.$cropper.find(".cropper-preview");

            if (typeof preview === "string" && preview.length > 0) {
                this.$preview = this.$preview.add(preview);
            }

            this.$preview.html('<img src="' + this.src + '">');
            this.setCropper();
        },

        setCropper: function() {
            var $container = this.$image.parent(),
                container = Cropper.fn.size($container),
                image = this.image,
                cropper;

            if (((image.naturalWidth * container.height / image.naturalHeight) - container.width) >= 0) {
                cropper = {
                    height: container.width / image.aspectRatio,
                    width: container.width,
                    left: 0
                };

                cropper.top = (container.height - cropper.height) / 2;
            } else {
                cropper = {
                    height: container.height,
                    width: container.height * image.aspectRatio,
                    top: 0
                };

                cropper.left = (container.width - cropper.width) / 2;
            }

            $.each(cropper, function(i, n) {
                cropper[i] = Math.round(n);
            });

            image.height = cropper.height;
            image.width = cropper.width;
            image.ratio = image.width / image.naturalWidth;

            Cropper.fn.position($container);
            this.$cropper.css({
                height: cropper.height,
                left: cropper.left,
                top: cropper.top,
                width: cropper.width
            });

            this.cropper = cropper;
            this.setDragger();
        },

        setDragger: function() {
            var cropper = this.cropper,
                // If not set, use the original aspect ratio of the image.
                aspectRatio = this.defaults.aspectRatio || this.image.aspectRatio,
                dragger;
            if (((cropper.height * aspectRatio) - cropper.width) >= 0) {
                dragger = {
                    height: cropper.width / aspectRatio,
                    width: cropper.width,
                    left: 0,
                    top: (cropper.height - (cropper.width / aspectRatio)) / 2,
                    maxWidth: cropper.width,
                    maxHeight: cropper.width / aspectRatio
                };
            } else {
                dragger = {
                    height: cropper.height,
                    width: cropper.height * aspectRatio,
                    left: (cropper.width - (cropper.height * aspectRatio)) / 2,
                    top: 0,
                    maxHeight: cropper.height,
                    maxWidth: cropper.height * aspectRatio
                };
            }

            dragger.height *= 0.8;
            dragger.width *= 0.8;

            dragger.left = (cropper.width - dragger.width) / 2;
            dragger.top = (cropper.height - dragger.height) / 2;

            this.dragger = Cropper.fn.round(dragger);
            this.setData(this.defaults.data);
            this.$image.trigger("ready.cropper").off("ready.cropper");
        },

        resetDragger: function() {
            var dragger = this.dragger,
                cropper = this.cropper;

            dragger.width = dragger.width > dragger.maxWidth ? dragger.maxWidth : Math.abs(dragger.width);
            dragger.height = dragger.height > dragger.maxHeight ? dragger.maxHeight : Math.abs(dragger.height);

            dragger.maxLeft = cropper.width - dragger.width;
            dragger.maxTop = cropper.height - dragger.height;

            dragger.left = dragger.left < 0 ? 0 : dragger.left > dragger.maxLeft ? dragger.maxLeft : dragger.left;
            dragger.top = dragger.top < 0 ? 0 : dragger.top > dragger.maxTop ? dragger.maxTop : dragger.top;

            dragger = Cropper.fn.round(dragger);

            this.$dragger.css({
                height: dragger.height,
                left: dragger.left,
                top: dragger.top,
                width: dragger.width
            });

            this.dragger = dragger;
            this.preview();
            this.output();
        },

        dragging: function() {
            var direction = this.direction,
                dragger = this.dragger,
                aspectRatio = this.defaults.aspectRatio,
                range = {
                    x: this.endX - this.startX,
                    y: this.endY - this.startY
                };

            if (aspectRatio) {
                range.X = range.y * aspectRatio;
                range.Y = range.x / aspectRatio;
            }

            switch (direction) {

                // dragging
                case "e":
                    dragger.width += range.x;

                    if (aspectRatio) {
                        dragger.height = dragger.width / aspectRatio;
                        dragger.top -= range.Y / 2;
                    }

                    if (dragger.width < 0) {
                        this.direction = "w";
                        dragger.width = 0;
                    }

                    break;

                case "n":
                    dragger.height -= range.y;
                    dragger.top += range.y;

                    if (aspectRatio) {
                        dragger.width = dragger.height * aspectRatio;
                        dragger.left += range.X / 2;
                    }

                    if (dragger.height < 0) {
                        this.direction = "s";
                        dragger.height = 0;
                    }

                    break;

                case "w":
                    dragger.width -= range.x;
                    dragger.left += range.x;

                    if (aspectRatio) {
                        dragger.height = dragger.width / aspectRatio;
                        dragger.top += range.Y / 2;
                    }

                    if (dragger.width < 0) {
                        this.direction = "e";
                        dragger.width = 0;
                    }

                    break;

                case "s":
                    dragger.height += range.y;

                    if (aspectRatio) {
                        dragger.width = dragger.height * aspectRatio;
                        dragger.left -= range.X / 2;
                    }

                    if (dragger.height < 0) {
                        this.direction = "n";
                        dragger.height = 0;
                    }

                    break;

                case "ne":
                    dragger.height -= range.y;
                    dragger.top += range.y;

                    if (aspectRatio) {
                        dragger.width = dragger.height * aspectRatio;
                    } else {
                        dragger.width += range.x;
                    }

                    if (dragger.height < 0) {
                        this.direction = "sw";
                        dragger.height = 0;
                        dragger.width = 0;
                    }

                    break;

                case "nw":
                    dragger.height -= range.y;
                    dragger.top += range.y;

                    if (aspectRatio) {
                        dragger.width = dragger.height * aspectRatio;
                        dragger.left += range.X;
                    } else {
                        dragger.width -= range.x;
                        dragger.left += range.x;
                    }

                    if (dragger.height < 0) {
                        this.direction = "se";
                        dragger.height = 0;
                        dragger.width = 0;
                    }

                    break;

                case "sw":
                    dragger.width -= range.x;
                    dragger.left += range.x;

                    if (aspectRatio) {
                        dragger.height = dragger.width / aspectRatio;
                    } else {
                        dragger.height += range.y;
                    }

                    if (dragger.width < 0) {
                        this.direction = "ne";
                        dragger.height = 0;
                        dragger.width = 0;
                    }

                    break;

                case "se":
                    dragger.width += range.x;

                    if (aspectRatio) {
                        dragger.height = dragger.width / aspectRatio;
                    } else {
                        dragger.height += range.y;
                    }

                    if (dragger.width < 0) {
                        this.direction = "nw";
                        dragger.height = 0;
                        dragger.width = 0;
                    }

                    break;

                // moving
                default:
                    dragger.left += range.x;
                    dragger.top += range.y;
            }

            this.resetDragger();
            this.startX = this.endX;
            this.startY = this.endY;
        },

        output: function() {
            this.defaults.done(this.getData());
        },

        preview: function() {
            var that = this,
                cropper = that.cropper,
                dragger = that.dragger;

            this.$preview.each(function() {
                var $this = $(this),
                    ratio = $this.outerWidth() / dragger.width,
                    styles = {
                        height: cropper.height,
                        marginLeft: - dragger.left,
                        marginTop: - dragger.top,
                        width: cropper.width
                    };

                $this.css({overflow: "hidden"});
                $this.find("img").css(Cropper.fn.round(styles, function(n) {
                    return n * ratio;
                }));
            });
        },

        // Public methods

        enable: function(callback) {
            this.render(callback);
        },

        disable: function() {
            this.unrender();
        },

        setAspectRatio: function(aspectRatio) {
            if (aspectRatio === "auto" || ($.isNumeric(aspectRatio) && aspectRatio > 0)) {
                this.defaults.aspectRatio = aspectRatio === "auto" ? NaN : aspectRatio;

                if (this.active) {
                    this.setDragger();
                }
            }
        },

        setData: function(data) {
            var cropper = this.cropper,
                dragger = this.dragger,
                aspectRatio = this.defaults.aspectRatio,
                isNumber = function(n) {
                    return typeof n === "number";
                };

            if (!this.active) {
                return;
            }

            if ($.isPlainObject(data) && !$.isEmptyObject(data)) {
                data = Cropper.fn.transformData(data, this.image.ratio);

                if (isNumber(data.x1) && data.x1 <= cropper.width) {
                    dragger.left = data.x1;
                }

                if (isNumber(data.y1) && data.y1 <= cropper.height) {
                    dragger.top = data.y1;
                }

                if (aspectRatio){
                    if (isNumber(data.width) && data.width <= cropper.width) {
                        dragger.width = data.width;
                        dragger.height = dragger.width / aspectRatio;
                    } else if (isNumber(data.height) && data.height <= cropper.height) {
                        dragger.height = data.height;
                        dragger.width = dragger.height * aspectRatio;
                    } else if (isNumber(data.x2) && data.x2 <= cropper.width) {
                        dragger.width = data.x2 - dragger.left;
                        dragger.height = dragger.width / aspectRatio;
                    } else if (isNumber(data.y2) && data.y2 <= cropper.height) {
                        dragger.height = data.y2 - dragger.top;
                        dragger.width = dragger.height * aspectRatio;
                    }
                } else {
                    if (isNumber(data.width) && data.width <= cropper.width) {
                        dragger.width = data.width;
                    } else if (isNumber(data.x2) && data.x2 <= cropper.width) {
                        dragger.width = data.x2 - dragger.left;
                    }

                    if (isNumber(data.height) && data.height <= cropper.height) {
                        dragger.height = data.height;
                    } else if (isNumber(data.y2) && data.height <= cropper.height) {
                        dragger.height = data.y2 - dragger.top;
                    }
                }
            }

            this.dragger = dragger;
            this.resetDragger();
        },

        getData: function() {
            var dragger = this.dragger,
                data = {};

            if (this.active) {
                data = {
                    x1: dragger.left,
                    y1: dragger.top,
                    width: dragger.width,
                    height: dragger.height,
                    x2: dragger.left + dragger.width,
                    y2: dragger.top + dragger.height
                };

                data = Cropper.fn.transformData(data, (1 / this.image.ratio));
            }

            return data;
        },

        setImgSrc: function(src) {
            if (typeof src === "string" && src.length > 0 && src !== this.src) {
                this.$image.attr("src", src);
                this.rerender();
            }
        },

        getImgInfo: function() {
            return this.image || {};
        },

        // Public events

        dragstart: function(event) {
            var touches = Cropper.fn.getOriginalEvent(event).touches,
                e = event,
                touching,
                direction;

            if (touches && touches.length === 1) {
                e = touches[0];
                this.touchId = e.identifier;
                touching = true;
            }

            direction = $(e.target).data().direction;

            if (Cropper.fn.isDirection(direction)) {
                this.startX = e.pageX;
                this.startY = e.pageY;
                this.direction = direction;
                this.$image.trigger("dragstart");
                touching && event.preventDefault();
            }
        },

        dragmove: function(event) {
            var touches = Cropper.fn.getOriginalEvent(event).changedTouches,
                e = event,
                touching;

            if (touches && touches.length === 1) {
                e = touches[0];
                touching = true;

                if (e.identifier !== this.touchId) {
                    return;
                }
            }

            if (this.direction) {
                this.$image.trigger("dragmove");
                touching && event.preventDefault();
                this.endX = e.pageX;
                this.endY = e.pageY;
                this.dragging();
            }
        },

        dragend: function(event) {
            var touches = Cropper.fn.getOriginalEvent(event).changedTouches,
                e = event,
                touching;

            if (touches && touches.length === 1) {
                e = touches[0];
                touching = true;

                if (e.identifier !== this.touchId) {
                    return;
                }
            }

            if (this.direction) {
                this.direction = "";
                this.$image.trigger("dragend");
                touching && event.preventDefault();
            }
        }
    };

    // Common methods
    Cropper.fn = {
        toggle: function($e) {
            $e.toggleClass("cropper-hidden");
        },

        position: function($e, option) {
            var position = $e.css("position");

            if (position === "static") {
                $e.css("position", option || "relative");
            }
        },

        size: function($e, options) {
            if ($.isPlainObject(options)) {
                $e.css(options);
            } else {
                return {
                    height: $e.height(),
                    width: $e.width()
                };
            }
        },

        round: function(data, fn) {
            var value,
                i;

            for (i in data) {
                value = data[i];

                if (data.hasOwnProperty(i) && typeof value === "number") {
                    data[i] = Math.round($.isFunction(fn) ? fn(value) : value);
                }
            }

            return data;
        },

        transformData: function(data, ratio) {
            var that = this,
                result = {};

            $.each(data, function(i, n) {
                if (that.isDataOption(i) && $.isNumeric(n) && n >= 0) {
                    result[i] = Math.round(n * ratio);
                }
            });

            return result;
        },

        getOriginalEvent: function(event) {
            if (event && typeof event.originalEvent !== "undefined") {
               event = event.originalEvent;
            }

            return event;
        },

        isDataOption: function(s) {
            return /^(x1|y1|x2|y2|width|height)$/i.test(s);
        },

        isDirection: function(s) {
            return /^(\*|e|n|w|s|ne|nw|sw|se)$/i.test(s);
        }
    };

    Cropper.template = [
        '<div class="cropper-container">',
            '<div class="cropper-modal"></div>',
            '<div class="cropper-dragger">',
                '<span class="cropper-preview"></span>',
                '<span class="cropper-dashed dashed-h"></span>',
                '<span class="cropper-dashed dashed-v"></span>',
                '<span class="cropper-face" data-direction="*"></span>',
                '<span class="cropper-line line-e" data-direction="e"></span>',
                '<span class="cropper-line line-n" data-direction="n"></span>',
                '<span class="cropper-line line-w" data-direction="w"></span>',
                '<span class="cropper-line line-s" data-direction="s"></span>',
                '<span class="cropper-point point-e" data-direction="e"></span>',
                '<span class="cropper-point point-n" data-direction="n"></span>',
                '<span class="cropper-point point-w" data-direction="w"></span>',
                '<span class="cropper-point point-s" data-direction="s"></span>',
                '<span class="cropper-point point-ne" data-direction="ne"></span>',
                '<span class="cropper-point point-nw" data-direction="nw"></span>',
                '<span class="cropper-point point-sw" data-direction="sw"></span>',
                '<span class="cropper-point point-se" data-direction="se"></span>',
            '</div>',
        '</div>'
    ].join("");

    Cropper.defaults = {
        aspectRatio: "auto",
        data: {},
        done: function(/* data */) {},
        modal: true,
        preview: ""
    };

    Cropper.setDefaults = function(options) {
        $.extend(Cropper.defaults, options);
    };

    // Register as jQuery plugin
    $.fn.cropper = function(options, settings) {
        var result = this;
        this.each(function() {
            var $this = $(this),
                data = $this.data("cropper");

            if (!data) {
                data = new Cropper(this, options);
                $this.data("cropper", data);
            }

            if (typeof options === "string" && $.isFunction(data[options])) {
                result = data[options](settings);
            }
        });

        return (typeof result !== "undefined" ? result : this);
    };

    $.fn.cropper.Constructor = Cropper;
    $.fn.cropper.setDefaults = Cropper.setDefaults;

    $(function() {
        $("img[cropper]").cropper({
            defaults:{
                aspectRatio:1
            }
        });
    });


    // -----------------------------------------------------
    // ------------ START ----------------------------------
    // -----------------------------------------------------

    // ---------------------------------
    // ---------  Uploader -------------
    // ---------------------------------
    var Uploader = (function() {

        // -------setting-------
        // 如果使用原始大小，超大的图片可能会出现 Croper UI 卡顿，所以这里建议先缩小后再crop.
        var FRAME_WIDTH = 120;


        var _ = WebUploader;
        var Uploader = _.Uploader;
        var uploaderContainer = $('.uploader-container');
        var uploader, file;

        if ( !Uploader.support() ) {
            alert( 'Web Uploader 不支持您的浏览器！');
            throw new Error( 'WebUploader does not support the browser you are using.' );
        }

        // hook,
        // 在文件开始上传前进行裁剪。
        Uploader.register({
            'before-send-file': 'cropImage'
        }, {

            cropImage: function( file ) {

                var data = file._cropData,
                    image, deferred;

                file = this.request( 'get-file', file );
                deferred = _.Deferred();

                image = new _.Lib.Image();

                deferred.always(function() {
                    image.destroy();
                    image = null;
                });
                image.once( 'error', deferred.reject );
                image.once( 'load', function() {
                    image.crop( data.x, data.y, data.width, data.height, data.scale );
                });

                image.once( 'complete', function() {
                    var blob, size;

                    // 移动端 UC / qq 浏览器的无图模式下
                    // ctx.getImageData 处理大图的时候会报 Exception
                    // INDEX_SIZE_ERR: DOM Exception 1
                    try {
                        blob = image.getAsBlob();
                        size = file.size;
                        file.source = blob;
                        file.size = blob.size;

                        file.trigger( 'resize', blob.size, size );

                        deferred.resolve();
                    } catch ( e ) {
                        // 出错了直接继续，让其上传原始图片
                        deferred.resolve();
                    }
                });

                file._info && image.info( file._info );
                file._meta && image.meta( file._meta );
                image.loadFromBlob( file.source );
                return deferred.promise();
            }
        });

        return {
            init: function( selectCb ) {
                uploader = new Uploader({
                    pick: {
                        id: '#filePicker',
                        multiple: false
                    },

                    // 设置用什么方式去生成缩略图。
                    thumb: {
                        quality: 70,

                        // 不允许放大
                        allowMagnify: false,

                        // 是否采用裁剪模式。如果采用这样可以避免空白内容。
                        crop: false
                    },
                    // 禁掉分块传输，默认是开起的。
                    chunked: false,

                    // 禁掉上传前压缩功能，因为会手动裁剪。
                    compress: false,

                    // fileSingleSizeLimit: 2 * 1024 * 1024,

                    server: '../../server/fileupload.php',
                    swf: './Uploader.swf',
                    fileNumLimit: 1,
                    onError: function() {
                        var args = [].slice.call(arguments, 0);
                        alert(args.join('\n'));
                    }
                });

                uploader.on('fileQueued', function( _file ) {
                    file = _file;

                    uploader.makeThumb( file, function( error, src ) {

                        if ( error ) {
                            alert('不能预览');
                            $("#cancel").trigger("click");
                            return;
                        }

                        selectCb( src );

                    }, FRAME_WIDTH, 1 );   // 注意这里的 height 值是 1，被当成了 100% 使用。
                });
            },

            crop: function( data ) {

                var scale = Croper.getImageSize().width / file._info.width;
                data.scale = scale;

                file._cropData = {
                    x: data.x1,
                    y: data.y1,
                    width: data.width,
                    height: data.height,
                    scale: data.scale
                };
            },

            upload: function() {
                uploader.upload();
            }
        }
    })();

    // ---------------------------------
    // ---------  Crpper ---------------
    // ---------------------------------
    var Croper = (function() {
        var container = $('.cropper-wraper');
        var $image = container.find('.img-container img');
        var btn = $('.upload-btn');
        var isBase64Supported, callback;

        $image.cropper({
            aspectRatio: 1,
            preview: ".img-preview",
            done: function(data) {
                // console.log(data);
            }
        });

        function srcWrap( src, cb ) {

            // we need to check this at the first time.
            if (typeof isBase64Supported === 'undefined') {
                (function() {
                    var data = new Image();
                    var support = true;
                    data.onload = data.onerror = function() {
                        if( this.width != 1 || this.height != 1 ) {
                            support = false;
                        }
                    }
                    data.src = src;
                    isBase64Supported = support;
                })();
            }

            if ( isBase64Supported ) {
                cb( src );
            } else {
                // otherwise we need server support.
                // convert base64 to a file.
                $.ajax('../../server/preview.php', {
                    method: 'POST',
                    data: src,
                    dataType:'json'
                }).done(function( response ) {
                    if (response.result) {
                        cb( response.result );
                    } else {
                        alert("预览出错");
                        $("#cancel").trigger("click");
                    }
                });
            }
        }

        btn.on('click', function() {
            callback && callback($image.cropper("getData"));
            return false;
        });

        return {
            setSource: function( src ) {

                // 处理 base64 不支持的情况。
                // 一般出现在 ie6-ie8
                srcWrap( src, function( src ) {
                    $image.cropper("setImgSrc", src);
                });

                container.removeClass('webuploader-element-invisible');

                return this;
            },

            getImageSize: function() {
                var img = $image.get(0);
                return {
                    width: img.naturalWidth,
                    height: img.naturalHeight
                }
            },

            setCallback: function( cb ) {
                callback = cb;
                return this;
            },

            disable: function() {
                $image.cropper("disable");
                return this;
            },

            enable: function() {
                $image.cropper("enable");
                return this;
            }
        }

    })();


    // ------------------------------
    // -----------logic--------------
    // ------------------------------
    var container = $('.uploader-container');

    Uploader.init(function( src ) {

        Croper.setSource( src );

        // 隐藏选择按钮。
        container.addClass('webuploader-element-invisible');

        // 当用户选择上传的时候，开始上传。
        Croper.setCallback(function( data ) {
            Uploader.crop(data);
            Uploader.upload();
        });
    });

    $(document).on("click","#cancel",function(){
        var html="";
        html+='';
        html+=  '<div class="cropper-wraper webuploader-element-invisible">';
        html+=  '   <div class="img-container">';
        html+=  '       <img src="" alt="" />';
        html+=  '   </div>';
        html+=  '   <div class="uploader_btn_group">';
        html+=  '       <div id="cancel" class="cancel dadao_btn dadao_btn_lg">取消</div>';
        html+=  '       <div id="upload-btn" class="upload-btn save dadao_btn dadao_btn_lg dadao_btn_primary">保存</div>';
        html+=  '   </div>';
        html+=  '   <div class="img-preview"></div>';
        html+=  '</div>';
        $(".fileUpLoaderPanel").html(html);
        $(".setting_btn").removeClass("uploader-container webuploader-element-invisible");
        $("#filePicker").find("input[type='file']").val(null);
        $("#filePicker").empty().text("设置头像");

        var Croper = (function() {
            var container = $('.cropper-wraper');
            var $image = container.find('.img-container img');
            var btn = $('.upload-btn');
            var isBase64Supported, callback;

            $image.cropper({
                aspectRatio: 1,
                preview: ".img-preview",
                done: function(data) {
                    // console.log(data);
                }
            });

            function srcWrap( src, cb ) {

                // we need to check this at the first time.
                if (typeof isBase64Supported === 'undefined') {
                    (function() {
                        var data = new Image();
                        var support = true;
                        data.onload = data.onerror = function() {
                            if( this.width != 1 || this.height != 1 ) {
                                support = false;
                            }
                        }
                        data.src = src;
                        isBase64Supported = support;
                    })();
                }

                if ( isBase64Supported ) {
                    cb( src );
                } else {
                    // otherwise we need server support.
                    // convert base64 to a file.
                    $.ajax('../../server/preview.php', {
                        method: 'POST',
                        data: src,
                        dataType:'json'
                    }).done(function( response ) {
                        if (response.result) {
                            cb( response.result );
                        } else {
                            alert("预览出错");
                        }
                    });
                }
            }

            btn.on('click', function() {
                callback && callback($image.cropper("getData"));
                return false;
            });

            return {
                setSource: function( src ) {

                    // 处理 base64 不支持的情况。
                    // 一般出现在 ie6-ie8
                    srcWrap( src, function( src ) {
                        $image.cropper("setImgSrc", src);
                    });

                    container.removeClass('webuploader-element-invisible');

                    return this;
                },

                getImageSize: function() {
                    var img = $image.get(0);
                    return {
                        width: img.naturalWidth,
                        height: img.naturalHeight
                    }
                },

                setCallback: function( cb ) {
                    callback = cb;
                    return this;
                },

                disable: function() {
                    $image.cropper("disable");
                    return this;
                },

                enable: function() {
                    $image.cropper("enable");
                    return this;
                }
            }

        })();

        Uploader.init(function( src ) {

            Croper.setSource( src );

            // 隐藏选择按钮。
            container.addClass('webuploader-element-invisible');

            // 当用户选择上传的时候，开始上传。
            Croper.setCallback(function( data ) {
                Uploader.crop(data);
                Uploader.upload();
            });
        });
    });

    // -----------------------------------------------------
    // ------------ END ------------------------------------
    // -----------------------------------------------------
});