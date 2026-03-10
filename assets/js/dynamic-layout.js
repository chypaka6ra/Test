/**
 * Dynamic Layout Manager
 *
 * Automatically repositions and resizes elements based on browser viewport width
 * Implements responsive grid system with multiple layout strategies
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

            // Layout strategies per breakpoint
            layouts: {
                xs: {
                    name: 'mobile-single',
                    columns: 1,
                    gap: '0.5rem',
                    padding: '0.75rem',
                    direction: 'column'
                },
                sm: {
                    name: 'mobile-compact',
                    columns: 1,
                    gap: '1rem',
                    padding: '1rem',
                    direction: 'column'
                },
                md: {
                    name: 'tablet',
                    columns: 2,
                    gap: '1.25rem',
                    padding: '1.5rem',
                    direction: 'row'
                },
                lg: {
                    name: 'desktop',
                    columns: 3,
                    gap: '1.5rem',
                    padding: '2rem',
                    direction: 'row'
                },
                xl: {
                    name: 'desktop-wide',
                    columns: 4,
                    gap: '2rem',
                    padding: '2.5rem',
                    direction: 'row'
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
                grid: '.t-container',
                content: '.t-content'
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
            console.log('[DynamicLayout] Initializing...');

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

            // Apply layout-specific styles
            this.applyLayoutStyles(layout, breakpoint, immediate);

            // Reflow elements
            this.reflowElements(layout, breakpoint);

            this.state.currentLayout = layout;
        },

        /**
         * Update CSS custom properties
         */
        updateCSSVariables: function(layout, breakpoint) {
            const root = document.documentElement;

            root.style.setProperty('--current-breakpoint', `"${breakpoint}"`);
            root.style.setProperty('--layout-name', `"${layout.name}"`);
            root.style.setProperty('--layout-columns', layout.columns);
            root.style.setProperty('--layout-gap', layout.gap);
            root.style.setProperty('--layout-padding', layout.padding);
            root.style.setProperty('--layout-direction', layout.direction);
        },

        /**
         * Apply layout-specific CSS styles
         */
        applyLayoutStyles: function(layout, breakpoint, immediate = false) {
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

            // Apply styles based on layout
            if (layout.columns === 1) {
                // Single column layout
                this.applySingleColumnLayout(container, layout);
            } else if (layout.columns === 2) {
                // Two column layout
                this.applyTwoColumnLayout(container, layout);
            } else {
                // Multi-column layout
                this.applyMultiColumnLayout(container, layout);
            }

            // Apply padding
            container.style.padding = layout.padding;
        },

        /**
         * Single column layout (mobile)
         */
        applySingleColumnLayout: function(container, layout) {
            const records = container.querySelectorAll(this.config.selectors.record);

            records.forEach((record, index) => {
                record.style.display = 'block';
                record.style.width = '100%';
                record.style.marginBottom = layout.gap;
                record.style.flexBasis = '100%';
            });

            container.style.display = 'flex';
            container.style.flexDirection = 'column';
            container.style.gap = layout.gap;
        },

        /**
         * Two column layout (tablet)
         */
        applyTwoColumnLayout: function(container, layout) {
            const records = container.querySelectorAll(this.config.selectors.record);

            records.forEach((record, index) => {
                record.style.display = 'block';
                record.style.width = 'calc(50% - ' + (parseFloat(layout.gap) / 2) + 'rem)';
                record.style.flexBasis = `calc(50% - ${parseFloat(layout.gap) / 2}rem)`;
            });

            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.flexWrap = 'wrap';
            container.style.gap = layout.gap;
            container.style.alignItems = 'flex-start';
            container.style.alignContent = 'flex-start';
        },

        /**
         * Multi-column layout (desktop)
         */
        applyMultiColumnLayout: function(container, layout) {
            const records = container.querySelectorAll(this.config.selectors.record);
            const cols = layout.columns;

            records.forEach((record, index) => {
                record.style.display = 'block';
                record.style.width = `calc(${100 / cols}% - ${(parseFloat(layout.gap) * (cols - 1)) / cols}rem)`;
                record.style.flexBasis = `calc(${100 / cols}% - ${(parseFloat(layout.gap) * (cols - 1)) / cols}rem)`;
            });

            container.style.display = 'flex';
            container.style.flexDirection = 'row';
            container.style.flexWrap = 'wrap';
            container.style.gap = layout.gap;
            container.style.alignItems = 'flex-start';
            container.style.alignContent = 'flex-start';
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
                container.setAttribute('data-columns', layout.columns);
            }

            // Emit custom event for other scripts
            const event = new CustomEvent('layoutChanged', {
                detail: {
                    breakpoint: breakpoint,
                    layout: layout,
                    width: this.state.windowWidth
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
                isTablet: this.state.currentBreakpoint === 'md' || this.state.currentBreakpoint === 'lg',
                isMobile: this.state.currentBreakpoint === 'xs' || this.state.currentBreakpoint === 'sm',
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
        },

        /**
         * Add custom breakpoint
         */
        addBreakpoint: function(name, width, layout) {
            this.config.breakpoints[name] = width;
            this.config.layouts[name] = layout;
            console.log(`[DynamicLayout] Added custom breakpoint: ${name} at ${width}px`);
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
