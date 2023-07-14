//The .env file is uploaded in hosting platform.

/* Example for .env file

    apiKey="apikey from firebase"
    authDomain="projectID.firebaseapp.com"
    projectId="Your Firebase Projet ID"
    storageBucket="projectID.appspot.com"
    messagingSenderId="unique number from firebase"
    appId="1:messagingSenderId:web:75399abc2413fa54ea4211"
    measurementId="measurementId From Firebase"
    
 */

require('dotenv').config(); // Load environment variables from .env file

const firebaseConfig = {
    apiKey: process.env.apiKey,
    authDomain: process.env.authDomain,
    projectId: process.env.projectId,
    storageBucket: process.env.storageBucket,
    messagingSenderId: process.env.messagingSenderId,
    appId: process.env.appId,
    measurementId: process.env.measurementId
}

module.exports = firebaseConfig;