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
    //?sort=monthly-price-asc&radius=1500&postcode=cv12ue&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&make=HONDA&model=CIVIC&aggregatedTrim=SR&min-monthly-price=300&max-monthly-price=1000&deposit=1000&term=36&yearly-mileage=10000
//    axios.get('https://www.autotrader.co.uk/car-search?postcode=cv12ue&radius=10&make=' + q.make + '&page=' + q.page + '&sort=default&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&search-target=usedcars')
    var path = 'https://www.autotrader.co.uk/car-search?sort=monthly-price-asc&radius=' + q.radius + '&postcode=' + q.postcode + '&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&make=' + q.make + '&model=' + q.model + '&aggregatedTrim=SR&min-monthly-price=' + q.min_monthly_price + '&max-monthly-price=' + q.max_monthly_price + '&deposit=' + q.deposit + '&term=36&yearly-mileage=' + q.yearly_mileage;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    let devtoList = [];
                    let pages = [];
                    $('li.search-page__result').each(function (i, elem) {
                        devtoList[i] = {
                            product_id: $(this).attr('id'),
                            name: $(this).find('h2').text().trim(),
                            image: $(this).find(".listing-main-image .js-click-handler img").attr('src'),
                            listings: $(this).find(".listing-key-specs").html(),
                            title: $(this).find("p.listing-attention-grabber").text(),
                            description: $(this).find("p").text(),
                            price: $(this).find(".vehicle-price").text(),
                        }
                    });
                    $('li.pagination--li').each(function (i, elem) {
                        pages[i] = {
                            page: $(this).text(),
                        }
                    });
                    var meta = {
                        count_products: $(html).find("h1.search-form__count.js-results-count").text(),
                        pages: pages,
                        param: q,
                        url: path
                    }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {'cars': devtoList, 'params': meta}
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
