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
    let textDisplay = ""
    console.log(req.body)
    const {body:{startDate,endDate}} = req 
    const start = new Date(startDate)
    const end = new Date(endDate)
    //let bro = Searching(from.toISOString(),to.toISOString()).finished
    //res.send(req.body);
    let logCollection = MongodbClient.collection('logs')
    let result= logCollection.find({ startTime: { $gte:new Date(start.toISOString()),$lte: new Date(end.toISOString()) }})
    result.toArray((err, items) => {
        let counter = 0
        let funnelData = []
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
        
        let uniqueRC = uniqueSocketsRC(runningClient)
        let uniqueBB = uniqueSockets(beginButton)
        let uniquePA = uniqueSockets(preambleAgreed)
        let uniqueF = uniqueSockets(finished)
        let uniqueUU = uniqueSockets(userUpload)

        console.log("\namount of people that landed on the page", uniqueRC.length)
        textDisplay += "\namount of people that landed on page " + uniqueRC.length
        //textDisplay += socketIdParse(runningClient, runningClient)
        console.log("\namount of people that agreed to preamble", uniquePA.length)
        textDisplay += "\namount of people that agreed to preamble " + uniquePA.length
        textDisplay += socketIdParse(runningClient, preambleAgreed)
        console.log("\namount of people that began:", uniqueBB.length )
        textDisplay += "\namount of people that began: "+ uniqueBB.length
        textDisplay += socketIdParse(runningClient, beginButton)
        console.log("\npeople that finished",uniqueF.length)
        textDisplay += "\npeople that finished " + uniqueF.length
        textDisplay += socketIdParse(runningClient, finished)
        console.log("\npeople that uploaded", uniqueUU.length)
        textDisplay += "\npeople that uploaded " + uniqueUU.length
        textDisplay += socketIdParse(runningClient, userUpload)                 
        
        //console.log("Get requests are: " + counter)
        //console.log("The length of items:", items.length)
        /*
        below was used for this
        preambleAgreed = "amount of people that agreed to preamble "+ preambleAgreed.length
        beginButton = "amount of people that began: " + beginButton.length
        finished = "people that finished " + finished.length
        userUpload = "people that uploaded " + userUpload.length
        */

       funnelData.push({'name':'beginButton', 'value':uniqueRC.length})
        funnelData.push({'name':'beginButton', 'value':uniqueBB.length})
        funnelData.push({'name':'preambleAgreed', 'value':uniquePA.length})
        funnelData.push({'name':'finished', 'value':uniqueF.length})
        funnelData.push({'name':'userUpload', 'value':uniqueUU.length})

        const unique = [...new Set(arr.map(item => item.Url))]
        let recorderList=unique.filter(target => target.split("-").includes("recorder"))
        //console.log("Unique Recording Link Visits:",recorderList)
        let recorderLinks = ''

        recorderList.forEach(target => {
            let opSo = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).os.name)
            let browser = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).browser.name)
            let type = arr.filter(item => item.Url === target).map(item => JSON.parse(item.browser).type)
            recorderLinks+=
                "\nUrl information for: "+
                target + " has "+
                arr.filter(item => item.Url === target).length + " visit(s)"+
                "\nOperating Software: " + opSo+
                "\nBrowser: " + browser+
                "\nDevice: " + type
        }
        )
        textDisplay += recorderLinks
        res.send({'text':textDisplay,'funnelData': funnelData})
        res.end() 

    })
})

let uniqueSocketsRC = function(recordingStage){
    let socketIdList=[]
    for(let i=0; i<recordingStage.length; i++){
        let socketId = recordingStage[i].data[4].socketId
        socketIdList.push(socketId)
     }
    let uniqueSockets = [... new Set(socketIdList)]
    return uniqueSockets
}

let uniqueSockets = function(recordingStage){
    let socketIdList=[]
    for(let i=0; i<recordingStage.length; i++){
        let socketId = recordingStage[i].data[2].socketId
        socketIdList.push(socketId)
     }
    let uniqueSockets = [... new Set(socketIdList)]
    return uniqueSockets
}

let socketIdParse= function(userInfoStage,recordingStage){
    let osUser = []
    let browserUser= []
    let typeUser = []
    let socketIdList=[]
    for(let i=0; i<recordingStage.length; i++){
        let socketId = recordingStage[i].data[2].socketId
        socketIdList.push(socketId)
     }
    let uniqueSockets = [... new Set(socketIdList)]

    for(let i=0;i<uniqueSockets.length;i++){
        let socketId = uniqueSockets[i]
        matchRunCli(userInfoStage, socketId, osUser, browserUser, typeUser)
    }
    let osFreq= _.countBy(osUser)
    let browserFreq = _.countBy(browserUser)
    let typeFreq = _.countBy(typeUser)
    
    let textDisplay= "" 
    textDisplay+= "\n" + JSON.stringify(osFreq)
    textDisplay+= "\n" + JSON.stringify(browserFreq)
    textDisplay+= "\n" + JSON.stringify(typeFreq)
    textDisplay+= "\n"

     return textDisplay
}

let matchRunCli = function(userInfoStage,recordingStageId, osArr, browserArr, typeArr){
    let userInfo = userInfoStage.find(target => target.data[4].socketId === recordingStageId)
    console.log(recordingStageId)

    if(userInfo){
        if(userInfo.data[1]==="Undebate.onUserUpload"){
            console.log("user upload ",recordingStageId)
        }
       osArr.push(userInfo.data[3].os.name)
       browserArr.push(userInfo.data[3].browser.name)
       typeArr.push(userInfo.data[3].type)
    }

    //console.log("device info for those that agreed to preamble", userInfo, recordingStageId)
}

app.listen(1234, () => {
    console.log("Hi")
})


