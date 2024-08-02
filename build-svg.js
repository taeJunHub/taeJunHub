import dotenv from 'dotenv';
dotenv.config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
import fs from 'fs-extra';
import got from 'got';
import { formatDistance } from 'date-fns';





let WEATHER_DOMAIN = 'http://dataservice.accuweather.com';
const emojis = {
    '1': '☀️',
    '2': '☀️',
    '3': '🌤️',
    '4': '🌤️',
    '5': '⛅',
    '6': '🌥️',
    '7': '☁️',
    '8': '☁️',
    '11': '🌫️',
    '12': '🌧️',
    '13': '🌦️',
    '14': '🌦️',
    '15': '⛈️',
    '16': '⛈️',
    '17': '⛈️',
    '18': '🌧️',
    '19': '❄️',
    '20': '❄️',
    '21': '❄️',
    '22': '🌨️',
    '23': '❄️',
    '24': '❄️',
    '25': '🌨️',
    '26': '🌨️',
    '29': '🌨️',
    '30': '🥵',
    '31': '🥶',
    '32': '🌬️',
    '33': '☀️',
    '34': '🌤️',
    '35': '⛅',
    '36': '⛅',
    '37': '🌫️',
    '38': '☁️',
    '39': '🌧️',
    '40': '🌧️',
    '41': '⛈️',
    '42': '⛈️',
    '43': '☁️',
    '44': '☁️',

}
// Cheap, janky way to have variable bubble width
const dayBubbleWidths = {
    Monday: 235,
    Tuesday: 235,
    Wednesday: 260,
    Thursday: 245,
    Friday: 220,
    Saturday: 245,
    Sunday: 230,
}


// Time working at PlanetScale
function convertTZ(date, tzString) {
    return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", {timeZone: tzString}));
}
const today = convertTZ(new Date(), "Asia/Seoul");
const todayDay = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(today);

const psTime = formatDistance(new Date(2020, 12, 14), today, {
    addSuffix: false
})

// Today's weather
const locationKey = '226081' // Seoul
let url = `forecasts/v1/daily/1day/${locationKey}?apikey=${WEATHER_API_KEY}&language=en-us&details=true&metric=true`;

got.get(url, {
    prefixUrl: WEATHER_DOMAIN
}).then((res) => {

    let json = JSON.parse(res.body).DailyForecasts[0];

    const degCMin = json.Temperature.Minimum.Value;
    const degCMax = json.Temperature.Maximum.Value;

    const date = new Date();
    const currentTime = date.getHours();

    json = currentTime < 18 ? json.Day : json.Night;
    const icon = json.Icon; //아이콘
    const iconPhrase = json.IconPhrase;  // 아이콘 문구
    const hasPrecipitation = json.HasPrecipitation ? "" : "no"; //강수량
    const precipitationType = json.HasPrecipitation ? "("+json.PrecipitationType+")" : ""; //강수량 유형

    fs.readFile('template.svg', 'utf-8', (error, data) => {
        if (error) {
            console.error(error)
            return
        }

        data = data.replace('{degCMin}', degCMin);
        data = data.replace('{degCMax}', degCMax);
        data = data.replace('{weatherEmoji}', emojis[icon]);
        data = data.replace('{weatherText}', iconPhrase);

        data = data.replace('{psTime}', psTime);
        data = data.replace('{todayDay}', todayDay);
        data = data.replace('{dayBubbleWidth}', dayBubbleWidths[todayDay]);
        data = data.replace('{hasPrecipitation}', hasPrecipitation);
        data = data.replace('{precipitationType}', precipitationType);

        data = fs.writeFile('chat.svg', data, (err) => {
            if (err) {
                console.error(err)
                return
            }
        })
    })
}).catch((err) => {
    // TODO: something better
    console.log(err)
})