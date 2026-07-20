fetch("https://docs.google.com/spreadsheets/d/19U8KDUFQUhMOLPIniKCkUfGXZCBY7i3uFyjOQYU003w/export?format=csv&gid=0")
  .then(r => r.text())
  .then(text => console.log(text.substring(0, 500)));
