const Generator = require('yeoman-generator')
const fs = require('fs')

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts)
    this.name = this.appname.replace(/\s+/g, '-')
  }

  async initializing() {
    this.existingApp = this.fs.exists(this.destinationPath('webapp/Component.js'))
    if (this.existingApp) {
      this.log(`Updating existing UI5 app '${this.name}'`)
      this.manifest = this.fs.readJSON(this.destinationPath('webapp/manifest.json'))
      const sapAppIdArray = this.manifest['sap.app'].id.split('.')
      const appNameInManifest = sapAppIdArray[sapAppIdArray.length - 1]
      if (appNameInManifest !== this.name) {
        this.env.error(
          `
          Please name the app folder identical to the app name.

          Name in manifest.json: ${appNameInManifest}

          Folder name: ${this.name}
          `
        )
      }
      const odataServiceUri = this.manifest['sap.app'].dataSources.mainService.uri
      let bmwUi5Config
      try {
        bmwUi5Config = this._readYAML(this.destinationPath('bmw-ui5.yaml'))
      } catch (error) {
        this.log('Could not find bmw-ui5.yaml')
        bmwUi5Config = {}
      }

      this.variables = {
        NAMESPACE_PREFIX: sapAppIdArray.slice(0, sapAppIdArray.length - 1).join('.'),
        NAME: sapAppIdArray[sapAppIdArray.length - 1],
        ODATA_SERVICE: odataServiceUri.replace('/sap/opu/odata/', ''),
        ...bmwUi5Config
      }
    } else {
      this.log(`Creating new UI5 app '${this.name}'`)
      this.variables = {
        NAME: this.name
      }
    }
  }

  async prompting() {
    this.answers = await this.prompt([{
      type: 'input',
      name: 'NAMESPACE_PREFIX',
      message: 'Namespace prefix',
      default: 'bmw',
      store: true,
      when: () => !this.existingApp
    }, {
      type: 'input',
      name: 'DESCRIPTION',
      message: 'App description',
      when: () => !this.variables.DESCRIPTION
    }, {
      type: 'input',
      name: 'SAPUI5_VERSION',
      message: 'Exact SAPUI5 version',
      default: '1.38.39',
      store: true,
      when: () => !this.variables.SAPUI5_VERSION
    }, {
      type: 'input',
      name: 'ODATA_SERVICE',
      message: 'OData service (just the part after /sap/opu/odata/)',
      when: () => this.existingApp === false
    }, {
      type: 'input',
      name: 'FES_HOST',
      message: 'FES host',
      default: 'ttpddi30.bmwgroup.net',
      store: true,
      when: () => !this.variables.FES_HOST
    }, {
      type: 'input',
      name: 'FES_PORT',
      message: 'FES port',
      default: 8030,
      store: true,
      when: () => !this.variables.FES_PORT
    }, {
      type: 'input',
      name: 'FES_CLIENT',
      message: 'FES client',
      default: '010',
      store: true,
      when: () => !this.variables.FES_CLIENT
    }, {
      type: 'input',
      name: 'FES_PACKAGE',
      message: 'FES package',
      default: '$TMP',
      store: true,
      when: () => !this.variables.FES_PACKAGE
    }, {
      type: 'input',
      name: 'FES_BSP_CONTAINER',
      message: 'FES BSP container',
      default: `bmw/${this.variables.NAME}`,
      when: () => !this.variables.FES_BSP_CONTAINER
    }, {
      type: 'input',
      name: 'FES_BSP_CONTAINER_DESCRIPTION',
      message: 'FES BSP container description',
      default: (answers) => answers.DESCRIPTION,
      when: () => !this.variables.FES_BSP_CONTAINER_DESCRIPTION
    }, {
      type: 'input',
      name: 'FES_TRANSPORT',
      message: 'FES workbench request',
      when: () => !this.variables.FES_TRANSPORT
    }])
  }

  configuring() {
    this.variables = {
      ...this.variables,
      ...this.answers
    }
    this.variables.NAMESPACE = `${this.variables.NAMESPACE_PREFIX}.${this.variables.NAME}`
    this.variables.NAMESPACE_SLASH = this.variables.NAMESPACE.replace(/\./g, '/')
  }

  writing() {
    const files = [{
      path: 'bmw-ui5.yaml',
      args: this.variables
    }, {
      path: 'editorconfig',
      dotFile: true
    }, {
      path: 'eslintrc',
      dotFile: true
    }, {
      path: 'gitignore',
      dotFile: true
    }, {
      path: 'Gruntfile.js'
    }, {
      path: 'package.json',
      args: this.variables
    }, {
      path: 'README.md',
      args: this.variables
    }, {
      path: 'server.js'
    }, {
      path: 'ui5.yaml',
      args: this.variables
    }, {
      path: 'webapp/Component.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/index.html',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/manifest.json',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/controller/App.controller.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/controller/BaseController.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/controller/Home.controller.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/controller/NotFound.controller.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/i18n/i18n_de.properties',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/i18n/i18n_en.properties',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/model/formatter.js',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/view/App.view.xml',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/view/Home.view.xml',
      args: this.variables,
      skip: this.existingApp
    }, {
      path: 'webapp/view/NotFound.view.xml',
      args: this.variables,
      skip: this.existingApp
    }]
    files.filter(file => !file.skip).forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file.path),
        this.destinationPath(`${file.dotFile ? '.' : ''}${file.path}`),
        file.args
      )
    })
  }

  end() {
    if (!this.existingApp) {
      this.spawnCommandSync('git', ['init'])
      this.spawnCommandSync('git', ['add', '--all'])
      this.spawnCommandSync('git', ['commit', '-m', '"Generated files"'])
    }
    this.log(
      `
      ${this.existingApp ? 'Existing app updated' : 'New app created and git repository initialized'}

      Please run 'npm install' to install dependencies.

      Then run the app using 'npm start'.
      `
    )
  }

  _readYAML(path) {
    const content = this.fs.read(path)
    const data = {}
    const lines = content
    .replace(/\r?\n|\r/g, '\n')
    .split('\n')
    .filter(line => line[0] !== '#' && line.length !== 0)
    lines.forEach(line => {
      const colonIndex = line.indexOf(':')
      const key = line.slice(0, colonIndex)
      let value = line.slice(colonIndex + 1, line.length).trim()
      data[key] = value
    })
    return data
  }

};
