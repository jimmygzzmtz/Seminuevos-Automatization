const fs = require('fs');
const puppeteer = require('puppeteer');
var browser;
var page;
var username;
var password;

// Upload image from the imageURL path to the given element id
async function uploadImage(id, imageURL){
    await page.focus(id);
    const uploadHandle = await page.$(id);
    uploadHandle.uploadFile(imageURL);
    await page.waitForTimeout(5000);
}

// Types the query in the search box and selects the matching result
async function typeSelection(query, element){
    await page.waitForTimeout(1500);
    await page.focus(element);
    await page.keyboard.press('Enter');
    await page.type('[placeholder="Filtrar resultados"]', query);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
}

// Login to the site with the username and password stored in the secret.txt
async function login(){
    console.log("started work");
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto('https://www.seminuevos.com/login');

    await page.type('#email_login',username);
    await page.type('#password_login',password);
    await page.focus('#password_login');
    await page.keyboard.press('Enter');

    await page.waitForNavigation({
        waitUntil: 'networkidle0',
    });
}

// Use the given input data and parameters to enter
async function inputData(price, description){
    await page.goto('https://www.seminuevos.com/wizard?f_dealer_id=-1');

    console.log("started inputting");
    await typeSelection('Autos', '[data-activates="dropdown_types"]');
    await typeSelection('Acura', '[data-activates="dropdown_brands"]');
    await typeSelection('ILX', '[data-activates="dropdown_models"]');
    await typeSelection('Sed', '[data-activates="dropdown_subtypes"]');
    await typeSelection('2018', '[data-activates="dropdown_years"]');
    await typeSelection('Nuevo', '[data-activates="dropdown_provinces"]');
    await typeSelection('Monterrey', '[data-activates="dropdown_cities"]');
    await page.type('#input_recorrido',"20000");
    await typeSelection('Kms', '[data-activates="dropdown_mileageType"]');
    try {
        await page.type('#input_teléfono',"8181818181");
    } catch (error) {
        // no telephone input... must be an experiment depending on location
    }
    await page.type('#input_precio', price);
    await typeSelection('Negoc', '[data-activates="dropdown_negotiable"]');

    await page.click('[class="next-button"]');
    await page.waitForTimeout(6000);

    await page.type('#input_text_area_review',description);
}

// Send images to server
async function sendImages(){
    console.log("uploading images");
    await uploadImage('#Uploader', 'src/images/image1.jpg');
    await uploadImage('#Uploader', 'src/images/image2.jpg');
    await uploadImage('#Uploader', 'src/images/image3.jpg');
    console.log("images are now uploaded");
}

// Confirm data and take screenshot
async function confirmAndScreenshot(){
    await page.screenshot({path: 'src/imageUpload.png'});
    //console.log("going to next page")
    await page.waitForSelector('[class="next-button"]');
    //console.log("looking for next")
    await page.click('[class="next-button"]');
    //console.log("choosing next")
    await page.waitForTimeout(6000);
    //console.log("choosing free")
    await page.waitForSelector('#cancelButton');
    await page.click('#cancelButton');
    await page.waitForTimeout(6000);
    //console.log("ended inputting, now screenshotting");
    await page.screenshot({path: 'src/images/result.png'});
}

// Controls the interaction with the site
async function controlSite(price, description){
    await login();
    await inputData(price, description);
    await sendImages();
    await confirmAndScreenshot();
    await browser.close();
}

// Converts image to base64
function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return new Buffer.from(bitmap).toString('base64');
}

// Handles the postAD POST function
const postAd = async function(req, res) {
    var credentials = JSON.parse(fs.readFileSync("src/credentials.txt", "utf8"));
    username = credentials.username;
    password = credentials.password;
    await controlSite(req.body.price, req.body.description);
    return res.send({message: base64_encode('src/images/result.png')});
}

module.exports = {
    postAd: postAd
}