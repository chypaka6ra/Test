/**
 * Mobile Optimization Module
 *
 * Handles mobile-specific enhancements:
 * - Viewport adjustments for notched devices
 * - Touch event optimizations
 * - Mobile-specific interactions
 */

(function() {
    'use strict';

    const MobileOptimization = {
        // Configuration
        config: {
            minTouchTarget: 44,
            tapDebounce: 200,
            scrollDebounce: 150
        },

        // Initialize mobile optimizations
        init: function() {
            console.log('[Mobile] Initializing mobile optimizations...');

            // Check if device is mobile
            if (this.isMobileDevice()) {
                console.log('[Mobile] Mobile device detected');

                // Apply optimizations
                this.setupViewportHeight();
                this.optimizeTouchTargets();
                this.addTouchFeedback();
                this.fixIOSIssues();
                this.optimizeScrollBehavior();
                this.setupOrientationHandling();
            }

            console.log('[Mobile] ✓ Mobile optimizations applied');
        },

        /**
         * Detect if device is mobile
         */
        isMobileDevice: function() {
            const userAgent = navigator.userAgent.toLowerCase();
            return /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
        },

        /**
         * Setup viewport height (100vh issue on mobile)
         * Mobile browsers hide/show address bar, affecting 100vh
         */
        setupViewportHeight: function() {
            const updateVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };

            updateVH();

            // Update on resize and orientation change
            window.addEventListener('resize', updateVH);
            window.addEventListener('orientationchange', updateVH);
        },

        /**
         * Optimize touch targets
         * Ensure all interactive elements are at least 44x44px
         */
        optimizeTouchTargets: function() {
            const interactiveElements = document.querySelectorAll(
                'button, a, input[type="button"], input[type="submit"], ' +
                'input[type="checkbox"], input[type="radio"], label'
            );

            interactiveElements.forEach(element => {
                const rect = element.getBoundingClientRect();
                const minSize = this.config.minTouchTarget;

                // Add padding if element is too small
                if (rect.width < minSize || rect.height < minSize) {
                    const currentPadding = window.getComputedStyle(element).padding;
                    element.style.padding = `${minSize / 4}px ${minSize / 3}px`;
                    element.dataset.touchOptimized = 'true';
                }
            });

            console.log('[Mobile] Touch targets optimized');
        },

        /**
         * Add visual feedback for touch events
         */
        addTouchFeedback: function() {
            let touchStartTime = 0;

            document.addEventListener('touchstart', function(e) {
                touchStartTime = Date.now();
                const target = e.target.closest('button, a, input[type="submit"], label');
                if (target) {
                    target.style.opacity = '0.7';
                }
            }, false);

            document.addEventListener('touchend', function(e) {
                const touchDuration = Date.now() - touchStartTime;
                const target = e.target.closest('button, a, input[type="submit"], label');
                if (target) {
                    target.style.opacity = '1';
                }
            }, false);

            console.log('[Mobile] Touch feedback enabled');
        },

        /**
         * Fix iOS-specific issues
         */
        fixIOSIssues: function() {
            const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

            if (!iOS) return;

            // 1. Prevent zoom on input focus
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', function() {
                    this.style.fontSize = '16px';
                });
            });

            // 2. Fix viewport height on iOS
            let lastHeight = window.innerHeight;
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    const newHeight = window.innerHeight;
                    if (newHeight !== lastHeight) {
                        lastHeight = newHeight;
                        // Trigger layout recalculation
                        document.body.style.height = `${newHeight}px`;
                        setTimeout(() => {
                            document.body.style.height = 'auto';
                        }, 100);
                    }
                }, 100);
            });

            // 3. Prevent zoom on double tap
            let lastTouchEnd = 0;
            document.addEventListener('touchend', function(e) {
                const now = Date.now();
                if (now - lastTouchEnd <= 300) {
                    e.preventDefault();
                }
                lastTouchEnd = now;
            }, false);

            console.log('[Mobile] iOS issues fixed');
        },

        /**
         * Optimize scroll behavior
         * Reduce reflow/repaint during scroll
         */
        optimizeScrollBehavior: function() {
            let ticking = false;
            let lastScrollY = 0;

            document.addEventListener('scroll', () => {
                lastScrollY = window.scrollY;

                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        // Update fixed elements, animations, etc. here
                        ticking = false;
                    });
                    ticking = true;
                }
            }, { passive: true });

            console.log('[Mobile] Scroll behavior optimized');
        },

        /**
         * Handle orientation changes
         */
        setupOrientationHandling: function() {
            let previousOrientation = this.getOrientation();

            window.addEventListener('orientationchange', () => {
                const newOrientation = this.getOrientation();

                if (previousOrientation !== newOrientation) {
                    console.log(`[Mobile] Orientation changed: ${previousOrientation} → ${newOrientation}`);

                    // Trigger layout adjustments
                    setTimeout(() => {
                        // Force reflow
                        void document.body.offsetHeight;
                    }, 0);

                    previousOrientation = newOrientation;
                }
            });

            console.log('[Mobile] Orientation handling enabled');
        },

        /**
         * Get current device orientation
         */
        getOrientation: function() {
            return window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
        },

        /**
         * Utility: Check if viewport width is mobile size
         */
        isViewportMobile: function() {
            return window.innerWidth <= 768;
        },

        /**
         * Utility: Check if viewport width is small phone
         */
        isSmallPhone: function() {
            return window.innerWidth <= 480;
        },

        /**
         * Utility: Get safe area insets (for notched devices)
         */
        getSafeAreaInsets: function() {
            return {
                top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-top')),
                right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-right')),
                bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-bottom')),
                left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--safe-area-left'))
            };
        },

        /**
         * Prevent pull-to-refresh on Android
         */
        disablePullToRefresh: function() {
            let lastY = 0;

            document.body.addEventListener('touchstart', (e) => {
                lastY = e.touches[0].clientY;
            }, false);

            document.body.addEventListener('touchmove', (e) => {
                const currentY = e.touches[0].clientY;

                // Prevent scroll if pulling down at top of page
                if (currentY > lastY && window.scrollY === 0) {
                    e.preventDefault();
                }

                lastY = currentY;
            }, false);

            console.log('[Mobile] Pull-to-refresh disabled');
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MobileOptimization.init());
    } else {
        MobileOptimization.init();
    }

    // Export for external use
    window.MobileOptimization = MobileOptimization;
})();
