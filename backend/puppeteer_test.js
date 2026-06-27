import puppeteer from 'puppeteer';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const token = jwt.sign({ id: '6a2976a142aa4ae0d70496de' }, process.env.JWT_SECRET, { expiresIn: '30d' }); // Patient Token
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173');
  
  await page.evaluate((tokenStr) => {
    localStorage.setItem('userInfo', JSON.stringify({ token: tokenStr, role: 'Patient' }));
  }, token);
  
  console.log("Navigating to /patient/map...");
  await page.goto('http://localhost:5173/patient/map');
  
  await new Promise(r => setTimeout(r, 3000));
  
  console.log("Refreshing the page...");
  await page.reload();
  
  await new Promise(r => setTimeout(r, 3000));
  
  await browser.close();
  process.exit();
}
run();
