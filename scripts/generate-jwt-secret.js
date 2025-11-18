// scripts/generate-jwt-secret.js
// Run: node scripts/generate-jwt-secret.js
const crypto = require('crypto');

// strong random secret generate karein
const key = crypto.randomBytes(48).toString('hex'); 

console.log("\n==================================================================");
console.log("Aapki nayi JWT Secret Key hai (neeche di gayi key ko copy kar lein):");
console.log("\n" + key + "\n"); // Key ko print karein
console.log("==================================================================");
console.log("\nIs poori key ko copy karke apni backend/.env file mein 'JWT_SECRET=' ke aage paste kar dein.");