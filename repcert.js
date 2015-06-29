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
var moment = require('moment');
var config = require('./config/config');
var email = require('./modules/mailer');
var scheduler = require('./modules/scheduler');
var MyROBO = [];
var Days = 30;

require('./models/devices-client')(function callback(err, Hosts) {
    for (host in Hosts) {
        var wrapped = moment(Hosts[host].exp_cert);
        var difference = moment(wrapped).diff(moment(), 'days');
        if (( difference < Days) && (difference > 0)) {
            config.emailText += Hosts[host].hostname + ' ' + moment(Hosts[host].exp_cert).format("MMMM Do YYYY") + '\n';
            MyROBO.push(Hosts[host].hostname);
        }
    }
    //return(MyROBO);
    email.send();reset()
});

function reset() {
    // console.log(MyROBO);
    var CronJob = require('cron').CronJob;
    for (robo in MyROBO) {
        var resetIke = config.resetIke + MyROBO[robo] + ' -CA=' + config.CA;
        var lscertIKE = config.lscertIKE + MyROBO[robo];
        scheduler(config.envCMA+resetIke+';'+lscertIKE+';', CronJob, MyROBO[robo]);
    }
}



