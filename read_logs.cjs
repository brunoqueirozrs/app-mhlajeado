fetch("http://localhost:3000/api/admin/logs")
  .then(r => r.json())
  .then(data => {
    if (data.logs) {
      data.logs.slice(-30).forEach(l => console.log(`[${l.level}] ${l.message}`));
    }
  });
