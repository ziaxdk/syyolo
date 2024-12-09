import data from './20241209.json' with { type: "json" }
import fs from 'node:fs'
import { buildGPX, BaseBuilder } from 'gpx-builder'
const { Point } = BaseBuilder.MODELS

const points = []
const sym = 'Symbol-Spot-Blue'

for (let idx = 0; idx < data.length; idx++) {
    let latlon = [ data[idx][1][5][2], data[idx][1][5][3] ]
    let note = data[idx][3] || 'na'
    let name = `GM: ${note}`

    // console.log(note, latlon)
    points.push( new Point(latlon[0], latlon[1], { name, sym }) )
}

const gpxData = new BaseBuilder()
gpxData.setWayPoints(points)
const output = buildGPX(gpxData.toObject())

fs.writeFileSync('./20241209.gpx', output)
