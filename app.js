const firebase = require('firebase');
const firebaseConfig = require('./firebaseConfig');
firebase.initializeApp(firebaseConfig);
require('firebase/firestore');

const express = require('express');
const cors=require('cors');
const moment = require('moment');

const { Client } = require('@elastic/elasticsearch');

const app = express();

app.use(express.json())
app.use(cors())

let esClient;
let indexName;

// Export Firestore data to Elasticsearch
async function exportData() {
    try {
      // Retrieve data from Firestore
      const firestoreData = await firebase.firestore().collection('apistats').get();
  
      // Transform and index data in Elasticsearch
      const bulkBody = [];
      firestoreData.forEach((doc) => {
        const docData = doc.data();
        let apic = docData.apicalled;
        if(apic.length>57){
          apic = "https://mobileobservability/transactionlist/detail"
        }
        const transformedData = {
          // Transform your data as per Elasticsearch mapping
          // For example:
          apicalled:apic,
          batterytemp:parseFloat(docData.batterytemp),
          deviceFingerPrint:docData.deviceFingerPrint,
          downspeed:parseFloat(docData.downspeed),
          upspeed:parseFloat(docData.upspeed),
          packageid:docData.packageid,
          parsetime:parseFloat(docData.parsetime),
          reqtime:docData.reqtime,
          restime:docData.restime,
          userid:docData.userid,
          battery: parseFloat(docData.battery),
          ramUsed: parseFloat(docData.ramUsed),
          rendertime: parseFloat(docData.rendertime),
          NetworkType:docData.NetworkType,
          NetworkOperator:docData.NetworkOperator,
          Event:docData.Event,
          Context:docData.Context,          
          timestamp: moment(docData.reqtime, 'DD/MM/YYYY, hh:mm:ss.SSS a').toISOString()
          
        };
        bulkBody.push({ index: { _index: indexName , _id: doc.id } });
        bulkBody.push(transformedData);
      });
  
      // Bulk insert data into Elasticsearch
      const { body: bulkResponse } = await esClient.bulk({ body: bulkBody });
  
      // Check for errors
      if (bulkResponse && bulkResponse.errors) {
        console.log('Errors encountered while exporting data to Elasticsearch:');
        console.log(bulkResponse.errors);
      } else {
        console.log('Data exported to Elasticsearch successfully!');
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
}

// Define an Express route for triggering the data export
app.post('/export', async (req, res) => {

  const cloudId = req.body.cloudId;
  const apiKey = req.body.apiKey;
  indexName = req.body.indexName;

  // Initialize Elasticsearch client
    esClient = new Client({

    cloud:{id:cloudId},
    auth:{apiKey:apiKey}

    // you can also manually enter the cloud id and apikey as shown below

    /*cloud:{id:'f44794f4f7b848528545a5cd34c1cdde:dXMtY2VudHJhbDEuZ2NwLmNsb3VkLmVzLmlvOjQ0MyQxN2E3MGM1NzIxZTE0NWYzODFhMDI3N2ZjZDdiN2U2OCRhYTUyZGZjNDdiMTc0MWIwOTgyODA4NDQ0NWExMzk5Zg=='},
    auth:{apiKey:'Uk9pbElZa0JYd1pjemtRdFJZV3k6ZmNOVGZIUVlRQnFSMEVEb2pOeE9UZw=='}*/
  })

  exportData()
    .then(() => res.send('Data export completed!'))
    .catch((error) => res.status(500).send(`Error exporting data: ${error.message}`));
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});