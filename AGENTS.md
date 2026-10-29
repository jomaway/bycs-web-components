# Component Architecture Guidelines

This repository hosts vanilla JavaScript component scripts designed to be embedded into Moodle / ByCS Lernplattform via a CDN (e.g., jsDelivr). 

## 📂 Repository Structure
```text
/
├── components/
│   ├── pwm-simulator.js
│   └── [other-component-name].js
├── README.md
└── AGENTS.md
``` 

## 🛠️ Core Architectural Rules for Components

Because these components are injected into Moodle environments (which strip custom tags via HTML Purifier and share the global scope), **every component must adhere to the following rules:**

### 1. No Custom Elements / Custom Tags
* **Do NOT use custom HTML tags** (e.g., `<pwm-simulator>`). Moodle will strip them out.
* **Use standard container divs** with a unique target class selector (e.g., `.pwm-simulator-target`).

### 2. Auto-Initialization Pattern
Components must automatically scan the DOM for their target class on load and safely initialize themselves multiple times on the same page without variable collisions. 
* Use class-based encapsulation (passing the container element into a class constructor).
* Include an auto-initializer fallback at the bottom of the script for dynamic or delayed injections.

### 3. Self-Contained Styling & Markup
* Every component must inject its own HTML template and scoped/scoped-like CSS directly into its target container.
* Use Bootstrap 5 to style the component as this is available from the parent theme.
* Only include other necessary external dependencies inside the component's inner HTML template if not possible with bootstrap.


### 4. Scoped DOM Queries
* Never use global selectors like `document.getElementById` or `document.querySelector` inside the component logic because multiple instances will conflict.
* Always query relative to the component's container instance (`root.querySelector(...)` or `this.container.querySelector(...)`).

---

## 📝 Component Template Boilerplate

When creating a new component (e.g., `components/my-component.js`), follow this structure:

```javascript
class MyComponent {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        this.container.innerHTML = `
            <style>
                .my-component-wrapper { /* scoped styles here */ }
            </style>
            <div class="my-component-wrapper">
                <!-- HTML markup with class selectors instead of IDs -->
            </div>
        `;
        this.setupLogic();
    }

    setupLogic() {
        const root = this.container;
        // Use root.querySelector(...) for all interactions
    }
}

// Auto-initializer
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.my-component-target').forEach(el => new MyComponent(el));
});
document.querySelectorAll('.my-component-target').forEach(el => {
    if (!el.dataset.initialized) {
        el.dataset.initialized = "true";
        new MyComponent(el);
    }
});

