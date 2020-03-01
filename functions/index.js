'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
var serviceAccount = require("../credential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://videomanager-c02c583c32.firebaseio.com"
});

exports.add = functions.https.onRequest(async (req, res) => {
  if(req.method === 'POST') {
    try {
      const data = req.body;
      console.log("add video request: ", data);

      Object.assign(data, { created: new Date().getTime() })
      const result = await admin.firestore().collection('films').add(data);
      console.info("video created: ", result.id);

      const film_collection = await admin.firestore().collection('films').get();
      await admin.firestore().collection('stats').doc("count").set({ total: film_collection.docs.length });
      console.info("total count increase: ", film_collection.docs.length);

      res.json({
        status: 1,
        message: `Video with ID: ${result.id} added.`,
        id: result.id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(404).send("Unimplemented api request call");
  }
});
