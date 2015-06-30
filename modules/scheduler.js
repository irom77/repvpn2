/**
 * Created by IrekRomaniuk on 6/29/2015.
 */
    /*schedule 'command' with 'target' using 'cron' at 'time' on 'host'*/
//var moment = require('moment');
var config = require('./../config/config');
var email = require('./mailer');
var exec = require('ssh-exec');

module.exports = function scheduleJob(command, cron, target, time, host) {
    var buffers = [];
    var job = new cron(time, function(){
        stream = process.stdin
            .pipe(exec(command, host));
        stream.on('data', function (buffer) {
            buffers.push(buffer);
        });
        stream.on('end', function() {
            var buffer = Buffer.concat(buffers);
            // console.log(buffer.toString());
            emailSubject = 'attempt to renew VPN cert: ' + target;
            emailText = buffer.toString();
            email.send(config.emailTo, emailText, emailSubject);
            //process.exit();
            // process.stdin.end();
        });
    }, true, 'America/Los_Angeles');
    return job;
};
