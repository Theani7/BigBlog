const http = require('http');
const fs = require('fs');
http.get('http://localhost:4321/p/hi-this-is-just-test', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    fs.writeFileSync('story.txt', data);
    console.log("Dumped to story.txt");
  });
});
