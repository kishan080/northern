const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
var http = require('http');
var fs = require('fs');
//import fetch from "node-fetch";
//import { getData } from "./fetch.mjs";

const Country = require('./models/country')

require("dotenv").config({ path: "./config.env" });


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

    const month={
        "Jan":1,
        "Feb":2,
        "Mar":3,
        "Apr":4,
        "May":5,
        "Jun":6,
        "Jul":7,
        "Aug":8,
        "Sep":9,
        "Oct":10,
        "Nov":11,
        "Dec":12
    }

function data() {
    fs.readFile('a.csv', function(err, data) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.write(data);
        return res.end();
    });
}

app.get('/', (req, res) => {
    res.send('<h1>Hello World!</h1>')
})

app.get('/add', (request, response) => {
    fs.readFile('Exchange_Rate_Report_2022.csv', function(err, data) {
        data = data + ''
        console.log(data)
        const table = data.split('\n')
        console.log(table);
        
        const sepData=[];
        table.forEach(row => {
            const cols = row.split(',');
            sepData.push(cols);
        });

        console.log(sepData);

        for(let j=1;j<sepData[0].length;j++){

            console.log('country name:'+sepData[0][j]);

            const countryInfo=sepData[0][j].replace(/\s+/g, ' ').trim();
            const [countryName,currencyName,Code]=countryInfo.split(' ');
            
                let currYear=-1;
        
                const Mydata=[];
                for(let i=1;i<sepData.length;i++){
                    if(sepData[i][0]!=null){

                const [dat,mon,yr]=sepData[i][0].split('-');
            
                        if(currYear==-1)
                            currYear=2000+parseInt(yr);
                        if(sepData[i][j]!=null && sepData[i][j] != '' ) {

                            const data = {
                                    date: parseInt(dat),
                                    month:month[`${mon}`],
                                    rate:parseFloat(sepData[i][j])
                            }
                            
                        if (!isNaN(data.rate))
                            
                            Mydata.push(
                                data
                            )
                        }
                    }
                    
                }
                yearArr={
                    year:currYear || 2022,
                    data:Mydata
                }
                console.log(yearArr);
                
                
                Country.find({name:countryName}).then(countries => {
                    if (countries.length > 0)
                    {
                        
                        Country.updateOne(
                            { name:countryName },
                            { $push:{'yearData':yearArr} },function(err,doc) {
                                if(err){
                                    console.log(err);
                                }
                                //response.redirect("/");
                                console.log(yearArr)
                                console.log('updated')        
                            } 
                        )        
                    }
                    else
                    {
                        
                        Country.create({
                            
                            name: countryName,
                            currency: currencyName,
                            code: Code,
                            yearData: [yearArr]
                            
                        })
                        /*
                        const country = new Country({
                            
                            name: countryName,
                            currency: currencyName,
                            code: Code,
                            yearData: [yearArr]
                            
                        })
                        country.save()
                        */
                    }
                    //response.json(countries)  
                })
             
                
                
        }
    }
               )
    response.send('<h1>Hello World!</h1>')


})


app.get('/fetch', (request, response) => {
    console.log("got here\n");
    Country.find({}).then(countries => {
        if (countries.length > 0)
            console.log("exists");
        else
            console.log("doesn't exist");
        console.log(countries);
        response.json(countries)
    })
})

app.get('/yearXtoY', (request, response) => {
    const yearX = request.query.X, yearY = request.query.Y, currencyCode="("+request.query.code+")";

    Country.findOne({code:currencyCode}).then(country => {
        
        console.log(country.yearData);
        
        let store = [];
        const data = country.yearData;
        
        for (let i = 0; i < data.length; i++)
        {
            if (data[i].year >= yearX && data[i].year <= yearY)
            {
                for (let j = 0; j < data[i].data.length; j++)
                {
                    const entry = {
                        year: data[i].year,
                        date: data[i].data[j].date,
                        month: data[i].data[j].month,
                        rate: data[i].data[j].rate,
                    };

                    store.push(entry)
                }
            }
        }
        response.json(store);

    })
})


app.get('/update', (request, response) => {
    console.log("got here\n");
    Country.updateOne(
        { name:"India" },
        { $set:{name:"yeyeyeye"}},function(err,doc)
    {
      if(err){
         console.log(err);
      }
      //response.redirect("/");
      console.log('updated')        
    } 
    )
response.send('<h1>Hello World!</h1>')
    
})


app.get('/getCodes', (request, response) => {
    const store = []
    Country.find({}).then(countries => {
        for (let i = 0; i < countries.length; i++)
        {
            
            store.push(countries[i].code)
        }
    })
    response.json(store)
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})