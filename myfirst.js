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
    //  var path = 'https://www.autotrader.co.uk/car-search?sort=monthly-price-asc&radius=' + q.radius + '&postcode=' + q.postcode + '&onesearchad=Used&onesearchad=Nearly%20New&onesearchad=New&make=' + q.make + '&model=' + q.model + '&aggregatedTrim=SR&min-monthly-price=' + q.min_monthly_price + '&max-monthly-price=' + q.max_monthly_price + '&deposit=' + q.deposit + '&term=36&yearly-mileage=' + q.yearly_mileage;
    var path = 'https://www.autotrader.co.uk/car-search?postcode='+q.postcode+'&radius=' + q.radius + '&make=' + q.make + '&model=' + q.model + '&page=' + q.page + '&sort=default&colour=' + q.colour + '&fuel-type=' + q.fuel_type + '&price-from=' + q.price_from + '&price-to=' + q.price_to + '&onesearchad=' + q.onesearchad+'&year-to='+q.year_to+'&year-from='+q.year_from;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    let devtoList = [];
                    let pages = [];
	            let models = [];
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
	            $('.sf-flyout__scrollable-options').each(function (i, elem) {
                        models[i] = {
                            model: $(this).html(),
                        }
                    });
                    var meta = {
                        count_products: $(html).find("h1.search-form__count.js-results-count").text(),
                        pages: pages,
                        param: q,
                        url: path,
                        models : models[1].model
                  }
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var obj = {'cars': devtoList, 'params': meta}
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})

app.get('/show_product', function (req, res, next) {
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/classified/advert/' + q.id + '?onesearchad=New&onesearchad=Nearly%20New&onesearchad=Used&postcode=cv12ue&advertising-location=at_cars&sort=sponsored&radius=1501&page=1';
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var overview = [];
                    var thumbs = [];
                    var details = [];
                    var phones = [];
                    $('ul.keyFacts__list li').each(function (i, elem) {
                        overview[i] = {
                            view: $(this).html(),
                        }
                    });
                    $('.fpaImages__thumbs figure.fpaImages__thumb').each(function (i, elem) {
                        thumbs[i] = {
                            thumb: $(this).find('img').data('src'),
                        }
                    });
                    $('.seller_private__telephone').each(function (i, elem) {
                        phones[i] = {
                            phone: $(this).text(),
                        }
                    });
                    if (phones) {
                        phones = $(html).find('.seller_private__telephone').text();
                    }
                    $('section.fpaSpecifications .fpaSpecifications__expandingSection').each(function (i, elem) {
                        details[i] = {
                            detail_heading: $(this).find('h3').text(),
                            detail: $(this).find('.fpaSpecifications__list').html(),
                        }
                    });
                    var data = {
                        overview: overview,
                        desc: $(html).find(".fpa-description-text").text(),
                        thumbs: thumbs,
                        title: $(html).find("h1 span.vehicle-title__text").text(),
                        phones: $(html).find("section.seller_trade .seller_trade__telephone").text(),
                        price: $(html).find(".vehicle-price-info--total p").text(),
                        distance: $(html).find(".seller_private__location").text(),
                        details: details,
                    }
                    var obj = {'cars': q, 'data': data}
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})

app.listen(2222, function () {
    console.log('CORS-enabled web server listening on port 80')
})
