const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const csv = require("fast-csv");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const http = require("http");
const app = express();
let data = require('./data');

let dataFromExtractProcess = [], dataFromTransportProcess = [], newDataFromLoadProcess = [], offset = 15;
let defaultUrl = '';
let extractedData = [], extractedDataString = '', newHotelFromETLProcess = [];
const ws = fs.createWriteStream('data.csv');

app.get('/api/etl-process', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Content-Type",'application/json');
    etlProcess(res, req.query.subpages);
});


app.get('/api/get-hotels', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header("Content-Type",'application/json');
    res.json(data);
});

app.get('/api/extract-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    extractProcess(res, req.query.subpages);
});

app.get('/api/transform-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    transformProcess(res);
});

app.get('/api/load-data', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    loadProcess(res);
});

app.get('/api/export-data-to-csv', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    exportToCSV(res);
});

app.get('/api/clear-database', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    clearDatabase(res);
});

app.get('/api/export-hotel-to-text', (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    exportHotelToText(res, req.query.idHotel);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/WebScraper/index.html'));
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(path.join(__dirname, 'dist/WebScraper')));

function extractProcess(responseToClient, subpages = 1) {
    defaultUrl = `https://www.booking.com/searchresults.pl.html?aid=304142&label=gen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID&sid=2830d28dc51fda3e2775f9267a182620&ac_click_type=b&ac_position=0&class_interval=1&dest_id=-130938&dest_type=city&from_sf=1&group_adults=2&group_children=0&iata=TRN&label_click=undef&no_rooms=1&raw_dest_type=city&room1=A%2CA&sb_price_type=total&search_selected=1&shw_aparth=1&slp_r_match=0&src=index&src_elem=sb&srpvid=82ef8111fd0306c2&ss=Turyn%2C%20Piemont%2C%20W%C5%82ochy&ss_raw=turyn&ssb=empty&rows=15&offset=${offset}`;

    request(defaultUrl, (err, res, html) => {
        if (!err) {
            const $ = cheerio.load(html);
            extractedData = $('#hotellist_inner').children();
            extractedDataString = extractedData.toString();
            dataFromExtractProcess.push(extractedData);
            if (subpages == 1) {
                responseToClient.json( {'dataLength': extractedDataString.length} );
                responseToClient.end();
            } else {
                offset += 15;
                extractProcess(responseToClient, parseInt(subpages - 1));
            }
        }
    });
}

function transformProcess(responseToClient) {
    let transformedData = [];
    for(let i = 0; i < dataFromExtractProcess.length; i++) {
        dataFromExtractProcess[i].each( (index) => {
            let hotelData = {};
            let hotelName = dataFromExtractProcess[i].eq(index).find('.sr-hotel__name').text().trim();
            let hotelRating = dataFromExtractProcess[i].eq(index).find('.bui-review-score__badge').text().trim();
            let hotelDescription = dataFromExtractProcess[i].eq(index).find('.hotel_desc').text().trim();
            let hotelLocation = dataFromExtractProcess[i].eq(index).find('.jq_tooltip').text().trim();
            let hotelImage = dataFromExtractProcess[i].eq(index).find('.hotel_image').attr('src');
            if (hotelName) {
                const floatValueRating = +(hotelRating.replace(/,/,'.'));
                hotelData = {
                    'name': hotelName,
                    'rating': hotelRating ? floatValueRating: '-',
                    'description': hotelDescription,
                    'location': hotelLocation,
                    'imageUrl': hotelImage
                };
                transformedData.push(hotelData);
            }
        });

    }
    dataFromTransportProcess = transformedData;
    responseToClient.json(transformedData);
}

function exportHotelToText(responseToClient, id) {
    fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.txt", JSON.stringify(data[id]), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
        responseToClient.json(true);
    });
}

function loadProcess(responseToClient) {
    let newHotelsResponseForClient = [],
        found;
    for (let i = 0; i < dataFromTransportProcess.length; i++) {
        let newDataFromLoadProcessJSON = {};

        found = false;
        for (let j = 0; j < data.length; j++) {
            if (dataFromTransportProcess[i].name === data[j].name) {
                found = true;
                break;
            }
        }
        if (found === false) {
            newDataFromLoadProcessJSON = {
                name: dataFromTransportProcess[i].name,
                rating: dataFromTransportProcess[i].rating  ? dataFromTransportProcess[i].rating : '-',
                description: dataFromTransportProcess[i].description,
                location: dataFromTransportProcess[i].location,
                imageUrl:  dataFromTransportProcess[i].imageUrl ? dataFromTransportProcess[i].imageUrl : 'assets/noimage.png'
            };
            let preparedJSON = prepareJSONtoSave(newDataFromLoadProcessJSON);
            data.push(preparedJSON);
            newHotelsResponseForClient.push(preparedJSON);
        }
    }
    responseToClient.json({'newHotels': newHotelsResponseForClient, 'allHotels': data});
    fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.json", JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    newDataFromLoadProcess = [];
    dataFromTransportProcess = [];
    dataFromExtractProcess = [];
    extractedDataString = '';
}

