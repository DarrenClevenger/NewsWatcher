var NewsProvider = require("../feedprovider.js");
var provider = new NewsProvider();

describe("Read RSS News Feed", function () {
    provider.readNews("http://feeds.feedburner.com/breitbart");
});

