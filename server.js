'use strict'

const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const SearchDba = require('./summary-stats')
let Searching = SearchDba.search 

const _ = require("lodash")
const MongoClient = require('mongodb').MongoClient
let MongodbClient
require("dotenv").config()

const env = process.env.STAGE1_DB

let arr = []
MongoClient.connect(env).then(client => {
    this.client = client
    this.db = client.db()
    MongodbClient = client.db()
})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))

app.get('/home',async function(req,res){
    res.write("hello")
    res.write(`\nHere is a sample date 2020-06-30`)
    res.write('\nIf you want just todays recordings leave url queries blank')
    console.log(req.query)

    const from = new Date(req.query.from)
    const to = new Date(req.query.to)
    //let printInfo = SearchDb(from.toISOString(),to.toISOString())
    let temp = new Searching(from.toISOString(),to.toISOString())

    res.end()
})

app.get('/api/hello', (req,res) => {
    res.send({express: 'Hello From Express'});
})

app.post('/api/world', (req,res) => {
    res.send(`I received your post request`);
})

app.post('/api/test', (req,res) => {
    console.log(req.body)
    const start = new Date("2020-08-31")
    const end = new Date("2020-09-09")
    //let bro = Searching(from.toISOString(),to.toISOString()).finished
    //res.send(req.body);
    let logCollection = MongodbClient.collection('logs')
    let result= logCollection.find({ startTime: { $gte:new Date(start.toISOString()),$lte: new Date(end.toISOString()) }})
    result.toArray((err, items) => {
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
        let NodeLogs = items.filter( target => target.source === "node")
        let runningClient = BrowserLogs.filter( target => target.data[1] === "client main running on browser" && target.data.length > 3)
        let preambleAgreed = BrowserLogs.filter(target => target.data[1] === "Undebate preambleAgreed true")
        let beginButton = BrowserLogs.filter(target => target.data[1] === "Undebate.beginButton")
        let finished = BrowserLogs.filter(target => target.data[1] === "Undebate.finished")
        let userUpload = BrowserLogs.filter(target => target.data[1] === "Undebate.onUserUpload")
        
        console.log("\namount of people that agreed to preamble", preambleAgreed.length)
        socketIdParse(runningClient, preambleAgreed)
        console.log("\namount of people that began:", beginButton.length )
        socketIdParse(runningClient, beginButton)
        console.log("\npeople that finished",finished.length)
        socketIdParse(runningClient, finished)
        console.log("\npeople that uploaded", userUpload.length)
        socketIdParse(runningClient, userUpload)                 
        
        //console.log("Get requests are: " + counter)
        //console.log("The length of items:", items.length)
        preambleAgreed = "amount of people that agreed to preamblem "+ preambleAgreed.length
        beginButton = "amount of people that began: " + beginButton.length
        finished = "people that finished " + finished.length
        userUpload = "people that uploaded " + userUpload.length

        res.send(preambleAgreed)

        const unique = [...new Set(arr.map(item => item.Url))]
        let recorderList=unique.filter(target => target.split("-").includes("recorder"))
        //console.log("Unique Recording Link Visits:",recorderList)

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
})

let socketIdParse= function(userInfoStage,recordingStage){
    let osUser = []
    let browserUser= []
    let typeUser = []
    for(let i=0; i<recordingStage.length; i++){
        let socketId = recordingStage[i].data[2].socketId
        matchRunCli(userInfoStage, socketId, osUser, browserUser, typeUser)
     }
    let osFreq= _.countBy(osUser)
    let browserFreq = _.countBy(browserUser)
    let typeFreq = _.countBy(typeUser)
    console.log(osFreq)
    console.log(browserFreq)
    console.log(typeFreq)
}

let matchRunCli = function(userInfoStage,recordingStageId, osArr, browserArr, typeArr){
    let userInfo = userInfoStage.find(target => target.data[4].socketId === recordingStageId)
    if(userInfo){
       osArr.push(userInfo.data[3].os.name)
       browserArr.push(userInfo.data[3].browser.name)
       typeArr.push(userInfo.data[3].type)
    }

    //console.log("device info for those that agreed to preamble", userInfo, recordingStageId)
}

app.listen(1234, () => {
    console.log("Hi")
})


