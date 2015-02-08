var FeedParserError = require("./feedparsererror");
var Promise = require("bluebird");
var feedsanitizer = require("./feedsanitizer")();
var http = require('http');
var request = Promise.promisifyAll(require('request'));
var FeedParser = require('feedparser');

function mochafeedparser() {
    "use strict";

	var pool = new http.Agent({ 'maxSockets': Infinity });
	var maxRedirects = 20;
	
	function requestInternal(url) {
		return request({ uri: url, maxRedirects: maxRedirects, pool: pool });
	}
	
	function readFromSource(feedUrl) {
        return new Promise(function (resolve, reject) {
			if (!feedUrl) throw new FeedParserError("", "feedUrl is not present");
			var feed = { meta: {}, items: [] };
			
			try {
				requestInternal(feedUrl).on("response", function (response) {
					if (response.statusCode != 200) {
						reject(new FeedParserError(feedUrl, response.statusCode + ': Bad response'));
					}
					
					response.pipe(new FeedParser()).on("readable", function () {
						try {
							feed.meta = this.meta;
							feed.meta.feedUrl = feedUrl;
							var item;
							while (item = this.read()) {
								feed.items.push(item);
							}
						} catch (e) {
							reject(new FeedParserError(feedUrl, e));
						}
					}).on("end", function () {
						resolve(feed);
					}).on("error", function (e) {
						reject(new FeedParserError(feedUrl, e));
					});
				}).on("error", function (e) {
					reject(new FeedParserError(feedUrl, e));
				});
			} catch (e) {
				reject(new FeedParserError(feedUrl, e));
			}
		});
    }
	
    function parse(feedUrl) {
        return new Promise(function (resolve, reject) {
			try {
				readFromSource(feedUrl).then(function (feed) {
					resolve(feedsanitizer.sanitize(feed));
				}, function (reason) {
					reject(new FeedParserError(feedUrl, reason));
				});
			} catch (e) {
				reject(new FeedParserError(feedUrl, e));
			}
		});
    }

	return {
		readFromSource: readFromSource,
		parse: parse
    };
}

exports = module.exports = mochafeedparser;
