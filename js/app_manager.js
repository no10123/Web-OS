// Class to manage multiple dynamic application windows (Apps)
class AppManager {
    constructor() {
        this.apps = new Map(); // Stores app instances by unique ID or name
        // Bind methods that use 'this' context, useful for event listeners
        this.centerWindow = this.centerWindow.bind(this);
        this.toggleFullscreen = this.toggleFullscreen.bind(this);
    }

    /**
     * Registers a new application window with the manager.
     * @param {HTMLElement} element - The DOM element representing the app window.
     * @param {string} id - A unique identifier for the app.
     */
    registerApp(element, id) {
        if (this.apps.has(id)) {
            console.warn(\`App with ID '\${id}' is already registered.\`);
            return;
        }

        const initialVisibility = element.classList.contains('hidden') ? true : false;
        
        this.apps.set(id, {
            element: element,
            isVisible: !initialVisibility, // Assume visible if 'hidden' class is missing initially
            isFullscreen: false,
            // Store the original state/methods required for this specific app instance
            _containerBounds: null // To hold computed bounds once initialized
        });

        console.log(\`App '\${id}' registered successfully.\`);
    }

    /**
     * Calculates and sets the centered position for an app element.
     * @param {string} id - The ID of the app to center.
     */
    centerWindow(id) {
        const app = this.apps.get(id);
        if (!app) return console.error(\`App '\${id}' not found.\`);

        const elmnt = app.element;
        // Reimplementing getWindowBounds logic safely
        const viewportRect = window.getBoundingClientRect();
        const windowRect = elmnt.getBoundingClientRect();
        
        const left = Math.max(15, Math.round((viewportRect.width - windowRect.width) / 2));
        const top = Math.max(15, Math.round((viewportRect.height - windowRect.height) / 2));

        // Apply centering styles
        elmnt.style.left = \`\${left}px\`;
        elmnt.style.top = \`\${top}px\`;
        elmnt.style.transform = 'none';
    }
    
    /**
     * Sets the application state to be fully visible and centered, resetting fullscreen mode.
     * @param {string} id - The ID of the app.
     */
    openApp(id) {
        const app = this.apps.get(id);
        if (!app) return console.error(\`Cannot open: App '\${id}' not found.\`);

        const elmnt = app.element;
        app.isVisible = true;
        app.isFullscreen = false;
        
        // Reset styles and remove fullscreen classes
        elmnt.classList.remove('hidden', 'fullscreen');
        elmnt.style.width = '';
        elmnt.style.height = '';

        this.centerWindow(id); // Center it when opening normally
    }

    /**
     * Closes and hides the specified app window.
     * @param {string} id - The ID of the app to close.
     */
    closeApp(id) {
        const app = this.apps.get(id);
        if (!app) return console.error(\`Cannot close: App '\${id}' not found.\`);

        // Simple visibility toggle
        app.element.classList.add('hidden');
        app.isVisible = false;
    }

    /**
     * Minimizes the specified app window by hiding it.
     * @param {string} id - The ID of the app to minimize.
     */
    minimizeApp(id) {
        const app = this.apps.get(id);
        if (!app) return console.error(\`Cannot minimize: App '\${id}' not found.\`);

        // Simple visibility toggle
        app.element.classList.add('hidden');
        app.isVisible = false;
    }

    /**
     * Toggles the fullscreen state for an application, improving logic flow.
     * @param {string} id - The ID of the app to toggle fullscreen on/off.
     */
    toggleFullscreen(id) {
        const app = this.apps.get(id);
        if (!app || app.element.classList.contains('hidden')) return;

        const elmnt = app.element;
        let newFullscreenState = !app.isFullscreen;
        
        // Toggle state first for management purposes
        app.isFullscreen = newFullscreenState;
        elmnt.classList.toggle('fullscreen', newFullscreenState);

        if (newFullscreenState) {
            // Fullscreen: override size/positioning to 100% viewport
            elmnt.style.left = '0px';
            elmnt.style.top = '0px';
            elmnt.style.width = '100%';
            elmnt.style.height = '100%';
        } else {
            // Exit Fullscreen: reset size and recenter
            elmnt.style.width = '';
            elmnt.style.height = '';
            this.centerWindow(id); 
        }
    }

    /**
     * Getter to check if an app is currently visible.
     * @param {string} id - The ID of the app.
     * @returns {boolean} True if the app element does not have the 'hidden' class.
     */
    isAppVisible(id) {
        const app = this.apps.get(id);
        return app ? !app.element.classList.contains('hidden') : false;
    }
}

// Global instance for easy access, mimicking a global singleton pattern.
const AppManagerInstance = new AppManager();
window.AppManager = AppManagerInstance;


/* 
============================================================
USAGE EXAMPLE (Replace these section with initialization in index.html)
============================================================

// Assuming:
// const wm = document.getElementById('welcome-window');
// const settingsWin = document.getElementById('settings-window');

// 1. Initialize the manager with all necessary DOM elements and their IDs
// AppManagerInstance.registerApp(document.getElementById('welcome-window'), 'welcome');
// AppManagerInstance.registerApp(document.getElementById('settings-window'), 'settings');

// 2. Example usage in event handlers (e.g., button click listeners)
// function handleOpenWelcome() {
//     AppManagerInstance.openApp('welcome');
// }
// function handleToggleSettingsFullscreen() {
//     AppManagerInstance.toggleFullscreen('settings');
// }
*/