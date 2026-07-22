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
    await page.waitForTimeout(2000);
    // login as Bruno Queiroz
    await page.selectOption('select', 'BRUNO GARCIA QUEIROZ');
    await page.click('button:has-text("Entrar no Sistema")');
    await page.waitForTimeout(2000);

    // After login, we must be in Dashboard
    console.log("Logged in");
    
    // Now click Gestão de Pessoas in sidebar.
    console.log("Looking for Gestão de Pessoas...");
    // Let's print out all button texts to see how to click it
    const buttons = await page.$$eval('button, span, div', els => els.map(e => e.innerText).filter(t => t && t.includes("Gestão de Pessoas")));
    console.log("Found texts with Gestão de Pessoas:", buttons);
    
    // The sidebar item is a div or span that contains "Gestão de Pessoas"
    await page.click('text="Gestão de Pessoas"');
    await page.waitForTimeout(2000);
    
    console.log("Clicked Gestão de Pessoas. Looking for ANA PAULA RODRIGUES...");
    await page.click('text="ANA PAULA RODRIGUES"'); 
    await page.waitForTimeout(2000);
    
    console.log("Clicked vendor. HTML content of the page:");
    const html = await page.innerHTML('#root');
    console.log(html.substring(0, 200) + "... length: " + html.length);

    console.log("DONE!");
  } catch (e) {
    console.log("ERROR RUNNING TEST:", e.message);
  }
  await browser.close();
})();
