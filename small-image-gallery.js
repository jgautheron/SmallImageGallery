/**
 * An image widget.
 * @author Jonathan Gautheron <alpherz@gmail.com>
 * @class SmallImageGallery
 * @inherits Widget
 **/
YUI.add('small-image-gallery', function(Y) {

    var Lang = Y.Lang,
        Node = Y.Node;

    function SmallImageGallery(config) {
        SmallImageGallery.superclass.constructor.apply(this, arguments);
    }

    SmallImageGallery.NAME = 'small-image-gallery';

    SmallImageGallery.ATTRS = {
        srcNode : {
            value : null,
            writeOnce : true
        },

        datasource : {
            value : null
        }
    };

    SmallImageGallery.CLASS_PREFIX = Y.ClassNameManager.getClassName(SmallImageGallery.NAME) + '-';
    SmallImageGallery.ACTIVE_CLASS = SmallImageGallery.CLASS_PREFIX + 'active';

    SmallImageGallery.IMAGE_CONTAINER  = SmallImageGallery.CLASS_PREFIX + 'image';
    SmallImageGallery.IMAGES_CONTAINER = SmallImageGallery.CLASS_PREFIX + 'images';
    SmallImageGallery.TITLE            = SmallImageGallery.CLASS_PREFIX + 'title';
    SmallImageGallery.LINK             = SmallImageGallery.CLASS_PREFIX + 'link';

    SmallImageGallery.NAV_LEFT         = SmallImageGallery.CLASS_PREFIX + 'left';
    SmallImageGallery.NAV_RIGHT        = SmallImageGallery.CLASS_PREFIX + 'right';

    SmallImageGallery.IMAGE_TEMPLATE  = '<img src="{imgurl}" alt="" data-index="{index}" />';
    SmallImageGallery.IMAGES_TEMPLATE = '<li data-index="{index}" data-title="{title}"><a href="{link}" style="background-image:url(\'{imgurl}\');"></a><div class="yui3-small-image-gallery-arrow"><div class="arrow-1"></div><div class="arrow-2"></div></div></li>';

    /* Carousel extends the base Widget class */
    Y.extend(SmallImageGallery, Y.Widget, {

        initializer: function(config) {
            this.intervalTimer = null;
            this.currentIndex = 1;
            this.currentNode = null;
            this.images = this.get('datasource');
            this.imageContainer = this.get('srcNode').one('.' + SmallImageGallery.IMAGE_CONTAINER);
            this.imagesContainer = this.get('srcNode').one('.' + SmallImageGallery.IMAGES_CONTAINER);
            this.title = this.get('srcNode').one('.' + SmallImageGallery.TITLE);
            this.link = this.get('srcNode').one('.' + SmallImageGallery.LINK);

            this.publish('small-image-gallery:switch', { preventable: false, broadcast: 1 });
        },

        destructor : function() {
            //Y.detach('small-image-gallery|*');
        },

        renderUI : function() {
            this._renderImages();
        },

        bindUI : function() {
            this._bindNavigation();
        },

        syncUI : function() {
            this._syncNavigation();
        },

        _renderImages : function() {
            var i, image, nodeImages = [], nodeImage = [];
            for (i = 0; image = this.images[i++];) {
                nodeImages.push(Y.Node.create(Y.substitute(SmallImageGallery.IMAGES_TEMPLATE, {imgurl: image['Thumb'], title: image['Title'], link: image['Link'], index: i})));
                nodeImage.push(Y.Node.create(Y.substitute(SmallImageGallery.IMAGE_TEMPLATE, {imgurl: image['Image'], index: i})).setStyle('opacity', 0));
            }

            this.imagesContainer.prepend(nodeImages);
            this.imageContainer.prepend(nodeImage);
        },

        _renderNavigation : function(type) {
            var navFadeIn = function(node) {
                new Y.Anim({
                    node: node,
                    duration: 0.2,
                    to: {
                        'opacity' : 1
                    }
                }).run();
            };
        },

        _bindNavigation : function(type) {
            Y.delegate('click', Y.bind(this._onNavigationImage, this), this.imagesContainer, 'li');

            var srcNode = this.get('srcNode');
            srcNode.one('.' + SmallImageGallery.NAV_LEFT).on('click', Y.bind(this._goPrevious, this));
            srcNode.one('.' + SmallImageGallery.NAV_RIGHT).on('click', Y.bind(this._goNext, this));
        },

        _syncNavigation : function(type) {
            var currentImage = this.imagesContainer.one('li');
            currentImage.addClass(SmallImageGallery.ACTIVE_CLASS);
            this.title.set('text', currentImage.getAttribute('data-title'));
            this.link.setAttribute('href', currentImage.one('a').getAttribute('href'));

            var lastItem = this.imageContainer.get('children').item(0);
            lastItem.addClass(SmallImageGallery.ACTIVE_CLASS);
            lastItem.setStyle('opacity', 1);

            var anim = new Y.Anim({
                node: this.imageContainer,
                duration: 0.3,
                from: {
                    'opacity' : 0
                },
                to: {
                    'opacity' : 1
                }
            });
            anim.on('end', Y.bind(function() {
                this.link.setStyle('opacity', 1);
            }, this));
            anim.run();
        },

        _onNavigationImage : function(e) {
            var node = e.currentTarget,
                index = parseInt(node.getAttribute('data-index'));

            e.preventDefault();
            this._goTo(index);
        },

        _goPrevious : function(e) {
            e.preventDefault();
            var index = this.currentIndex;
            if (index <= 1) {
                index = this.images.length;
            } else {
                index = index - 1;
            }
            this._goTo(index);
        },

        _goNext : function(e) {
            e.preventDefault();
            var index = this.currentIndex;
            if (index >= this.images.length) {
                index = 1;
            } else {
                index = index + 1;
            }
            this._goTo(index);
        },

        _goTo : function(index) {
            var node = this.imagesContainer.one('li[data-index=' + index + ']'),
                title = node.getAttribute('data-title'),
                previousImage = this.imageContainer.one('img.' + SmallImageGallery.ACTIVE_CLASS),
                nextImage = this.imageContainer.one('img[data-index=' + index + ']'),
                link = node.one('a');

            if (this.currentIndex === index) {
                return false;
            }

            this.currentIndex = index;
            this.currentNode = node;

            this.imagesContainer.all('li').removeClass(SmallImageGallery.ACTIVE_CLASS);
            node.addClass(SmallImageGallery.ACTIVE_CLASS);

            this.title.set('text', title);
            this.link.setAttribute('href', link.getAttribute('href'));

            new Y.Anim({
                node: previousImage,
                duration: 0.3,
                from: {
                    'opacity' : 1
                },
                to: {
                    'opacity' : 0
                }
            }).run();

            new Y.Anim({
                node: nextImage,
                duration: 0.3,
                from: {
                    'opacity' : 0
                },
                to: {
                    'opacity' : 1
                }
            }).run();

            previousImage.removeClass(SmallImageGallery.ACTIVE_CLASS);
            nextImage.addClass(SmallImageGallery.ACTIVE_CLASS);

            this.fire('small-image-gallery:switch');
        }

    });

    Y.SmallImageGallery = SmallImageGallery;

}, '3.2.0', {requires:['widget', 'anim', 'node', 'substitute']});
