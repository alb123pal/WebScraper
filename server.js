const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const http = require('http');
const app = express();
const data = require('./data');

app.get('/api/hotels', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // important for development - allow to connection between different port
    res.header("Content-Type",'application/json');
    res.json(data);
});

//Parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'dist/WebScraper')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/WebScraper/index.html'));
});

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => console.log(`Running on localhost:${port}`));

let url = "https://www.booking.com/searchresults.pl.html?label=gen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID&sid=2830d28dc51fda3e2775f9267a182620&sb=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.pl.html%3Flabel%3Dgen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID%3Bsid%3D2830d28dc51fda3e2775f9267a182620%3Bsb_price_type%3Dtotal%26%3B&ss=Turyn%2C+Piemont%2C+W%C5%82ochy&is_ski_area=&checkin_monthday=&checkin_month=&checkin_year=&checkout_monthday=&checkout_month=&checkout_year=&no_rooms=1&group_adults=2&group_children=0&b_h4u_keep_filters=&from_sf=1&ss_raw=turyn&ac_position=0&ac_langcode=pl&ac_click_type=b&dest_id=-130938&dest_type=city&iata=TRN&place_id_lat=45.070202&place_id_lon=7.68549&search_pageview_id=63e557da1ed500bb&search_selected=true&search_pageview_id=63e557da1ed500bb&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0";

request(url, function (err, res, html) {
   if(!err) {
       const $ = cheerio.load(html);
       const allHotels = $('#hotellist_inner').children(); // Hotel on first page
       let hotels = [];
       allHotels.each(function(index) {
           let hotelData = {};
           let hotelName = allHotels.eq(index).find('.sr-hotel__name').text().trim();
           let hotelRating = allHotels.eq(index).find('.bui-review-score__badge').text().trim();
           let hotelDescription = allHotels.eq(index).find('.hotel_desc').text().trim();
           let hotelLocation = allHotels.eq(index).find('.jq_tooltip').text().trim();
           console.log(hotelName);
           if (hotelName) {
               hotelData = {
                   'name': hotelName,
                   'rating': hotelRating,
                   'description': hotelDescription,
                   'location': hotelLocation
               };
               hotels.push(hotelData);

           }
       });

       fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.json", JSON.stringify(hotels), function(err) {
           if(err) {
               return console.log(err);
           }

           console.log("The file was saved!");
       });


   }

});