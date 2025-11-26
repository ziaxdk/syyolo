import puppeteer, { PageEvent } from "puppeteer";
import DownloadBuilder from "../each/DownloadBuilder.js";
import SourceBuilder, { ISourceBuilder } from "./SourceBuilder.js";
import chalk from "chalk";
import fs from 'node:fs/promises'

export default class HttpSourceBuilder implements ISourceBuilder {
    private _sourceBuilder

    private _url!: string
    private _method!: string
    private _payload!: Record<string, string | number | boolean>
    private _headers: Map<string, string> = new Map<string, string>()


    constructor (sourceBuilder: SourceBuilder) {
        this._sourceBuilder = sourceBuilder
    }

    get (url: string): this {
        this._method = 'get'
        this._url = url
        return this
    }

    post (url: string): this {
        this._method = 'post'
        this._url = url
        return this
    }

    body (payload: Record<string, string | number | boolean>): this {
        this._payload = payload
        return this

    }

    header (name: string, value: string): this {
        if (this._headers.has(name)) {
            throw new Error("Header already added")
        }
        this._headers.set(name, value)
        return this
    }

    stop (): SourceBuilder {
        return this._sourceBuilder
    }

    async run(): Promise<string[]> {
        console.log(chalk.magenta('%s to %s'), this._method, this._url)
        const response = await fetch(this._url, {
            method: this._method.toLowerCase(),
            body: JSON.stringify(this._payload),
            headers: Object.fromEntries(this._headers)
        });
        const data = await response.text()
        return [ data ]

        // const body = {"cmd":"page","func":0,"boatid":"302","page":"dashboard","subpage":""};

        // const response = await fetch('https://app.sailserver.com/mod/boatget.php?z=&x=0&t=1763151721539', {
        //     method: 'post',
        //     body: JSON.stringify(body),
        //     headers: {'Content-Type': 'application/json'}
        // });
        // const data = await response.json();
        // console.log(data)
        // const browser = await puppeteer.launch({ headless: !false })
        // const page = await browser.newPage()
        // await page.setExtraHTTPHeaders(Object.fromEntries(this._headers))

        // console.log(chalk.magenta('Get: %s'), this._url)
        // await page.goto(this._url, { waitUntil: 'networkidle0' })

        // const pageContent = await page.content()

        // fs.writeFile('doc.html', pageContent)
        // // await page.screenshot({
        // //     fromSurface: true,
        // //     path: 'http.png'
        // // })

        // await page.close()
        // await browser.close()
        return []
    }

}