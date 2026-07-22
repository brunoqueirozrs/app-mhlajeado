const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000);
  await page.selectOption('select', 'BRUNO GARCIA QUEIROZ');
  await page.click('button:has-text("Entrar no Sistema")');
  await page.waitForTimeout(2000);

  await page.click('text="Gestão de Pessoas"');
  await page.waitForTimeout(2000);
  
  // Click first element with vendor-list-item class or similar
  const vendorButtons = await page.$$('div > h4.font-bold');
  if (vendorButtons.length > 0) {
    for (let btn of vendorButtons) {
        const text = await btn.innerText();
        console.log("Found vendor name:", text);
    }
    await vendorButtons[0].click();
  } else {
    console.log("No vendor buttons found. Here is the HTML:");
    const html = await page.innerHTML('body');
    console.log(html.substring(0, 500));
  }
  await page.waitForTimeout(2000);
  
  const rootContent = await page.innerHTML('#root');
  if (rootContent.length < 500) {
    console.log("ROOT HTML IS SMALL! Something crashed.", rootContent);
  } else {
    console.log("Page rendered successfully.");
  }
  await browser.close();
})();
