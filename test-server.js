
const axios = require('axios');

async function testAPI() {
  try {
    const res = await axios.get('http://localhost:5000/');
    console.log('Server Status:', res.data);
  } catch (err) {
    console.error('Server is UNREACHABLE:', err.message);
  }
}

testAPI();
