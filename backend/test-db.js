const mongoose = require('mongoose');
require('dotenv').config();

const testConn = async () => {
    try {
        console.log("Connecting to:", process.env.MONGO_URI);
        await mongoose.connect(process.env.MONGO_URI, { family: 4 });
        console.log("SUCCESS: MongoDB Connected!");
        
        // Try a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        
        process.exit(0);
    } catch (err) {
        console.error("ERROR Connecting to MongoDB:", err);
        process.exit(1);
    }
};

testConn();
