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

exports.get = functions.https.onRequest(async (req, res) => {
  if(req.method === 'GET') {
    try {
      const docId = req.query.id;
      console.log("get video request: ", docId);

      const result = await admin.firestore().collection('films').doc(docId).get();
      if(!result.exists) {
        res.status(404).send("Not found document with ID: " + docId);
      } else {
        res.json({
          status: 1,
          data: result.data(),
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(404).send("Unimplemented api request call");
  }
});

exports.getAll = functions.https.onRequest(async (req, res) => {
  if(req.method === 'GET') {
    try {
      console.log("get all video request");

      const result = await admin.firestore().collection("films").get();
      const ret = await admin.firestore().collection('stats').doc("count").get();
      const total = ret.exists ? ret.data().total : 0;
      res.json({
        status: 1,
        data: result.docs.map((doc) => {
          const data = doc.data();
          return Object.assign(data, { id: doc.id });
        }),
        totalCount: total,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(404).send("Unimplemented api request call");
  }
});

exports.remove = functions.https.onRequest(async (req, res) => {
  if(req.method === 'DELETE') {
    try {
      const docId = req.query.id;
      console.log("delete video request: ", docId);

      const result = await admin.firestore().collection('films').doc(docId).get();
      if(!result.exists) {
        res.status(404).send("Not found document with id : " + docId);
      } else {
        await admin.firestore().collection('films').doc(docId).delete();
        
        const film_collection = await admin.firestore().collection('films').get();
        await admin.firestore().collection('stats').doc("count").set({ total: film_collection.docs.length });
        console.info("total count increase: ", film_collection.docs.length);

        res.json({
          status: 1,
          message: `Video with ID: ${req.query.id} deleted.`,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(404).send("Unimplemented api request call");
  }
});
