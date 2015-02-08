function FeedParserError(feedUrl, message) {
    this.feedUrl = feedUrl || "";
    this.message = message || "";
}

FeedParserError.prototype.toString = function () {
    return 'ERROR: ' + this.feedUrl + ', ' + this.message;
};

exports = module.exports = FeedParserError;
