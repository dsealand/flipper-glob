// src/firebase.js
import firebase from 'firebase'
const config = {
    apiKey: "AIzaSyDPl2-dhY0TFDQpj-cBGtXLxruI7g78N6o",
    authDomain: "flipper-glob-webpage.firebaseapp.com",
    databaseURL: "https://flipper-glob-webpage.firebaseio.com",
    projectId: "flipper-glob-webpage",
    storageBucket: "",
    messagingSenderId: "410678010902",
    appId: "1:410678010902:web:d4289866c3f82d57a48137"
};
firebase.initializeApp(config);
export default firebase;