function feedsanitizer() {

    console.log('feedsanitizer initialized');

    // a map between sanitized property names and unsanitized property names for meta feed information
    var metaPropertiesMap = {
        "feedUrl": ["feedUrl"],
        "title": ["title"],
        "description": ["description"],
        "websiteLink": ["link"],
        "feedLink": ["xmlurl"],
        "date": ["date", "pubdate"],
        "author": ["author"],
        "language": ["language"],
        "copyright": ["copyright"],
        "generator": ["generator"],
        "categories": ["categories"]
    };

    // a map between sanitized property names and unsanitized property names for feed items
    var itemPropertiesMap = {
        "title": ["title"],
        "description": ["description", "summary"],
        "summary": ["summary", "description"],
        "link": ["link", "origlink"],
        "date": ["date", "pubdate"],
        "author": ["author"],
        "guid": ["guid", "link", "origlink"],
        "commentsLink": ["comments"],
        "categories": ["categories"]
    };

    function getSanitizedValue(object, sanitizedProperty, unsanitizedProperies) {

        for (var index = 0; index < unsanitizedProperies.length; index++) {
            var property = unsanitizedProperies[index];
            if (object[property]) {
                return object[property];
            }
        }

        return undefined;
    }

    return {
        sanitize: function (feed) {
            var sanitizedMeta = {};
            for (var metaProperty in metaPropertiesMap) {
                sanitizedMeta[metaProperty] = getSanitizedValue(feed.meta, metaProperty, metaPropertiesMap[metaProperty]);
            }

            var sanitizedItems = [];
            for (var index = 0; index < feed.items.length; index++) {
                var unsanitizedItem = feed.items[index];

                var sanitizedItem = {};
                for (var itemProperty in itemPropertiesMap) {
                    sanitizedItem[itemProperty] = getSanitizedValue(unsanitizedItem,
                        itemProperty,
                        itemPropertiesMap[itemProperty]);
                }

                sanitizedItems.push(sanitizedItem);
            }

            return {
                meta: sanitizedMeta,
                items: sanitizedItems
            };
        }
    };
}

exports = module.exports = feedsanitizer;