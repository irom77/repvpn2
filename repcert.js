/**
 * Created by IrekRomaniuk on 6/22/2015.
 */
/*
 ResetIke
 #LSMcli mySrvr name pass ResetIke MyROBO -CA=OPSEC_CA -R=cer3452s
 ShowCert
 #cpca_client lscert [-stat Pending|Valid|Revoked|Expired|Renewed] [-kind SIC|IKE|User|LDAP] [-ser ser]
 #cpca_client lscert -stat Valid -kind IKE | grep -A 2 a0008DA73586C
 Run:
 [linux-example]$node repcert.js
     */
var exec = require('ssh-exec');
var moment = require('moment');
var config = require('./models/config');
var email = require('./models/mailer');
var MyROBO = [];
var now = moment(new Date()); //.format("MMMM Do YYYY");
var days = 30;

require('./models/devices-client')(function callback(err, Hosts) {
    // console.log(Hosts);
    for (host in Hosts) {
        var wrapped = moment(Hosts[host].exp_cert);
        var difference = moment(wrapped).diff(now, 'days');
        // console.log(moment(wrapped).fromNow())
        if (( difference < days) && (difference > 0)) {
            //    console.log(Hosts[host].hostname, moment(Hosts[host].exp_cert).format("MMMM Do YYYY"));
            config.emailText += Hosts[host].hostname + ' ' + moment(Hosts[host].exp_cert).format("MMMM Do YYYY") + '\n';
            MyROBO.push(Hosts[host].hostname);
        }
    }
    email.send();reset()
});

function reset() {
    // console.log(MyROBO);
    var CronJob = require('cron').CronJob;
    for (robo in MyROBO) {
        var resetIke = config.resetIke + MyROBO[robo] + ' -CA=' + config.CA;
        var lscertIKE = config.lscertIKE + MyROBO[robo];
        scheduleJob(config.envCMA+resetIke+';'+lscertIKE+';', CronJob, MyROBO[robo]);
    }
}

function scheduleJob(command, cron, emailSubject) {
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
}



