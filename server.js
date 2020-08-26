'use strict'

const http = require('http')
const express = require('express')
const app = express()
const SearchDba = require('./summary-stats')
let Searching = SearchDba.search 

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

app.listen(1234, () => {
    console.log("Hi")
})


