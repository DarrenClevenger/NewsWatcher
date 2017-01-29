
let NewsProvider = require("./feedprovider.js");
let provider = new NewsProvider();
let EventProvider = require("./eventprovider");

setInterval(readNews, 30000);

let isRunning = false;

EventProvider.on("reading", (url) => {
    console.log("Reading news data from " + url);
});

EventProvider.on("error", (error) => {
    console.error(error);
});

EventProvider.DatabaseEvents().on("dbConnectionSuccess", () => {
    console.log("Database connection successful.");
});

EventProvider.DatabaseEvents().on("newsItemFound", (item) => {
    console.log("News item '" + item.Title + "' found from source: " + item.Source);
});

function readNews() {

    if (isRunning)
        return;

    isRunning = true;

    provider.getFeeds((feeds) => {

        for (let feed of feeds) {
            provider.readNews(feed.url, feed.source);
        }

        console.log("Next check in 30 seconds.");

        isRunning = false;
    });
}






