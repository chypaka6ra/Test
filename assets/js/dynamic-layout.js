/**
 * Dynamic Layout Manager - Single Column Centered
 *
 * Automatically adjusts layout based on browser viewport width
 * Always maintains single column with centered content
 */

(function() {
    'use strict';

    const DynamicLayout = {
        // Configuration
        config: {
            // Breakpoints in pixels
            breakpoints: {
                xs: 0,      // Extra small: < 480px
                sm: 480,    // Small: 480-768px
                md: 768,    // Medium: 768-1024px
                lg: 1024,   // Large: 1024-1280px
                xl: 1280    // Extra large: 1280px+
            },

            // Layout strategies per breakpoint (all single column, centered)
            layouts: {
                xs: {
                    name: 'mobile-centered',
                    maxWidth: '100%',
                    padding: '0.75rem',
                    margin: '0 auto',
                    textAlign: 'center',
                    columns: 1
                },
                sm: {
                    name: 'mobile-centered',
                    maxWidth: '480px',
                    padding: '1rem',
                    margin: '0 auto',
                    textAlign: 'center',
                    columns: 1
                },
                md: {
                    name: 'tablet-centered',
                    maxWidth: '720px',
                    padding: '1.5rem',
                    margin: '0 auto',
                    textAlign: 'center',
                    columns: 1
                },
                lg: {
                    name: 'desktop-centered',
                    maxWidth: '900px',
                    padding: '2rem',
                    margin: '0 auto',
                    textAlign: 'center',
                    columns: 1
                },
                xl: {
                    name: 'desktop-wide-centered',
                    maxWidth: '1000px',
                    padding: '2.5rem',
                    margin: '0 auto',
                    textAlign: 'center',
                    columns: 1
                }
            },

            // Debounce timeout
            resizeDebounce: 250,

            // Animation duration
            transitionDuration: 300,

            // Element selectors
            selectors: {
                container: '.t-records',
                record: '.t-rec',
                grid: '.t-container'
            }
        },

        // State
        state: {
            currentBreakpoint: null,
            currentLayout: null,
            windowWidth: 0,
            isDirty: false,
            transitionInProgress: false
        },

        // Timeout references
        timeouts: {
            resize: null,
            transition: null
        },

        /**
         * Initialize dynamic layout system
         */
        init: function() {
            console.log('[DynamicLayout] Initializing single-column centered layout...');

            // Get initial viewport width
            this.updateViewportWidth();

            // Set up event listeners
            this.setupEventListeners();

            // Initial layout application
            this.applyLayout();

            // Setup mutation observer for DOM changes
            this.setupMutationObserver();

            console.log('[DynamicLayout] ✓ Initialized');
        },

        /**
         * Setup event listeners
         */
        setupEventListeners: function() {
            // Window resize with debounce
            window.addEventListener('resize', () => this.onWindowResize(), { passive: true });

            // Orientation change
            window.addEventListener('orientationchange', () => this.onOrientationChange(), { passive: true });

            // Visibility change (user returns to tab)
            document.addEventListener('visibilitychange', () => this.onVisibilityChange());

            console.log('[DynamicLayout] Event listeners attached');
        },

        /**
         * Handle window resize event
         */
        onWindowResize: function() {
            // Debounce resize events
            if (this.timeouts.resize) {
                clearTimeout(this.timeouts.resize);
            }

            this.timeouts.resize = setTimeout(() => {
                this.updateViewportWidth();
                this.checkBreakpointChange();
            }, this.config.resizeDebounce);
        },

        /**
         * Handle orientation change
         */
        onOrientationChange: function() {
            console.log('[DynamicLayout] Orientation changed');
            setTimeout(() => {
                this.updateViewportWidth();
                this.applyLayout(true);
            }, 100);
        },

        /**
         * Handle visibility change (user returns to page)
         */
        onVisibilityChange: function() {
            if (!document.hidden) {
                console.log('[DynamicLayout] Page visible, updating layout');
                this.updateViewportWidth();
                this.checkBreakpointChange();
            }
        },

        /**
         * Update stored viewport width
         */
        updateViewportWidth: function() {
            this.state.windowWidth = window.innerWidth;
            console.log(`[DynamicLayout] Viewport width: ${this.state.windowWidth}px`);
        },

        /**
         * Get current breakpoint based on viewport width
         */
        getCurrentBreakpoint: function() {
            const width = this.state.windowWidth;
            const breakpoints = this.config.breakpoints;

            if (width < breakpoints.sm) return 'xs';
            if (width < breakpoints.md) return 'sm';
            if (width < breakpoints.lg) return 'md';
            if (width < breakpoints.xl) return 'lg';
            return 'xl';
        },

        /**
         * Check if breakpoint has changed
         */
        checkBreakpointChange: function() {
            const newBreakpoint = this.getCurrentBreakpoint();

            if (newBreakpoint !== this.state.currentBreakpoint) {
                console.log(`[DynamicLayout] Breakpoint changed: ${this.state.currentBreakpoint} → ${newBreakpoint}`);
                this.state.currentBreakpoint = newBreakpoint;
                this.applyLayout();
            }
        },

        /**
         * Apply current layout based on breakpoint
         */
        applyLayout: function(immediate = false) {
            const breakpoint = this.getCurrentBreakpoint();
            const layout = this.config.layouts[breakpoint];

            console.log(`[DynamicLayout] Applying layout: ${layout.name} (${breakpoint})`);

            // Update CSS custom properties for responsive design
            this.updateCSSVariables(layout, breakpoint);

            // Apply centered single-column layout
            this.applyCenteredLayout(layout, breakpoint, immediate);

            this.state.currentLayout = layout;
        },

        /**
         * Update CSS custom properties
         */
        updateCSSVariables: function(layout, breakpoint) {
            const root = document.documentElement;

            root.style.setProperty('--current-breakpoint', `"${breakpoint}"`);
            root.style.setProperty('--layout-name', `"${layout.name}"`);
            root.style.setProperty('--layout-max-width', layout.maxWidth);
            root.style.setProperty('--layout-padding', layout.padding);
            root.style.setProperty('--layout-margin', layout.margin);
            root.style.setProperty('--text-align', layout.textAlign);
        },

        /**
         * Apply centered single-column layout
         */
        applyCenteredLayout: function(layout, breakpoint, immediate = false) {
            const container = document.querySelector(this.config.selectors.container);
            if (!container) return;

            // Add transition if not immediate
            if (!immediate && !this.state.transitionInProgress) {
                container.style.transition = `all ${this.config.transitionDuration}ms ease-in-out`;
                this.state.transitionInProgress = true;

                if (this.timeouts.transition) {
                    clearTimeout(this.timeouts.transition);
                }

                this.timeouts.transition = setTimeout(() => {
                    container.style.transition = '';
                    this.state.transitionInProgress = false;
                }, this.config.transitionDuration);
            }

            // Apply centered single-column styles
            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.justifyContent = 'center';
            container.style.alignItems = 'center';
            container.style.maxWidth = layout.maxWidth;
            container.style.margin = layout.margin;
            container.style.padding = layout.padding;
            container.style.textAlign = layout.textAlign;
            container.style.width = '100%';
            container.style.boxSizing = 'border-box';

            // Apply to all records
            const records = container.querySelectorAll(this.config.selectors.record);
            records.forEach((record) => {
                record.style.display = 'block';
                record.style.width = '100%';
                record.style.boxSizing = 'border-box';
                record.style.textAlign = layout.textAlign;
            });

            // Emit custom event
            this.reflowElements(layout, breakpoint);
        },

        /**
         * Reflow and optimize elements
         */
        reflowElements: function(layout, breakpoint) {
            // Trigger reflow
            void document.body.offsetHeight;

            // Update container width hints
            const container = document.querySelector(this.config.selectors.container);
            if (container) {
                container.setAttribute('data-layout', layout.name);
                container.setAttribute('data-breakpoint', breakpoint);
                container.setAttribute('data-centered', 'true');
            }

            // Emit custom event for other scripts
            const event = new CustomEvent('layoutChanged', {
                detail: {
                    breakpoint: breakpoint,
                    layout: layout,
                    width: this.state.windowWidth,
                    centered: true,
                    columns: 1
                }
            });
            window.dispatchEvent(event);
        },

        /**
         * Setup mutation observer for dynamic content
         */
        setupMutationObserver: function() {
            const container = document.querySelector(this.config.selectors.container);
            if (!container) return;

            const observer = new MutationObserver((mutations) => {
                this.state.isDirty = true;
                // Re-apply layout if DOM changed
                if (this.timeouts.mutation) {
                    clearTimeout(this.timeouts.mutation);
                }
                this.timeouts.mutation = setTimeout(() => {
                    if (this.state.isDirty) {
                        console.log('[DynamicLayout] DOM changed, reapplying layout');
                        this.applyLayout();
                        this.state.isDirty = false;
                    }
                }, 500);
            });

            observer.observe(container, {
                childList: true,
                subtree: true,
                attributes: false
            });

            console.log('[DynamicLayout] Mutation observer attached');
        },

        /**
         * Get information about current layout
         */
        getLayoutInfo: function() {
            return {
                breakpoint: this.state.currentBreakpoint,
                layout: this.state.currentLayout,
                viewportWidth: this.state.windowWidth,
                centered: true,
                columns: 1,
                isMobile: this.state.currentBreakpoint === 'xs' || this.state.currentBreakpoint === 'sm',
                isTablet: this.state.currentBreakpoint === 'md' || this.state.currentBreakpoint === 'lg',
                isDesktop: this.state.currentBreakpoint === 'lg' || this.state.currentBreakpoint === 'xl'
            };
        },

        /**
         * Manually trigger layout update
         */
        updateLayout: function() {
            console.log('[DynamicLayout] Manual update triggered');
            this.updateViewportWidth();
            this.applyLayout(true);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DynamicLayout.init());
    } else {
        DynamicLayout.init();
    }

    // Export for external use
    window.DynamicLayout = DynamicLayout;
})();
