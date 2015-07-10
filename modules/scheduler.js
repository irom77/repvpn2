/**
 * Created by IrekRomaniuk on 6/29/2015.
 */
    /*schedule 'command' with 'target' using 'cron' at 'time' on 'host'*/
//var moment = require('moment');
var config = require('./../config/config');
var email = require('./mailer');
var exec = require('ssh-exec');
test=false; //test = process.argv[2];

module.exports = function scheduleJob(command, cron, target, time, host) {
    if (test) console.log('\nRunJob:\n'+command+'\n'+target, time, host+'\n');
    else {
        var buffers = [];
        var job = new cron(time, function () {
            stream = process.stdin
                .pipe(exec(command, host));
            stream.on('data', function (buffer) {
                buffers.push(buffer);
            });
            stream.on('end', function () {
                var buffer = Buffer.concat(buffers);
                if (test) console.log(buffer.toString());
                emailSubject = 'attempt to renew VPN cert: ' + target;
                emailText = buffer.toString();
                email.send(config.emailTo, emailText, emailSubject);
                //process.exit();
                // process.stdin.end();
            });
        }, true, 'America/Los_Angeles');
        return job
    }
};
