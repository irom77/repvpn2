/**
 * Created by IrekRomaniuk on 6/24/2015.
 $ mail -s "Test Subject" iromaniuk@commonwealth.com < /dev/null
 $ echo "Test message" | mail -s "Test Subject" iromaniuk@commonwealth.com
 */
var config = require('./../config/config');
var email = require('emailjs');

var server  = email.server.connect({
    host:    config.smptRelay
    //ssl:     true
});

// send the message and get a callback with an error or details of the message that was sent
module.exports.send = function (emailTo, emailText, emailSubject ) {
    server.send({
        text: emailText,
        from: config.emailFrom,
        to: emailTo,
        //cc:      "else <else@your-email.com>",
        subject: emailSubject
    }, function (err, message) { /*console.log(err || message); */
    });
};
