const keys = require('./keys');

// EXPRESS APP SETUP
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// conectiong to Postgress
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port:keys.pgPort
});
// putting listener 
pgClient.on('error', () => console.log('LOST PG connection'));

// creating a table to store index value
pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)').catch((err) => console.log(err));

// REdis setup 
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// Route Handling by Express API
app.get('/', (req, res) =>{
    res.send('Hi');
});

app.get('/values/all', async (req, res) =>{
    const values = await pgClient.query('SELECT * from values')
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

//route handler to recive input
app.post('/values', async (req, res) =>{
    const index = req.body.index;
    // limiting the input to keep the app process fast 
    if (parseInt(index) > 39) {
        return res.status(422).send('Index is too high try entering number under 39');
    }
    // take value and put in Redis data store 
    redisClient.hst('values', index, 'No Values so far ');
    redisPublisher.publish('insert', index);
    // take inserted values and parmently stores in Postgress
    pgClient.query('Insert values(number) VALUES($1)', [index]);
    // sending response
    res.send({working: ture});
});
// setup a call back
app.listen(5000, err => {
    console.log('Listening');
});