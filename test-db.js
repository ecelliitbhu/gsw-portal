const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyASt3bJMMzlJBHtOXlCQlCCwMoxL6wUpXM",
  authDomain: "gsw-ecell.firebaseapp.com",
  projectId: "gsw-ecell",
  storageBucket: "gsw-ecell.appspot.com",
  messagingSenderId: "941374804813",
  appId: "1:941374804813:web:107875221437da0bcb1d04",
  measurementId: "G-KN02HKFRVC"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  console.log("Checking admins in gsw-ecell...");
  const snapshot = await getDocs(collection(db, "admins"));
  if (snapshot.empty) {
    console.log("admins collection is empty or does not exist in gsw-ecell!");
  } else {
    snapshot.forEach(doc => {
      console.log("Found doc:", doc.id, "=>", doc.data());
    });
  }
}

check().catch(console.error);
