/**
 * Created by IrekRomaniuk on 5/22/2015.
 */
/*
 ResetSic
 #LSMcli mySrvr name pass ResetSic MyROBO aw47q1
 #LSMcli mySrvr name pass ResetSic MyFixedIPROBO sp36rt1 -I=10.20.30.1
 ResetIke
 #LSMcli mySrvr name pass ResetIke MyROBO -CA=OPSEC_CA -R=cer3452s -KEY=ad23fgh
 ShowCert
 #cpca_client lscert [-stat Pending|Valid|Revoked|Expired|Renewed] [-kind SIC|IKE|User|LDAP] [-ser ser]
 #cpca_client lscert -stat Valid -kind IKE | grep -A 2 a0008DA73586C
 Run:
 [linux-example]$node repcert.js a0008DA73586C
     */

var exec = require('ssh-exec');
var moment = require('moment');
var config = require('./models/config');
var email = require('./models/mailer');
var MyROBO = process.argv[2] || 'a0008DA73586C';
var now = moment(new Date()); //.format("MMMM Do YYYY");
var days = 30;

require('./models/devices-client')(function callback(err, Hosts) {
    // console.log(Hosts);
    for (host in Hosts){
        //if (Hosts[host].hostname == MyROBO)
        //    console.log(Hosts[host].hostname);
        var wrapped = moment(Hosts[host].exp_cert);
        var difference = moment(wrapped).diff(now, 'days');
        // console.log(moment(wrapped).fromNow())
        if (( difference < days) && (difference > 0))
        //    console.log(Hosts[host].hostname, moment(Hosts[host].exp_cert).format("MMMM Do YYYY"));
            config.emailText += Hosts[host].hostname + moment(Hosts[host].exp_cert).format("MMMM Do YYYY") + '\n'
    }
    email.send();
});


var resetSic = config.resetSic + MyROBO + ' ' + config.repSic;
var resetIke = config.resetIke + MyROBO + ' -CA=' + config.CA;
// console.log(resetSic + '\n' + resetIke);
// using ~/.ssh/id_rsa as the private key
// or edgevpn
var testcli = 'mdsenv repvpnsc1w;echo $FWDIR';
var resetIkecli = 'mdsenv repvpnsc1w;' + resetIke;
// console.log(resetIkecli);
// exec(resetIkecli, config.user_host).pipe(process.stdout);



