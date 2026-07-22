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
  
  const vendorButtons = await page.$$('div > h4.font-bold');
  if (vendorButtons.length > 0) {
    await vendorButtons[0].click();
  }
  await page.waitForTimeout(1000);
  
  const btn = await page.$('text="Resumo Geral (Impressão)"');
  if (btn) {
    await btn.click();
    await page.waitForTimeout(1000);
    
    // Now try to click Imprimir / Salvar PDF
    const printBtn = await page.$('text="Imprimir / Salvar PDF"');
    if (printBtn) {
        console.log("Clicking Imprimir PDF...");
        await printBtn.click();
        await page.waitForTimeout(5000);
    }
  }

  await browser.close();
})();
