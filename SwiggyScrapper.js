const express = require('express')
const app = express()
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');


let resturantsAndDishes = "Restuarnts are :" + " " +  "\n";
let counter = 0;


app.get('/dishes',async(req,res)=>{
    let {city,restaurants} = req.query
    const resturantData =await main(city,restaurants);
    req.dishes = resturantData
    let requiredResturantData = resturantsAndDishes
    console.log(requiredResturantData)

    let transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"1ms19is119@gmail.com",
        pass:"popoqibpxuxpclbr"
    },
    tls:{
        rejectUnauthorized : false
    },
    secure : false
})


    let mailOptions = {
        from :"1ms19is119@gmail.com",
        to:"sudeepck03@gmail.com",
        subject:"Swiggy.com",
        text:"Firts Email Using Nodejs" +" " + requiredResturantData + resturantData + " " ,
        html:requiredResturantData,
        amp:`${requiredResturantData}`,
        secure : false,
    }

      transporter.sendMail(mailOptions,function(err,success){
        if(err){
          console.log(err);
        }else{
            console.log(success)
        }
      })  
     res.send(req.dishes)
})


const port = 3000
app.listen(port,()=>console.log(`Successfully connected to Servere ${port}`))

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

async function Getdata(url,page,filteredRestuarnt) {
      await page.setDefaultNavigationTimeout(0);
      await page.goto(url);
      await page.waitForSelector('[data-testid="normal-dish-item"] > div > div:first-of-type');

      // Extract dish data
      let dishes = [];
      let dishElements = await page.$$('[data-testid="normal-dish-item"] > div > div:first-of-type');
      const hotelName =  await page.$eval('h1',n=>n.title)
     
      //Apply Offer if existes
      let BestOffer =  await page.$eval('._3lvLZ',n => n.innerText)
      BestOffer = BestOffer.split(" ")
      let percentage = Number(BestOffer[0].substring(0,BestOffer[0].length-1));
      limit = Number(BestOffer[4].substring(1,BestOffer[4].length))
      let filteredDishes =[]
      
    // Check if Restaurant is present in Query Filter
      if(!filteredRestuarnt.includes(hotelName) && filteredRestuarnt.length > 0){
         return  { [hotelName] : { dishes : filteredDishes }}
      }
           


    let finalPrice = 0;
    counter++;
    resturantsAndDishes += counter +" ." + hotelName +":" + " " 
      for (const dishElement of dishElements) {
        const dishName = await dishElement.$eval('h3', node => node.textContent);
        let dishPrice = Number(await dishElement.$eval('.rupee', node => node.textContent));
        let discount = (dishPrice * (percentage) / 100)
        let dishPriceAfterDiscount = discount < limit ? Number(dishPrice - discount) : Number(dishPrice - limit);
        if(isNaN(dishPriceAfterDiscount)){
            dishes.push({ dishName, dishPrice})
             finalPrice += Number(dishPrice)
             if(dishPrice >= 20 && dishPrice <= 300) resturantsAndDishes += dishName +","
        }else{
            dishes.push({ dishName, dishPrice: dishPriceAfterDiscount}); 
            finalPrice += Number(dishPriceAfterDiscount)
           if(dishPriceAfterDiscount >= 20 && dishPriceAfterDiscount <= 300) resturantsAndDishes += dishName +" ,"
        }   
    }
    finalPrice = Number(finalPrice)
   
    resturantsAndDishes += ":" + finalPrice
   
      // Filter dishes within the price range
    filteredDishes = dishes.filter(dish => dish.dishPrice >= 20 && dish.dishPrice <= 300);
    
      return {
        [hotelName] : {
          Name : hotelName,
          dishes : filteredDishes 
      },
      finalPrice,
    }
};

async function main(city,restaurants){
        const allLinks = await getLinks(city,restaurants);
        const browser = await puppeteer.launch({headless: false, args: ["--no-sandbox"]});
        let page = await browser.newPage();

        const arr = [];
        let count=0;
    
        for(let link of allLinks.links){
            count++;
            if(count > 2){
                break;
            }
          const data = await Getdata(link,page,allLinks.filteredRestuarnt);
          arr.push(data)
        }
   
    await browser.close()
    return resturantsAndDishes;
}
