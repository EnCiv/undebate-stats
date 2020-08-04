'use strict'

const http = require('http')
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient

require("dotenv").config()
/*
const start = new Date()
const end = new Date()
end.setDate(start.getDate()+1)
start.setDate(start.getDate() - 3)
console.log("Date:", start)
*/
/*
const server = http.createServer((req, res) => {
    res.write("hello")
    res.write(env)
    arr.forEach(item => res.write(item))
    res.end()
})*/
let MongodbClient
const env = process.env.STAGE1_DB
let arr = []
//console.log("date on query", start)
    MongoClient.connect(env).then(client => {
        console.log("We are connected to: " + env)
        this.client = client
        this.db = client.db()
        MongodbClient = client.db()
    })
app.get('/cool',async (req,res) => {
    res.write("hello")
    res.write(`\nHere is a sample date 2020-06-30`)
    res.write('\nIf you want just todays recordings leave url queries blank')
    //res.write(env)
    console.log(req.query)
    /*
    if(req.query.relday === 'today'){
        start.setDate(start.getDate() - 1)
    }else if(req.query.relday === 'yesterday'){
        start.setDate(start.getDate() - 2)
        console.log("date has been changed to", start)
    }*/
    const from = new Date(req.query.from)
    const to = new Date(req.query.to)
    await SearchDb(from.toISOString(),to.toISOString())
    //arr.forEach(item => res.write(JSON.stringify(item)))
    res.end()
})

app.listen(1234, () => {
    console.log("Hi")
})




function SearchDb(start, end ){
   // const stuff = this.db.collection('logs').find({ startTime: { $gt: this.start }, endTime:{$lt: this.end} })
        //{ startTime: { $gte: start,$lte: end }}
        console.log("date on query", start, end)
        MongodbClient.collection('logs').find({ startTime: { $gte:new Date(start),$lte: new Date(end) }}).toArray((err, items) => {
            let counter = 0;
            items.forEach(element => {
                //console.log(element)
                void (element.data[0] === "GET" && (counter += 1, arr.push({
                    'Method': element.data[0],
                    'Url': element.data[1],
                    'device': element.data[2],
                    'browser': element.data[3].browserConfig
                })))
            });
            console.log("Get requests are: " + counter)
            console.log("The length of items:", items.length)
            const unique = [...new Set(arr.map(item => item.Url))]
            let recorderList=unique.filter(target => target.split("-").includes("recorder"))
            recorderList.forEach(target => {
                let opSo = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).os.name)
                let browser = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).browser.name)
                let type = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).type)
                console.log(
                    "\nUrl information for: ",
                    target + " has ",
                    arr.filter(item => item.Url === target).length + " visit(s)",
                    "\nOperating Software: " + opSo,
                    "\nBrowser: " + browser,
                    "\nDevice: " + type,
                )
            }
            )
        })
}
/*todo:
return count for ead output
query on search bar with start and end date, or today, yesterday, week, month, year
make connection error

.git ignore .env file

put a default today date if empty

repository name
whats the url name

/country:/us/state-recorder-

click on record

*/