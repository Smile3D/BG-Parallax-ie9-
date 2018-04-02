jQuery(function() {
	initBgParallax();
});


// comment
function initBgParallax() {
	jQuery('.bg-holder').parallaxBlock({
		image: 'img',
		fallbackClass: 'is-touch-device'
	});
}


/*
 * jQuery BG Parallax plugin
 */
;(function($){

	'use strict';

	var isTouchDevice = /MSIE 10.*Touch/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

	var ParallaxController = (function() {
		var $win = $(window);
		var items = [];
		var winProps = {
			width: 0,
			height: 0,
			scrollTop: 0
		};

		return {
			init: function() {
				$win.on('load resize orientationchange', this.resizeHandler.bind(this));
				$win.on('scroll', this.scrollHandler.bind(this));

				this.resizeHandler();
			},

			resizeHandler: function() {
				winProps.width = $win.width();
				winProps.height = $win.height();

				$.each(items, this.calculateSize.bind(this));
			},

			scrollHandler: function() {
				winProps.scrollTop = $win.scrollTop();

				$.each(items, this.calculateScroll.bind(this));
			},

			calculateSize: function(i) {
				var item = items[i];

				item.height = Math.max(item.$el.outerHeight(), winProps.height);
				item.width = item.$el.outerWidth();
				item.topOffset = item.$el.offset().top;

				var styles = this.getDimensions({
					imageRatio: item.imageRatio,
					itemWidth: item.width,
					itemHeight: item.height
				});

				item.$el.css({
					backgroundSize: Math.round(styles.width) + 'px ' + Math.round(styles.height) + 'px'
				});

				this.calculateScroll(i);
			},

			calculateScroll: function(i) {
				var item = items[i];

				if (winProps.scrollTop + winProps.height > item.topOffset && winProps.scrollTop < item.topOffset + item.height) {
					var ratio = (winProps.scrollTop + winProps.height - item.topOffset) / (winProps.height + item.height);

					item.$el.css({
						backgroundPosition: '50% ' + (winProps.height * (item.options.parallaxOffset / 100) - (winProps.height + item.height) * ratio * (item.options.parallaxOffset / 100)) + 'px'
					});
				}
			},

			getDimensions: function(data) {
				var slideHeight = data.itemWidth / data.imageRatio;

				if (slideHeight < data.itemHeight) {
					slideHeight = data.itemHeight;
					data.itemWidth = slideHeight * data.imageRatio;
				}
				return {
					width: data.itemWidth,
					height: slideHeight,
					top: (data.itemHeight - slideHeight) / 2,
					left: (data.itemWidth - data.itemWidth) / 2
				};
			},

			getRatio: function(image) {
				if (image.prop('naturalWidth')) {
					return image.prop('naturalWidth') / image.prop('naturalHeight');
				} else {
					var img = new Image();
					img.src = image.prop('src');
					return img.width / img.height;
				}
			},

			imageLoaded: function(image, callback) {
				var self = this;
				var loadHandler = function() {
					callback.call(self);
				};
				if (image.prop('complete')) {
					loadHandler();
				} else {
					image.one('load', loadHandler);
				}
			},

			add: function(el, options) {
				var $el = $(el);
				var $image = $el.find(options.image);
				
				this.imageLoaded($image, function() {
					var imageRatio = this.getRatio($image);

					$el.css({
						backgroundImage: 'url(' + $image.attr('src') + ')',
						backgroundRepeat: 'no-repeat',
						backgroundAttachment: !isTouchDevice ? 'fixed' : 'scroll',
						backgroundSize: 'cover'
					});

					$image.remove();

					if (isTouchDevice) {
						$el.addClass(options.fallbackClass);
						return;
					}

					options.parallaxOffset = Math.abs(options.parallaxOffset);

					var newIndex = items.push({
						$el: $(el),
						options: options,
						imageRatio: imageRatio
					});

					this.calculateSize(newIndex - 1);
				});
			}
		};
	}());

	ParallaxController.init();

	$.fn.parallaxBlock = function(options){
		options = $.extend({
			parallaxOffset: 5, // percent from 0 - top 100 (from window height)
			fallbackClass: 'is-touch-device',
			image: 'img'
		}, options);
		
		return this.each(function() {
			if (this.added) {
				return;
			}

			this.added = true;
			ParallaxController.add(this, options);
		});
	};
}(jQuery));
