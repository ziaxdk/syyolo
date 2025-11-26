import puppeteer from 'puppeteer'
import BaseBuilder from "../BaseBuilder.js";
import { EachBuilderActions, IEachBuilderAsync, kv } from "../Types.js";
import ExecBuilder from "../ExecBuilder.js";
import chalk from 'chalk';


export default class DownloadBuilder extends BaseBuilder<ExecBuilder> implements IEachBuilderAsync {

    private _keyFilename!: string
    private _keyUrl: string

    private _screenshot: boolean = false

    constructor (indent: number, eachBuilder: ExecBuilder, keyUrl: string) {
        super(indent, eachBuilder)
        if(!keyUrl) { throw new Error('No key for url') }
        this._keyUrl = keyUrl
    }

    saveFile (keyFilename: string): this {
        this._keyFilename = keyFilename
        return this
    }

    screenshot (): this {
        this._screenshot = true
        return this
    }

    async run (kv: kv): Promise<EachBuilderActions> {
        const url = kv.get(this._keyUrl)?.toString()
        if (!url) { throw new Error('No url') }

        if (this._screenshot) {
            const filename = kv.get(this._keyFilename)?.toString()
            console.log(chalk.cyanBright('Screenshot %s to %s'), url, filename)
            const browser = await puppeteer.launch({ headless: !false })
            // Browser
            const page = await browser.newPage()
            await page.goto(url, { waitUntil: 'networkidle0' })
            // await page.setViewport({ width: 1600, height: 3200 })

            await page.screenshot({
                fromSurface: true,
                type: 'png',
                // @ts-expect-error
                path: filename
            })
            await page.close()
            await browser.close()
        }

        // async run (kv: kv): Promise<EachBuilderActions> {
        //     const rs = createReadStream(resolve(kv.get('__source')!))
        //     let ws: Writable = null!
        //     if (this._keyFilename) {
        //         const filename = kv.get(this._keyFilename)
        //         if (!filename) { throw new Error(`No filename key: ${this._keyFilename}`) }
        //         ws = createWriteStream(filename)
        //     }

        //     if (!ws) {
        //         throw new Error('No writeable stream')
        //     }

        //     this._imageProcessorBuilder.run(rs, ws)
        //     return await EachBuilderActions.handled
        // }


        // // if (!response.body) { throw new Error('aa')}
        // // const rs2 = Readable.fromWeb(response.body)
        // this._imageProcessorBuilder.run(response.body, ws)
        return EachBuilderActions.handled

        // const rs = new ReadableStream({
        //     start(controller) {
        //         function push() {
        //             reader.read().then(({ done, value }) => {
        //                 if (done) {
        //                     controller.close();
        //                     return;
        //                 }
        //                 controller.enqueue(value);
        //                 push();
        //             });
        //         }
        //         push();
        //     }
        // });

        // let ws: Writable = null!
        // if (this._keyFilename) {
        //     if (!filename) { throw new Error(`No filename key: ${this._keyFilename}`) }
        //     ws = createWriteStream(filename)
        // }
    }
}
