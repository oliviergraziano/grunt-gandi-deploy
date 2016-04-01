# grunt-gandi-deploy

> Help deploying apps on Gandi Simple Hosting using Git.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-gandi-deploy --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-gandi-deploy');
```

## The "gandi_deploy" task

### Overview
In your project's Gruntfile, add a section named `gandi_deploy` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  gandi_deploy: {
    your_target: {
        options: {
          login: 'your_gandi_login',
          ssh_key_path: '/path/to/rsa/private/key',
        },
        src: 'path/to/deploy/directory'
    },
  },
});
```

### Options

#### options.login
Type: `String`

Your Simple Hosting instance admin login

#### options.ssh_key_path
Type: `String`

Path to your SSH private key. This method is strongly recommended.

#### options.password
Type: `String`

Password for your instance. This option is not recommended. Use SSH Key instead.

#### options.vhost
Type: `String`
Default value: `'default'`

Vhost to deploy to. (Only `'default' on Node.js, Python or Ruby instances)

#### options.datacenter_location
Type: `String``
Default value: `'dc0'`

Your SimpleHosting instance datacenter location

#### options.branch
Type: `String`
Default value: `'master'`

Branch to deploy to.

#### options.message
Type: `String`
Default value: `'autocommit'`

Commit message

#### options.tag
Type: `String`
Default value: `false`

Tag for the release. The release is not tagged if value is `false`

#### options.tag_message
Type: `String`
Default value: `'autocommit'`

Message for the tag. Ignored if options.tag is `false`

#### options.git_clean
Type: `String`
Default value: `false`

Whether to execute à `git clean` operation on the vhost directory see [Gandi Documentation](https://wiki.gandi.net/en/simple/git) for details

#### options.remote
Type: `String`
Default value: `'origin'`

Git remote name.

#### options.tmp_dir
Type: `String`
Default value: `'tmp'`

Plugin's working directory name. `'tmp'` is the default value but can be changed if needed.


## Notes
There are no unit tests for this plugin yet. Use it carefully.

For more informations about Simple Hosting Git access, see [Gandi Documentation](https://wiki.gandi.net/en/simple/git)

This plugin is not written or supported by [Gandi](https://www.gandi.net/).

This plugin has been inspired by [grunt-git-deploy](https://github.com/iclanzan/grunt-git-deploy) and uses some of its code.

## Contributing
Every contribution is welcome !