function exportToCSV(responseToClient) {
    let jsonToSaved = prepareJSONtoSave();
    csv.write(jsonToSaved, {headers: true})
        .pipe(ws);
    responseToClient.json(true);
}

function prepareJSONtoSave(jsonToPrepare = data) {
    let stringifyJSON = JSON.stringify(jsonToPrepare);
    let preparedJSON = stringifyJSON.replace(/ś/gi, 's');
    preparedJSON = preparedJSON.replace(/ę/gi, 'e');
    preparedJSON = preparedJSON.replace(/ą/gi, 'a');
    preparedJSON = preparedJSON.replace(/ć/gi, 'c');
    preparedJSON = preparedJSON.replace(/ż/gi, 'z');
    preparedJSON = preparedJSON.replace(/ż/gi, 'z');
    preparedJSON = preparedJSON.replace(/ń/gi, 'n');
    preparedJSON = preparedJSON.replace(/ó/gi, 'o');
    preparedJSON = preparedJSON.replace(/ł/gi, 'l');
    preparedJSON = preparedJSON.replace(/\\n/g, "");
    preparedJSON = preparedJSON.replace(/Pokaz na mapie/g, "");
    preparedJSON = preparedJSON.replace(/Pokaz ceny/g, "");
    return JSON.parse(preparedJSON);
}

function etlProcess(responseToClient, subpages = 1) {
    defaultUrl = `https://www.booking.com/searchresults.pl.html?aid=304142&label=gen173nr-1DCAEoggI46AdIHlgEaLYBiAEBmAEeuAEXyAEM2AED6AEB-AECiAIBqAID&sid=2830d28dc51fda3e2775f9267a182620&ac_click_type=b&ac_position=0&class_interval=1&dest_id=-130938&dest_type=city&from_sf=1&group_adults=2&group_children=0&iata=TRN&label_click=undef&no_rooms=1&raw_dest_type=city&room1=A%2CA&sb_price_type=total&search_selected=1&shw_aparth=1&slp_r_match=0&src=index&src_elem=sb&srpvid=82ef8111fd0306c2&ss=Turyn%2C%20Piemont%2C%20W%C5%82ochy&ss_raw=turyn&ssb=empty&rows=15&offset=${offset}`;
    request(defaultUrl, (err, res, html) => {
        if (!err) {
            const $ = cheerio.load(html);
            const allHotels = $('#hotellist_inner').children();
            let hotels = [];
            allHotels.each(function (index) {
                let hotelData = {};
                let hotelName = allHotels.eq(index).find('.sr-hotel__name').text().trim();
                let hotelRating = allHotels.eq(index).find('.bui-review-score__badge').text().trim();
                let hotelDescription = allHotels.eq(index).find('.hotel_desc').text().trim();
                let hotelLocation = allHotels.eq(index).find('.jq_tooltip').text().trim();
                let hotelImage = allHotels.eq(index).find('.hotel_image').attr('src');
                if (hotelName) {
                    const floatValueRating = +(hotelRating.replace(/,/,'.'));
                    hotelData = {
                        'name': hotelName,
                        'rating': hotelRating ? floatValueRating : '-',
                        'description': hotelDescription,
                        'location': hotelLocation,
                        'imageUrl': hotelImage
                    };

                    hotels.push(hotelData);
                }
            });

            let found;
            for (let i = 0; i < hotels.length; i++) {
                let newData = {};

                found = false;
                for (let j = 0; j < data.length; j++) {
                    if (hotels[i].name === data[j].name) {
                        found = true;
                        break;
                    }
                }
                if (found === false) {
                    newData = {
                        name: hotels[i].name,
                        rating: hotels[i].rating,
                        description: hotels[i].description,
                        location: hotels[i].location,
                        imageUrl: hotels[i].imageUrl
                    };
                    let preparedJSON = prepareJSONtoSave(newData);
                    newHotelFromETLProcess.push(newData);
                    data.push(preparedJSON);
                }
            }

            if (subpages == 1) {
                sendDataToClient(responseToClient);
            } else {
                offset += 15;
                etlProcess(responseToClient, parseInt(subpages - 1));
            }
        }
    });
}

function sendDataToClient(responseToClient) {
    fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.json", JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });
    responseToClient.json({'allHotels': data, 'newHotels': newHotelFromETLProcess});
    newHotelFromETLProcess = [];
}

function clearDatabase(responseToClient) {
    data = [];
    fs.writeFile("C:/Win10-pliki/Programowanie/ds-aktualne-prace/WebScraper/data.json", JSON.stringify(data), function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The database has been cleared");
    });
    responseToClient.json(data);
}

const port = process.env.PORT || '3000';
app.set('port', port);

const server = http.createServer(app);
server.listen(port, () => console.log(`Running on localhost:${port}`));
