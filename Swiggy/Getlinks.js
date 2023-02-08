const puppeteer = require('puppeteer');
async function getLinks(city,restaurants)  {
    const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox"]});
    let page = await browser.newPage();
     page.setDefaultNavigationTimeout(0);


    // Navigate to Swiggy website   
    await page.goto(`https://swiggy.com/city/bangalore`);

    let links = await page.$$eval('#restaurants_container div div a',allLinks=>allLinks.map(a=>a.href))
    let allRestuarnts =await page.$$eval('#restaurants_container div div a div div:nth-child(2) div:nth-child(1)',res=>res.map(data=>data.innerText));
     let filteredRestuarnt = allRestuarnts.filter(res => restaurants.includes(res)) 

    browser.close();
    return {links,filteredRestuarnt};
};

module.exports = {getLinks}