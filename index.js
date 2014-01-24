var cheerio = require("cheerio");
var http = require("http");

function get(path, cb) {
    var str = "";

    http.get({
        host: "www.theonion.com",
        port: 80,
        path: path
    }, function(resp) {
        resp.on("data", function(chunk) {
            str += chunk.toString("utf-8");
        });
        resp.on("end", function() {
            cb(null, str);
        });
    }).on("error", function(err) {
        cb(err);
    });
}

function getDom(path, cb) {
    get(path, function(err, html) {
        if(err) {
            return cb(err);
        }

        return cb(null, cheerio.load(html));
    })
}

function getLatestHoroscopeUrl(cb) {
    getDom("/features/horoscope/", function(err, $) {
        if(err) {
            return cb(err);
        }

        cb(null, $(".article-list h1 a").first().attr("href"));
    });
}

function getLatestHoroscopeDom(cb) {
    getLatestHoroscopeUrl(function(err, url) {
        if(err) {
            return cb(err);
        }

        getDom(url, cb);
    });
}

function horoscopesFromDom($) {
    var horoscopes = {};

    $(".full-article > ul > li").each(function(elem) {
        this.find("strong").remove();
        horoscopes[this.attr("class")] = this.text().trim();
    });

    return horoscopes;
}

exports.latest = function(cb) {
    getLatestHoroscopeDom(function(err, $) {
        if(err) {
            return cb(err);
        }

        cb(null, horoscopesFromDom($));
    })
};

exports.latest(function(err, horos) {
    console.log(horos);
});
