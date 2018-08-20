var express = require('express')
var cors = require('cors')
let axios = require('axios');
var http = require('http');
let cheerio = require('cheerio');
let fs = require('fs');
var url = require('url');
var app = express()
app.use(cors())

app.get('/', function (req, res, next) {
    var q = url.parse(req.url, true).query;
    axios.get('https://www.autotrader.co.uk/car-search?postcode=cv12ue&radius=10&make=' + q.make + '&page=' + q.page + '&sort=default&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&search-target=usedcars')
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    console.log(req);
                    let devtoList = [];
                    $('li.search-page__result').each(function (i, elem) {
                        devtoList[i] = {
                            product_id: $(this).attr('id'),
                            name: $(this).find('h2').text().trim(),
                            image: $(this).find(".listing-main-image .js-click-handler img").attr('src'),
                            listings: $(this).find(".listing-key-specs ").html(),
                            description: $(this).find("p").text(),
                            price: $(this).find(".vehicle-price").text(),
                        }
                    });
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {'cars': devtoList, 'params': q}
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
    console.log('CORS-enabled web server listening on port 80')
})

app.get('/show_product', function (req, res, next) {
    var q = url.parse(req.url, true).query;
    res.writeHead(200, {'Content-Type': 'application/json'});
    var obj = {'cars': q, 'id': '321'}
    res.end(JSON.stringify(obj));
})

app.listen(8000, function () {
    console.log('CORS-enabled web server listening on port 80')
})
