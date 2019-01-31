const Generator = require('yeoman-generator')
const fs = require('fs')

module.exports = class extends Generator {

  async initializing() {
    this.log('\nCreating new UI5 XML view')
    this.manifestPath = this.destinationPath('webapp/manifest.json')
    this.manifest = this.fs.readJSON(this.manifestPath)
    if (!this.manifest) {
      this.env.error(`\nCannot find ${this.manifestPath}!`)
    }
    const namespace = this.manifest['sap.app'].id
    if (!namespace) {
      this.env.error(`\nCannot find {"sap.app": {"id": ...}} in manifest.json!`)
    }
    this.variables = {
      NAMESPACE: namespace,
      NAMESPACE_SLASH: namespace.replace(/\./g, '/')
    }
  }

  async prompting() {
    this.answers = await this.prompt([{
      type: 'input',
      name: 'VIEW_NAME',
      message: 'View name e.g. "ViewName"'
    }, {
      type: 'input',
      name: 'ROUTE_PATTERN',
      message: 'Route pattern, e.g. some/{thing}/query:?query:'
    }, {
      type: 'input',
      name: 'VIEW_LEVEL',
      message: 'View level for navigation transitions'
    }])
  }

  configuring() {
    this.variables = {
      ...this.variables,
      ...this.answers
    }
    this.variables.VIEW_NAME_CAMELCASE = this.variables.VIEW_NAME
    .replace(/^./, letter => letter.toLowerCase())
    this.variables.ROUTE_MANDATORY_PARAMETERS = this._findRegExCaptures(
      this.variables.ROUTE_PATTERN,
      /{(\w*)}/g
    )
    this.variables.ROUTE_QUERY_PARAMETERS = this._findRegExCaptures(
      this.variables.ROUTE_PATTERN,
      /:(\?\w*):/g
    )
    this.variables.ROUTE_PARAMETERS = this.variables.ROUTE_MANDATORY_PARAMETERS.length ||
    this.variables.ROUTE_QUERY_PARAMETERS.length
  }

  writing() {
    if (this.manifest['sap.ui5'].routing.targets[this.variables.VIEW_NAME_CAMELCASE]) {
      this.env.error(`\nRouting target '${this.variables.VIEW_NAME_CAMELCASE}' already exists!`)
    }
    const route = {
      "pattern": this.variables.ROUTE_PATTERN,
      "name": this.variables.VIEW_NAME_CAMELCASE,
      "target": this.variables.VIEW_NAME_CAMELCASE
    }
    const target = {
      "viewId": this.variables.VIEW_NAME_CAMELCASE,
      "viewName": this.variables.VIEW_NAME,
      "viewLevel" : this.variables.VIEW_LEVEL
    }
    this.manifest['sap.ui5'].routing.routes.push(route)
    this.manifest['sap.ui5'].routing.targets[this.variables.VIEW_NAME_CAMELCASE] = target
    this.log('\nChoosing to overwrite manifest.json, will add a route and a target')
    this.fs.writeJSON(this.manifestPath, this.manifest)
    const files = [{
      path: 'webapp/controller/NewView.controller.js',
      args: this.variables
    }, {
      path: 'webapp/view/NewView.view.xml',
      args: this.variables
    }]
    files.forEach(file => {
      this.fs.copyTpl(
        this.templatePath(file.path),
        this.destinationPath(`${file.path.replace('NewView', this.variables.VIEW_NAME)}`),
        file.args
      )
    })
  }

  end() {
    this.log(`View added`)
  }

  _findRegExCaptures(input, regex) {
    if (!regex.global) {
      throw Error('RegEx must have global flag, else will cause infinite loop!')
    }
    let match
    const result = []
    while ((match = regex.exec(input)) !== null) {
      result.push(match[1])
    }
    return result
  }

};
