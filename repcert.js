/**
 * Created by IrekRomaniuk on 6/22/2015.
 */
/*read certificates from mongodb and notify about coming expiration then attempt to renew and send results
 ResetIke
 #LSMcli mySrvr name pass ResetIke MyROBO -CA=OPSEC_CA -R=cer3452s
 ShowCert
 #cpca_client lscert [-stat Pending|Valid|Revoked|Expired|Renewed] [-kind SIC|IKE|User|LDAP] [-ser ser]
 #cpca_client lscert -stat Valid -kind IKE | grep -A 2 a0008DA73586C
 Run, Test, crontab and git:
 [linux-example]$node repcert.js [linux-example]$node repcert.js test
 ./dev-test/dev-repcert.js used for development
 0 7 1 * * /usr/bin/screen -dmS repcertjs /usr/bin/node /home/irek/repvpn/repcert.js > /dev/null 2>&1
 screen -S repcertjs;screen -r repcertjs;screen -ls;screen -X -S repcertjs quit;pkill -15 screen
 git commit -a "Comment"; git push -u origin master
     */
var moment = require('moment');
var config = require('./config/config');
var email = require('./modules/mailer');
var emailText = '';
var scheduler = require('./modules/scheduler');
var MyROBO = [];
var Days = 30;
var test = process.argv[2];

require('./models/devices-client')(function callback(err, Hosts) {
    for (host in Hosts) {
        var wrapped = moment(Hosts[host].exp_cert);
        var difference = moment(wrapped).diff(moment(), 'days');
        if (( difference < Days) && (difference >= 0)) {
            if (test) console.log('difference: ',difference);
            emailText += Hosts[host].hostname + ' ' + moment(Hosts[host].exp_cert).format("MMMM Do YYYY") + '\n';
            MyROBO.push({hostname:Hosts[host].hostname, exp_cert:Hosts[host].exp_cert});
        }
    }
    if (!test) email.send(config.emailTo, emailText, config.emailSubject);
    reset()
});

function reset() {
    var CronJob = require('cron').CronJob;
    var command = '';
    for (robo in MyROBO) {
        var resetIke = config.resetIke + MyROBO[robo].hostname + ' -CA=' + config.CA;
        var lscertIKE = config.lscertIKE + MyROBO[robo].hostname;
        //for testing '0 */1 * * * *' every minute or 'moment().add(5, 'minutes').toDate()'
        time = (moment(MyROBO[robo].exp_cert).subtract(7,'d').toDate() < moment().toDate())
            ?  moment().add(1,'h').toDate(): moment(MyROBO[robo].exp_cert).subtract(7,'d').toDate();
        time = moment(time).hours(7).minutes(0).toDate();
        if (test) {
            if (test=='now') time = moment().add(1, 'h').toDate();
             console.log('schedulejob:\n'+moment().toDate(), MyROBO[robo].hostname, MyROBO[robo].exp_cert, time);
             command = config.envCMA+lscertIKE+';'; }
        else command = config.envCMA+resetIke+';'+lscertIKE+';';
        scheduler(command, CronJob, MyROBO[robo].hostname, time, config.user_host);
    }
}



