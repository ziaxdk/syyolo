import Builder from './scraper/Builder.js'


// await new Builder()
//     .withSource()
//         .http()
//             .post('https://app.sailserver.com/mod/boatget.php?z=&x=0&t=1763151721539')
//             .header('Content-type', 'application/json')
//             .header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:127.0) Gecko/20100101 Firefox/127.0')
//             .body({"cmd":"page","func":0,"boatid":"302","page":"dashboard","subpage":""})
//         .stop()
//         // \"boat\"\:\{.+\"data\"\:\{.+\"lat\"\:(?<lat>[0-9.]+)\,\"lon\"\:(?<lon>[0-9.]+)
//     .stop()

//     .single()
//         .startRegex('\"boat\"\:\{.+\"data\"\:\{.+\"lat\"\:(?<lat>[0-9.]+)')
//         .stop()
//         .startRegex('\"boat\"\:\{.+\"data\"\:\{.+\"lon\"\:(?<lon>[0-9.]+)')
//         .stop()
//         .startRegex('\"boat\"\:\{.+\"data\"\:\{.+\"tim\"\:(?<tim>[0-9]+)')
//         .stop()
//         .modifyProp('tim', x => Promise.resolve(new Date(Number(x) * 1000)))
//         .debug([ 'lat', 'lon', 'tim' ])
//     .stop()

// .run(!true)



// Den Danske Havnelods
import N from './no1.json' with { type: "json" }

const elements = N.options

await new Builder()
    .withSource()
        // .fromArray(elements)
        .fromArray([ elements[0] ]) // lyst
        // .fromArray([ elements[14] ]) // erhverv
        // .fromArray([ elements[461] ]) // bro
        // .fromArray([ elements[0], elements[461], elements[14] ])
        // .fromArray([ elements[0], elements[461], elements[14], elements[1], elements[15], elements[2], elements[16], elements[3] ])
    .stop()

    // Split options into keys
    .single()
        .startRegex(`value\=\'(?<value>.*)\;(?<type>.*)'\>(?<name>.*)\<\/`)
            .switchGroupName('type')
                .when('lyst').set('fetchUrl', 'https://www.danskehavnelods.dk/Havnelodsen/harbours/popupplan/{value}.html')
                .when('bro').set('fetchUrl', 'https://www.danskehavnelods.dk/Havnelodsen/bridges/popupplan/{value}.html')
                // .default().set('fetchUrl', 'DEFF{value}')
                .default().skip()
            .stop()
        .stop()

        .templateProp('filename', '{type}_{name}.jpg')
        .filenamify('filename')
        .modifyProp('filename', async val => 'out/' + val)
    .stop()

    // Get the HTML from pop up
    .single()
        .http()
            .get()
            .urlFromKey('fetchUrl')
            .stream()
                .toKey('fetchUrlContent')
    .stop()

    // Find the image of IMG tag
    .single()
        .startRegex(/img\[0\]\s=\s?\'(?<imgurlpath>.*)\'\;/, 'fetchUrlContent')
        .stop()
        .modifyProp('imgurlpath', async val => 'https://www.danskehavnelods.dk/' + val.toString().replaceAll('../', ''))
    .stop()

    // Get the image
    .concurrency(2)
        .http()
            .get()
            .urlFromKey('imgurlpath')
            .stream()
                .image()
                    .resize(200)
                .stop()
                .toFileFromKey('filename')
    .stop()
.run()

// ******************************************************************* //

    // .single()
    //     .http()
    //         // .urlFromKey('')
    //         .url('https://www.danskehavnelods.dk/Planer/jpg_200/NKTANHOL.jpg')
    //         .get()
    //         .stream()
    //             .image()
    //                 .resize(150, 150)
    //                 .greyscale()
    //             .stop()
    //     .toFile('filename.jpg')
    //     // .concurrency(2)
    //     // .download('fetchUrl')
    //     // .screenshot()
    //     // // .processImage()
    //     // //     .resize(150, 150)
    //     // // .stop()
    //     // .saveFile('filename')
    //     // .stop()
    // .stop()

// .run(!true)
