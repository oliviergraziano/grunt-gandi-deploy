/*
 * grunt-gandi-deploy
 * https://github.com/oliviergraziano/grunt-gandi-deploy
 *
 * Copyright (c) 2016 Olivier GRAZIANO
 * Licensed under the MIT license.
 */

'use strict';

var async = require('async');
var path = require('path');
var simple_ssh = require('simple-ssh');

module.exports = function(grunt) {

  var file = grunt.file;
  var spawn = grunt.util.spawn;

  function cmd(cmd, args, cwd){

    return function(callback){

      grunt.log.writeln('Running '+ (cmd + ' ' + args.join(' ')).green + ' in ' + cwd );
      spawn({
        cmd: cmd,
        args: args,
        opts: {cwd: cwd, stdio: 'inherit'}
      },
        function (err, res, code){

        if(err){
          grunt.fail.warn(err);
          callback(err);
        }
        grunt.log.writeln(res.stdout.green);
        grunt.log.writeln(res.stderr.red);
        callback();
      });

    };

  }

  function ssh(cmd, args, params){

    return function(callback){
      var p = {
        host: params.server_url,
        user: params.login
      };

      if(typeof params.ssh_key !== 'undefined'){
        p.key = params.ssh_key;
      }
      else{
        p.pass = params.password;
      }

      var conn = new simple_ssh(p);

      grunt.log.writeln('Running '+ ('ssh '+cmd + ' ' + args.join(' ')).green);

      conn.exec(cmd, {
        args: args,
        out: function(stdouts){
          grunt.log.write(stdouts.green);
        },
        err: function(stderr) {
          grunt.log.write(stderr);
        },
        exit: function(code, stdout, stderr){
          grunt.log.write(stdout);
          callback();
        }
      }).start();
    }

  }

  function copyIntoRepo( srcDir, destDir ){

    return function(cb) {
      grunt.log.writeln('Copying ' + srcDir + ' to ' + destDir );
      //Ensure directory has trailingslash
      if ( srcDir.substr(-1) != '/' ) {
        srcDir = srcDir + '/';
      }

      grunt.file.expand(  { 'expand': true, 'cwd' : destDir, dot: true }, ['**/*', '!.git/**', '!'+destDir+'/**'] ).forEach( function( dest ){

        if (process.platform === 'win32') {
          dest = path.join(destDir, dest).replace(/\\/g, '/');
        } else {
          dest = path.join(destDir, dest);
        }

        grunt.file.delete(dest);
      });

      grunt.file.expand(  { 'expand': true, 'cwd' : srcDir, dot: true }, ['**/*', '!.git/**', '!'+destDir+'/**'] ).forEach( function( src ){

        var dest;

        if (process.platform === 'win32') {
          dest = path.join(destDir, src).replace(/\\/g, '/');
        } else {
          dest = path.join(destDir, src);
        }

        if ( grunt.file.isDir(srcDir + src) ) {
          grunt.file.mkdir(dest);
        } else {
          grunt.file.copy(srcDir + src, dest);
        }
      });

      cb();
    };
  }

  grunt.registerMultiTask('gandi_deploy', 'Help deploying apps on Gandi Simple Hosting using Git.', function() {


    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
        vhost: 'default',
        datacenter_location: 'dc0',
        git_clean: false,
        remote: 'origin',
        branch: 'master',
        message: 'autocommit',
        tag: false,
        tag_message: 'autocommit',
        tmp_dir: 'tmp'
    });

    if(!options.login) {
      grunt.fail.warn('A valid login is required.');
      return false;
    }

    if(!options.password && !options.ssh_key_path){
      grunt.fail.warn('You must provide a SSH key or password.');
      return false;
    }

    var srcDir = this.data.src;
    if (typeof srcDir === 'undefined' || !file.isDir(srcDir)) {
      grunt.fail.warn('An existing source directory is required.');
      return false;
    }

    var tmpDir = srcDir+'/tmp';
    if (file.isDir(tmpDir)) {
      grunt.fail.warn('The directory '+tmpDir+' already exists. Please provide an unused name for the temp directory in options.tmp_dir');
      return false;
    }
    grunt.file.mkdir(tmpDir);

    var server_url = 'git.'+options.datacenter_location+'.gpaas.net';
    var repo_url = options.login+'@'+server_url+'/'+options.vhost+'.git';

    var done = this.async();

    var commands = [
      cmd('git', ['init'], tmpDir),
      cmd('git', ['remote', 'add', options.remote, 'ssh+git://'+repo_url], tmpDir),
      cmd('git', ['pull', options.remote, options.branch, '--depth=1'], tmpDir),
      copyIntoRepo(srcDir, tmpDir),
      cmd('git', ['add', '-A'], tmpDir),
      cmd('git', ['commit', '-m', options.message], tmpDir)
    ];

    if(options.git_clean){
      commands.push(ssh('clean', [options.vhost+'.git'], {server_url: server_url, login: options.login, ssh_key: file.read(options.ssh_key_path), password: options.password}));
    }

    if(options.tag){
      commands.push(cmd('git', ['tag', '-a', options.tag, '-m', '"'+options.tag_message+'"']));
    }

    commands.push(cmd('git', ['push', options.remote, options.branch], tmpDir));
    commands.push(ssh('deploy', [options.vhost+'.git'], {server_url: server_url, login: options.login, ssh_key: file.read(options.ssh_key_path), password: options.password}));

    async.series(commands, function(err, results){

      done();

      if(err){
        grunt.fail.warn(err);
        return false;
      }else{
        grunt.log.writeln('Cleaning '+tmpDir.green + ' directory ' );
        file.delete(tmpDir);
        grunt.log.writeln("Done!");
      }

    });

  });

};
