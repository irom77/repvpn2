/**
 * Created by IrekRomaniuk on 4/24/2015.
 */
var config = require('./config');
var MongoClient = require('mongodb').MongoClient;

module.exports = function(callback) {
    MongoClient.connect(config.dbadmin_uri, function (err, db) {
        if (err) throw err;
        // console.log('Successfully connected');
        var collection = db.collection('repvpn2');
        collection.find().toArray(function (err, results_array) {
            // console.log('Found results:', result_array);
            callback(err, results_array);
            db.close();
            });
    });
};
