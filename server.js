const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const app = express();
const data = require('./data');

let dataFromExtractProcess, dataFromTransportProcess;
const defaultUrl = "https://www.booking.com/searchresults.pl.html?label=gen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID&sid=2830d28dc51fda3e2775f9267a182620&sb=1&src=index&src_elem=sb&error_url=https%3A%2F%2Fwww.booking.com%2Findex.pl.html%3Flabel%3Dgen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID%3Bsid%3D2830d28dc51fda3e2775f9267a182620%3Bsb_price_type%3Dtotal%26%3B&ss=Turyn%2C+Piemont%2C+W%C5%82ochy&is_ski_area=&checkin_monthday=&checkin_month=&checkin_year=&checkout_monthday=&checkout_month=&checkout_year=&no_rooms=1&group_adults=2&group_children=0&b_h4u_keep_filters=&from_sf=1&ss_raw=turyn&ac_position=0&ac_langcode=pl&ac_click_type=b&dest_id=-130938&dest_type=city&iata=TRN&place_id_lat=45.070202&place_id_lon=7.68549&search_pageview_id=63e557da1ed500bb&search_selected=true&search_pageview_id=63e557da1ed500bb&ac_suggestion_list_length=5&ac_suggestion_theme_list_length=0";

app.get('/api/etl-process', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Content-Type",'application/json');
    etlProcess(res);
});

app.get('/api/extract-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    extractProcess(res);
});

app.get('/api/transform-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    transformProcess(res);
});

app.get('/api/load-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    loadProcess(res);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/WebScraper/index.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'dist/WebScraper')));

function extractProcess(responseToClient) {
    let extractedData, extractedDataString;

    extractedData = request(defaultUrl, (err, res, html) => {
        if (!err) {
            const $ = cheerio.load(html);
            extractedData = $('#hotellist_inner').children();
            extractedDataString = extractedData.toString();
            responseToClient.json( {'dataLength': extractedDataString.length} );
            dataFromExtractProcess = extractedData;
            responseToClient.end();
        }
    });
}

function transformProcess(responseToClient) {
    let transformedData = [];
    dataFromExtractProcess.each( (index) => {
        let hotelData = {};
        let hotelName = dataFromExtractProcess.eq(index).find('.sr-hotel__name').text().trim();
        let hotelRating = dataFromExtractProcess.eq(index).find('.bui-review-score__badge').text().trim();
        let hotelDescription = dataFromExtractProcess.eq(index).find('.hotel_desc').text().trim();
        let hotelLocation = dataFromExtractProcess.eq(index).find('.jq_tooltip').text().trim();
        if (hotelName) {
            hotelData = {
                'name': hotelName,
                'rating': hotelRating,
                'description': hotelDescription,
                'location': hotelLocation
            };
            transformedData.push(hotelData);
        }
    });
    dataFromTransportProcess = transformedData;
    responseToClient.json(transformedData);
}

function loadProcess(responseToClient) {
    let newHotel = [];
    console.log(data.length);
    // console.log(data[index].name);
    dataFromTransportProcess.find(obj => {

        for (let index = 0; index < data.length; index++) {

            // console.log(obj.name);
            if (data[index].name !== obj.name) {
                newHotel.push(obj);
            }
            // console.log(dataFromTransportProcess[index].name);
            // console.log(obj.name !== dataFromTransportProcess[index].name);
            // console.log(obj.name, dataFromTransportProcess[index].name);
            // return obj.name !== data[index].name;
            // let isUpdatedName = obj.name !== dataFromTransportProcess[index].name;
            // let isUpdatedRating = obj.rating[i] === dataFromTransportProcess[0].rating;
            // let isUpdatedDescription = obj.description[i] === dataFromTransportProcess[0].description;
            // let isUpdatedLocation = obj.location[i] === dataFromTransportProcess[0].location;
        }

    });
    console.log(newHotel);
    // if (newData) {
    //     newHotel.push(newData);
    // data.push(newData);
    // }
    // let isUpdatedData = data.find(obj => {
    //     return obj.name === dataFromTransportProcess[0].name;
    // });
    // console.log(isUpdatedData);
    // dataFromTransportProcess.each(function (index) {
    //     let
    //     console.log(transformedData[index].name === data[index].name);
    //     console.log(transformedData[index].rating === data[index].rating);
    //     console.log(transformedData[index].description === data[index].description);
    //     console.log(transformedData[index].location === data[index].location);
    // });
    // let test = [];
    // test.push(transformedData[1]);
    // test.push(data[1]);

    // console.log(transformedData[1], data[1]);
    // console.log(transformedData[1].name == data[1].name);
    responseToClient.json(newHotel);
}

function etlProcess(responseToClient) {
    request(defaultUrl, (err, res, html) => {
        if (!err) {
            const $ = cheerio.load(html);
            const allHotels = $('#hotellist_inner').children(); // Hotels on first page
            console.log(allHotels);
            let hotels = [];
            allHotels.each(function (index) {
                let hotelData = {};
                let hotelName = allHotels.eq(index).find('.sr-hotel__name').text().trim();
                let hotelRating = allHotels.eq(index).find('.bui-review-score__badge').text().trim();
                let hotelDescription = allHotels.eq(index).find('.hotel_desc').text().trim();
                let hotelLocation = allHotels.eq(index).find('.jq_tooltip').text().trim();
                // console.log(hotelName);
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

            fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.json", JSON.stringify(hotels), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
            responseToClient.json(data);
        }
    });
}

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
