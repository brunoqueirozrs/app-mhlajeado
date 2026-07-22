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
  
  await page.waitForTimeout(1000);
  await page.selectOption('select', 'BRUNO GARCIA QUEIROZ');
  await page.click('button:has-text("Entrar no Sistema")');
  await page.waitForTimeout(1000);

  await page.click('text="Gestão de Pessoas"');
  await page.waitForTimeout(1000);
  
  console.log("Looking for Role Play IA...");
  // The tab is inside Catálogo de Módulos -> Role Play IA
  const btn = await page.$('text="Role Play IA"');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(2000);
    const html = await page.innerHTML('#root');
    console.log("Rendered Role Play screen. HTML length:", html.length);
  } else {
    console.log("Could not find Role Play IA button");
  }
  
  await browser.close();
})();
