/**
 * Created by IrekRomaniuk on 6/29/2015.
 */
var moment = require('moment');
var config = require('./../config/config');
var email = require('./mailer');
var exec = require('ssh-exec');

module.exports = function scheduleJob(command, cron, emailSubject) {
    var buffers = [];
    //for testing '0 */1 * * * *' every minute or 'moment().add(5, 'minutes').toDate()'
    var job = new cron(moment().add(5, 'seconds').toDate(), function(){
        //console.log(command);
        stream = process.stdin
            .pipe(exec(command, config.user_host));
        stream.on('data', function (buffer) {
            buffers.push(buffer);
        });
        stream.on('end', function() {
            var buffer = Buffer.concat(buffers);
            // console.log(buffer.toString());
            config.emailSubject = 'attempt to renew VPN cert: ' + emailSubject;
            config.emailText = buffer.toString();
            email.send();
            //process.exit();
            // process.stdin.end();
        });
    }, true, 'America/Los_Angeles');
    return job;
};
