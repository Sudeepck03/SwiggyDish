const puppeteer = require('puppeteer');

async function getLinks()  {
    const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox"]});
    let page = await browser.newPage();
    await page.setDefaultNavigationTimeout(0);


    // Navigate to Swiggy website   
    await page.goto('https://swiggy.com/city/bangalore');

    const links = await page.$$eval('#restaurants_container div div a',allLinks=>allLinks.map(a=>a.href));
    browser.close();
    return links;
};

async function Getdata(url,page) {
  await page.setDefaultNavigationTimeout(0);
  await page.goto(url);

   
      // Wait for results to load
      await page.waitForSelector('[data-testid="normal-dish-item"] > div > div:first-of-type');


      // Extract dish data`
      let dishElements = await page.$$('[data-testid="normal-dish-item"] > div > div:first-of-type');
      let dishes = [];

      const hotelName =  await page.$eval('h1',n=>n.title)
      let BestOffer =  await page.$eval('._3lvLZ',n => n.innerText)
      BestOffer = BestOffer.split(" ")
      let percentage = Number(BestOffer[0].substring(0,BestOffer[0].length-1));
      let limit = Number(BestOffer[4].substring(1,BestOffer[4].length))
      

      for (const dishElement of dishElements) {
        const dishName = await dishElement.$eval('h3', node => node.textContent);
        let dishPrice = await dishElement.$eval('.rupee', node => node.textContent);//50
        let discount = (dishPrice * percentage) / 100

        let dishPriceAfterDiscount = discount < limit ? dishPrice - discount : dishPrice - limit;
        dishes.push({ dishName, dishPrice: Math.abs(dishPriceAfterDiscount) });
      }


      // Filter dishes within the price range
      let filteredDishes = dishes.filter(dish => dish.dishPrice >= 200 && dish.dishPrice <= 300);
      // let filteredDishes = dishes

      return {
        [hotelName] : {
          dishes : filteredDishes 
      }}
};

async function main(){
        const allLinks = await getLinks();
        const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox"]});
        let page = await browser.newPage();

        const arr = [];
        let j=0;
        for(let link of allLinks){
          if(j<1){
                const data = await Getdata(link,page);
                    arr.push(data)
                    j+=1
          }
        }
       
        for(let i of arr){
          console.log(JSON.stringify(i));
        }

        await browser.close();
}
main()