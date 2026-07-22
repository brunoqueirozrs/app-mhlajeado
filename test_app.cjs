const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`PAGE ERROR: ${msg.text()}`);
    }
  });
  page.on('pageerror', error => {
    console.log(`PAGE EXCEPTION: ${error.message}`);
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  try {
    // Assuming we need to login or select admin
    await page.waitForTimeout(2000);
    const html = await page.content();
    if (html.includes("Selecione seu perfil")) {
      await page.click('text="Acessar como Admin"');
      await page.waitForTimeout(2000);
    }
    
    // Now click Gestão de Pessoas
    console.log("Looking for Gestão de Pessoas...");
    await page.click('text="Gestão de Pessoas"');
    await page.waitForTimeout(2000);
    
    // Click on a vendor
    console.log("Looking for vendor...");
    await page.click('text="João Silva"'); // Assuming Joao Silva exists
    await page.waitForTimeout(2000);
    
    console.log("DONE!");
  } catch (e) {
    console.log("ERROR RUNNING TEST:", e.message);
  }
  await browser.close();
})();
