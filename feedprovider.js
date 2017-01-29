let EventEmitter = require("events");
let RssItem = require("./model/rssitem");
let FeedParser = require('feedparser');
let Feed = require("./model/feed");

let EventProvider = require("./eventprovider");

request = require('request');

let DBProvider = require("./dbprovider");

class NewsProvider {

    readNews(uri, source) {

        // Send event.
        EventProvider.emit("reading", uri);

        let req = request(uri);
        let feedparser = new FeedParser();
        feedparser.parent = this;

        let db = new DBProvider();

        req.on('error', function (error) {
            console.error(error);
        });

        req.on('response', function (res) {
            var stream = this;

            if (res.statusCode != 200)
                return EventProvider.emit('error', new Error('Bad status code'));

            stream.pipe(feedparser);
        });


        feedparser.on('error', function (error) {
            EventProvider.emit("error", error);
        });

        feedparser.on('readable', function () {
            // This is where the action is!
            let stream = this
            let meta = this.meta // **NOTE** the "meta" is always available in the context of the feedparser instance
            let item;

            while (item = stream.read()) {

                try {

                    EventProvider.emit("itemRead", item);

                    let rss = new RssItem();
                    rss.Author = item.author;
                    rss.Link = item.link;
                    rss.PubDate = item.pubdate;
                    rss.Title = item.title;
                    rss.Summary = item.summary;
                    rss.Description = item.description;
                    rss.Source = source;
                    rss.SourceUri = uri;

                    db.add(rss);
                }
                catch (err) {
                    EventProvider.emit("error", err);
                }
            }
        });

    }

    getFeeds(feedCallBack) {

        try {

            let db = new DBProvider();
            db.getFeeds(feedCallBack);
        }
        catch (err) {
            EventProvider.DatabaseEvents().emit("error", err);
        }
    }
}

module.exports = NewsProvider;
