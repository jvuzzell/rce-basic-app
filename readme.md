# RCE Basic Starter Project

Welcome to the RCE Basic starter project! This project is designed to help developers learn and practice HTML, CSS, and JavaScript through a structured web application setup. The project includes multiple CSS stylesheets for different aspects of a web interface, JavaScript modules for dynamic interactions, and a basic deployment script.

## Demo
![RCE Framework Demo](/docs/assets/20240413_rce-basic-site-demo.gif "RCE Framework Demo")

## Project Structure

```bash
.
├── deploy
│   └── example_deploy.sh
├── docs
│   └── assets
├── public
│   ├── assets
│   │   ├── components
│   │   ├── js
│   │   │   ├── banner-alert-js
│   │   │   ├── expandables-js
│   │   │   ├── flyout-js
│   │   │   ├── html5-form-validation-js
│   │   │   ├── modals-js
│   │   │   └── rce-framework
│   │   └── styles
│   │       ├── button-anchors.css
│   │       ├── color-palette.css
│   │       ├── font.css
│   │       ├── form.css
│   │       ├── grid.css
│   │       ├── icons.css
│   │       ├── main.css
│   │       ├── margin-padding.css
│   │       ├── reset.css
│   │       ├── tables-style.css
│   │       └── variables.css
│   ├── index.html
│   ├── main.js
│   └── second-page
│       ├── index.html
│       └── index.js
└── readme.md
```

## Getting Started

1. **Clone the Repository**
   ```bash
   git clone [repository-url]
   cd [repository-directory]
2. **Explore the public Directory**
    - `index.html` is the entry point for the homepage. Open it in your browser to see the site in action.
    - Explore the `assets` folder to see how styles and scripts are organized.
3. **Running Scripts**
    - You can find the deployment scripts under the `deploy` directory. Ensure you have the necessary permissions to run these scripts.
    ```bash
    sh ./deploy/example_deploy.sh
    ```
4. **Development**
    - Use the included CSS files to change the appearance of your project. Each CSS file serves a specific purpose (e.g., `reset.css` for resetting browser defaults).
    - JavaScript enhancements are located in the `assets/js` directory. `main.js` demonstrates how to use the RCE framework for dynamic components.
5. **RCE Framework (Javascript)**
    - To learn more about **state management** and **event bus** for UI components visit: https://github.com/jvuzzell/RCE-Framework


## Learn More
- **HTML:** Learn about the structure of web pages.
- **CSS:** Explore how to style your web pages using CSS files provided in the assets/styles directory.
- **JavaScript:** Understand how to add interactive elements to your web pages using JavaScript modules.