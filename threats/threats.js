const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const request = require('request');

const port = process.argv.slice(2)[0];
const app = express();

app.use(bodyParser.json());

const heroesService = 'http://heroes.apps.internal'';
//const heroesService = 'http://localhost';

const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:neiltestpassword01@neiliss01-zxdvf.azure.mongodb.net/test?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true });

const threats = [
  {
      id: 1,
      displayName: 'Pisa tower is about to collapse.',
      necessaryPowers: ['flying'],
      img: 'tower.jpg',
      assignedHero: 0
  },
  {
      id: 2,
      displayName: 'Engineer is going to clean up server-room.',
      necessaryPowers: ['teleporting'],
      img: 'mess.jpg',
      assignedHero: 0
  },
  {
      id: 3,
      displayName: 'John will not understand the joke',
      necessaryPowers: ['clairvoyance'],
      img: 'joke.jpg',
      assignedHero: 0
  }
];

app.get('/threats', (req, res) => {
  console.log('Returning threats list');
  res.send(threats);
  const client = new MongoClient(uri, { useNewUrlParser: true });
  client.connect(err => {
    const collection = client.db("test").collection("devices");
    collection.insertOne({threat: 'Threats'}, (err, result) => {

  })
  client.close();

  });
});

app.post('/assignment', (req, res) => {
  request.post({
      headers: {'content-type': 'application/json'},
      url: `${heroesService}/hero/${req.body.heroId}`,
      body: `{
          "busy": true
      }`
  }, (err, heroResponse, body) => {
      if (!err) {
          const threatId = parseInt(req.body.threatId);
          const threat = threats.find(subject => subject.id === threatId);
          threat.assignedHero = req.body.heroId;
          res.status(202).send(threat);
          const client = new MongoClient(uri, { useNewUrlParser: true });

          client.connect(err => {
            const collection = client.db("test").collection("devices");
            collection.insertOne({threat: 'Assignment'}, (err, result) => {

          })
          client.close();

          });
      } else {
          res.status(400).send({problem: `Hero Service responded with issue ${err}`});
      }
  });
});

app.use('/img', express.static(path.join(__dirname,'img')));

app.listen( process.env.PORT || 4000)

console.log(`Threats service listening on port ${process.env.PORT}`);
