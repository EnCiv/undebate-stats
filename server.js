'use strict'

const http = require('http')
const express = require('express')
const app = express()
const SearchDba = require('./summary-stats')

app.get('/home',async (req,res) => {
    res.write("hello")
    res.write(`\nHere is a sample date 2020-06-30`)
    res.write('\nIf you want just todays recordings leave url queries blank')
    console.log(req.query)

    const from = new Date(req.query.from)
    const to = new Date(req.query.to)
    //let printInfo = SearchDb(from.toISOString(),to.toISOString())
    console.log("hi there hi there",SearchDba.search(from.toISOString(),to.toISOString()))

    res.end()
})

app.listen(1234, () => {
    console.log("Hi")
})





/*
if(req.query.relday === 'today'){
   start.setDate(start.getDate() - 1)
}else if(req.query.relday === 'yesterday'){
    start.setDate(start.getDate() - 2)
    console.log("date has been changed to", start)
}*/

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