/**
 * Created by IrekRomaniuk on 6/22/2015.
 */
/*read certificates from mongodb and notify about coming expiration then attempt to renew and send results
 ResetIke
 #LSMcli mySrvr name pass ResetIke MyROBO -CA=OPSEC_CA -R=cer3452s
 ShowCert
 #cpca_client lscert [-stat Pending|Valid|Revoked|Expired|Renewed] [-kind SIC|IKE|User|LDAP] [-ser ser]
 #cpca_client lscert -stat Valid -kind IKE | grep -A 2 a0008DA73586C
 Run:
 [linux-example]$node repcert.js
 ./dev-test/dev-repcert.js used for development
 crontab
 0 7 1 * * /usr/bin/node /home/irek/repvpn/repcert.js >> /home/irek/repvpn/repcert.log > /dev/null 2>&1
     */
var moment = require('moment');
var config = require('./config/config');
var email = require('./modules/mailer');
var emailText;
var scheduler = require('./modules/scheduler');
var MyROBO = [];
var Days = 30;

require('./models/devices-client')(function callback(err, Hosts) {
    for (host in Hosts) {
        var wrapped = moment(Hosts[host].exp_cert);
        var difference = moment(wrapped).diff(moment(), 'days');
        if (( difference < Days) && (difference > 0)) {
            emailText += Hosts[host].hostname + ' ' + moment(Hosts[host].exp_cert).format("MMMM Do YYYY") + '\n';
            MyROBO.push({hostname:Hosts[host].hostname, exp_cert:Hosts[host].exp_cert});
        }
    }
    //return(MyROBO);
    email.send(config.emailTo, emailText, config.emailSubject);reset()
});

function reset() {
    // console.log(MyROBO);
    var CronJob = require('cron').CronJob;
    for (robo in MyROBO) {
        var resetIke = config.resetIke + MyROBO[robo].hostname + ' -CA=' + config.CA;
        var lscertIKE = config.lscertIKE + MyROBO[robo].hostname;
        //for testing '0 */1 * * * *' every minute or 'moment().add(5, 'minutes').toDate()'
        time = (moment(MyROBO[robo].exp_cert).subtract(7,'d').toDate() < moment().toDate())
            ?  moment().add(1,'d').toDate(): moment(MyROBO[robo].exp_cert).subtract(7,'d').toDate();
        timetest = moment().add(5, 'seconds').toDate();
        //console.log(moment().toDate(), MyROBO[robo].hostname, MyROBO[robo].exp_cert, time);
        scheduler(config.envCMA+resetIke+';'+lscertIKE+';', CronJob, MyROBO[robo].hostname, time, config.user_host);
    }
}



