//#!/usr/bin/env nodejs
var http = require('http');
let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');
var url = require('url');
var text = '';
http.createServer(function (req, res) {

//res.header("Access-Control-Allow-Origin", "*");
         var q = url.parse(req.url, true).query;
        axios.get('https://www.autotrader.co.uk/car-search?postcode=cv12ue&radius=10&make='+q.make+'&page='+q.page+'&sort=default&onesearchad=Used&onesearchad=Nearly%2$
        .then((response) => {
            if (response.status === 200) {
        //      console.log(response.data);
                const html = response.data;
                const $ = cheerio.load(html);
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
//                      var text = '';
                text += '<table border="2px">';
                text += '<tr><td>productId</td><td>title</td><td>Image</td><td>Listing</td><td>description</td></tr>';
                $(devtoList).each(function (key, value) {
                    text += '<tr>var<td>' + value.product_id + '</td><td>' + value.name + '</td><td>' + value.image + '</td><td>' + value.listing + '</td><td>' + value$
                });
                text += '</table>';
                 console.log('now file is loaded');
var  obj ={'cars' : devtoList , 'url' : q}
res.writeHead(200, {'Content-Type': 'application/json'});
   res.end(JSON.stringify(obj));

                 }
        }, (error) => console.log(err));

  //res.writeHead(200, {'Content-Type': 'text/plain'});
//  res.end(text);
}).listen(8080, '178.128.144.191');
console.log('Server running at http://localhost:8080/');
