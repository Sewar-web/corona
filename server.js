'use strict';

const express= require('express');
require('dotenv').config();
const server =express();

const superagent= require('superagent');
const pg= require('pg');
const methodOverride= require('method-override');
// const cors= require('cors');


const PORT=process.env.PORT || 3000;
// server.use(cors());

server.use(methodOverride('_method'));
server.use(express.static('./public'));
server.set('view engine', 'ejs');
server.use(express.urlencoded({ extended: true }));
const client = new pg.Client(process.env.DATABASE_URL);


//////////////////////////////////////////////////////////////////////////////

server.get('/' , homehandled)

//////////////////////////////////////////////////////
function homehandled(req ,res)
{
    let url=`https://api.covid19api.com/world/total`;

    superagent.get(url)
    .then(result => {
        res.render('pages/index' ,{data:result.body})
        // console.log(result.body);
    })

}
////////////////////////////////////////////////////////

server.get('/show' , showhandled)
function showhandled(req ,res)
{
    let name= req.query.country;
    let data=req.query.data
    let data1=req.query.data1

    let URL=`https://api.covid19api.com/country/${name}/status/confirmed?from=${data}&to=${data1}`;
    superagent.get(URL)
    .then(result => {
        // console.log(result.body);
        // data=result.body.map(val => {
        //  return new Corona(val)
         
        // });
        res.render('pages/getCountryResult' ,{array:result.body});
    });
   
}
/////////////////////////////////////////////////////////////////////////////////
server.get('/allcountry' ,countryhandled)
function countryhandled(req ,res)
{

    let url=`https://api.covid19api.com/summary`;
    superagent.get(url)
    .then(result => {
       let arraycountry=result.body.Countries.map(value => {
            // console.log(result.body.Countries);
            return new Countryname(value);
        })
        res.render('pages/allcountres' , {array :arraycountry});
        // res.send(result.body.Countries);
    });

}

function Countryname (data)
{
    this.country=data.Country;
    this.totalconfirmedcases=data.TotalConfirmed;
    this.totalteaths=data.TotalDeaths;
    this.totalrecovered=data.TotalRecovered;
    this.date=data.Date;
   
}
///////////////////////////////////////////////////////////////////records///////////////
server.get('/record' ,recodhandled)
function recodhandled(req ,res)
{
    let{country ,totalconfirmedcases ,totalteaths ,totalrecovered,date}=req.query;
    let sql=`INSERT INTO corona (country ,totalconfirmedcases ,totalteaths ,totalrecovered,date)
    VALUES($1, $2 ,$3 ,$4 ,$5) RETURNING *;`;
    let savedata=[country ,totalconfirmedcases ,totalteaths ,totalrecovered,date];
    client.query(sql ,savedata)
    .then(result => {
     res.redirect(`/allrecords`);
    });
 

}
//////////////////////////////
server.get('/allrecords' ,allrecodrshandeld)
function allrecodrshandeld(req ,res )
{
   
    let sql=`SELECT * FROM corona ;`;
    client.query(sql)
    .then(result => {
        res.render('pages/records', {recordarray :result.rows});
       });
}

////////////////////////////////////////////
server.get('/details/:id' ,detailshandeld)
function detailshandeld(req,res)
{
   
    let sql=`SELECT * FROM corona WHERE id=$1;`;
    let save=[req.params.id];
    client.query(sql,save )
    .then(result => {
        console.log(result.rows[0]);
        res.render('pages/details', {recordarray :result.rows[0]});
       });
}

///////////////////////////////////////////////////////////////

server.get('/update/:id' , updatehandled)
function updatehandled(req ,res)
{ t 
    let{country ,totalconfirmedcases ,totalteaths ,totalrecovered,date}=req.query;
    let sql=`UPDATE corona SET country=$1 ,totalconfirmedcases=$2 ,totalteaths=$3 ,totalrecovered=$4,date=$5 WHERE id=$6;`;
    let savedata=[country ,totalconfirmedcases ,totalteaths ,totalrecovered , date , req.params.id];

    client.query(sql,savedata)
    .then(result => {
        res.redirect(`/details/${req.params.id}`);
    });
}

/////////////////////////////////////////////////////////

server.get('/delete/:id' ,delethandled)
function delethandled(req ,res)
{
    let sql=`DELETE  FROM corona WHERE id=$1`
    let save=[req.params.id];
    client.query(sql,save)
    .then(result => 
        {
            res.redirect(`/allrecords`);
        });
}

















server.get('*' ,(req ,res) => {
res.send('THERE SOMTHING ERROR');
});

client.connect()
.then( () => {
server.listen(PORT, () => {
console.log(`LISTING ON YOUR PORT ${PORT}`);
});
});


