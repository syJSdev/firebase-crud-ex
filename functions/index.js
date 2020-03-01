'use strict';

const functions = require('firebase-functions');

const admin = require('firebase-admin');
var serviceAccount = require("../credential.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://videomanager-c02c583c32.firebaseio.com"
});
