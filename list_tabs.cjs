const https = require('https');
https.get("https://docs.google.com/spreadsheets/d/19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w/htmlview", (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const matches = data.match(/<li[^>]*>.*?<\/li>/g);
    if(matches) {
       matches.forEach(m => {
          const textMatch = m.match(/>([^<]+)<\/a>/);
          if (textMatch) console.log(textMatch[1]);
       });
    }
  });
});
