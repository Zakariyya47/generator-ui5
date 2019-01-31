# BMW FG-5215 Yeoman UI5 Generator

This Yeoman generator is used to create new UI5 apps, update an app's project environment for running locally, deploying, etc., and for adding views to a UI5 app.

## Installation

```bash
npm install --global yo git+https://atc.bmwgroup.net/bitbucket/scm/fg5215ui5/generator-ui5.git --proxy http://your-user:password@proxy.w9:80
```

> **Always clear the history and then close the bash session after using plain text passwords**:
  > ```
  history -c
  exit
  ```

## Usage

Create, update, or convert a UI5 app:

```bash
yo ui5
```

> If `webapp/Component.js` is found, add/updates project environment for running locally, deploying, etc.; else creates new app.

Add a new XML View

```bash
yo ui5:view
```

> Adds controller, view, as well as routing information in `manifest.json`.
