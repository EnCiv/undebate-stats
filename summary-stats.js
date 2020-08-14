const MongoClient = require('mongodb').MongoClient
let MongodbClient
require("dotenv").config()

const env = process.env.STAGE1_DB

let arr = []
MongoClient.connect(env).then(client => {
    console.log("We are connected to: " + env)
    this.client = client
    this.db = client.db()
    MongodbClient = client.db()
})

let SearchDba = function(start, end ){
             console.log("date on query", start, end)
             MongodbClient.collection('logs').find({ startTime: { $gte:new Date(start),$lte: new Date(end) }}).toArray((err, items) => {
                 let counter = 0
                 items.forEach(element => {
                     void (element.data[0] === "GET" && (counter += 1, arr.push({
                         'Method': element.data[0],
                         'Url': element.data[1],
                         'device': element.data[2],
                         'browser': element.data[3].browserConfig
                     })))
                 });

                 let BrowserLogs = items.filter( target => target.source === "browser")
                 let preambleAgreed = BrowserLogs.filter(target => target.data[1] === "Undebate preambleAgreed true")
                 let beginButton = BrowserLogs.filter(target => target.data[1] === "Undebate.beginButton")
                 let finished = BrowserLogs.filter(target => target.data[1] === "Undebate.finished")
                 let userUpload = BrowserLogs.filter(target => target.data[1] === "Undebate.onUserUpload")
                 console.log("amount of people that agreed to preamble", preambleAgreed.length)
                 console.log("amount of people that began:", beginButton.length)
                 console.log("people that finished",finished.length)
                 console.log("people that uploaded", userUpload.length)
                 //console.log("Get requests are: " + counter)
                 //console.log("The length of items:", items.length)
                 
                 const unique = [...new Set(arr.map(item => item.Url))]
                 let recorderList=unique.filter(target => target.split("-").includes("recorder"))
                 console.log("Unique Recording Link Visits:",recorderList.length)

                 recorderList.forEach(target => {
                     let opSo = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).os.name)
                     let browser = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).browser.name)
                     let type = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).type)
                     /*console.log(
                         "\nUrl information for: ",
                         target + " has ",
                         arr.filter(item => item.Url === target).length + " visit(s)",
                         "\nOperating Software: " + opSo,
                         "\nBrowser: " + browser,
                         "\nDevice: " + type,
                     )*/
                 }
                 )
             })
     }

module.exports = { search:SearchDba}