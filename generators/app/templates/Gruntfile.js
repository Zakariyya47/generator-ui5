module.exports = async function(grunt) {

  // App config
  const config = grunt.file.readYAML('bmw-ui5.yaml')
  console.log(config)

  const server = `http://${config.FES_HOST}:${config.FES_PORT}`

  grunt.initConfig({
    prompt: {
      nwabap_ui5uploader: {
        options: {
          questions: [
            {
              config: 'nwabap_ui5uploader.options.auth.user',
              type: 'input',
              message: `Enter your username (${server}. client ${config.FES_CLIENT})`
            }, {
              config: 'nwabap_ui5uploader.options.auth.pwd',
              type: 'password',
              message: `Enter your password`
            }
          ]
        }
      }
    },
    nwabap_ui5uploader: {
      options: {
        conn: {
          server: server,
          client: config.FES_CLIENT
        },
        auth: {
          user: null,
          pwd: null
        }
      },
      upload_build: {
        options: {
          ui5: {
            package: config.FES_PACKAGE,
            bspcontainer: config.FES_BSP_CONTAINER,
            bspcontainer_text: config.FES_BSP_CONTAINER_DESCRIPTION,
            transportno: config.FES_TRANSPORT
          },
          resources: {
            cwd: 'dist/',
            src: '**/*.*'
          }
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-prompt')
  grunt.loadNpmTasks('grunt-nwabap-ui5uploader')

  grunt.registerTask('upload', [
    'prompt:nwabap_ui5uploader',
    'nwabap_ui5uploader'
  ])

}
