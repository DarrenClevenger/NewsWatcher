let EventEmitter = require("events");
let MongoClient = require("mongodb").MongoClient;
let Feed = require("./model/feed");
let EventProvider = require("./eventprovider");

const connectionUrl = "mongodb://localhost:27017/News";

class DBProvider {

    add(data) {

        MongoClient.connect(connectionUrl, (err, db) => {

            try {
                if (err != null) {
                    EventProvider.DatabaseEvents().emit("dbConnectionError", err);
                }
                else {
                    let col = db.collection("NewsItem");
                    col.find({ Title: data.Title }).toArray(function (err, docs) {

                        try {
                            if (err != null)
                                EventProvider.DatabaseEvents().emit("dbReadDataError", err);

                            if (docs.length == 0) {
                                col.insert(data, function (err, res) {
                                    if (err != null) {
                                        EventProvider.DatabaseEvents().emit("dbInsertError", err);
                                    }

                                    EventProvider.DatabaseEvents().emit("newsItemFound", data);

                                    db.close();
                                });
                            }
                            else {
                                db.close();
                            }
                        }
                        catch (err) {
                            EventProvider.emit("error", err);
                        }
                    });
                }
            }
            catch (err) {
                EventProvider.emit("error", err);
            }
        });
    }

    getFeeds(feedCallBack) {

        var dbProvider = this;

        MongoClient.connect(connectionUrl, (err, db) => {

            try {

                if (err != null) {
                    EventProvider.DatabaseEvents().emit("dbConnectionError", err);
                }
                else {
                    let col = db.collection("Feed");

                    col.find({}).toArray(function (err, items) {

                        try {
                            if (err != null)
                                EventProvider.DatabaseEvents().emit("dbReadDataError", err);

                            let feeds = Array();

                            for (const item of items) {
                                let feed = new Feed();
                                feed.cat = item.cat;
                                feed.source = item.source;
                                feed.url = item.url;

                                feeds.push(feed);
                            }

                            feedCallBack(feeds);
                        }
                        catch (err) {
                            EventProvider.emit("error", err);
                        }
                    });
                }
            }
            catch (err) {
                EventProvider.emit("error", err);
            }

        });
    }
}

module.exports = DBProvider;