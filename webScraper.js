
const puppeteer = require('puppeteer');

async function scrapeCategory(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    //get page count element
    const [subCatTotalItemsElement] = await retry(page.$x,'//body/wnz-content/div[2]/wnz-search/div[2]/main/search-pies-header/div[1]/span');
    const subCatTotalItemsTxt = await retry(subCatTotalItemsElement.getProperty,'textContent');
    console.log('prop: ',subCatTotalItemsTxt);
    const subCatTotalItemsRawText = await subCatTotalItemsTxt.jsonValue();
    const numberOfItemsInSubCat = Number(subCatTotalItemsRawText.replace(' items', ''));
    //calculate number of pages and how many items will be on the last page
    const totalPages = Math.ceil(numberOfItemsInSubCat / 120);
    const itemsOnLastPage = numberOfItemsInSubCat % 120;

    console.log(totalPages, ' ', itemsOnLastPage)
    for (let currentPage = 1; currentPage < totalPages + 1; currentPage++) {// loop through each page
        await page.goto(`${url}?page=${currentPage}&size=120`);
        const numberOfItemsOnPage = currentPage == totalPages ? itemsOnLastPage : 120;
        for (let ItemIndex = 1; ItemIndex < numberOfItemsOnPage; ItemIndex++) {//loop through each item 
            console.log(ItemIndex)
            const [priceElement] = await page.$x(`/html/body/wnz-content/div[2]/wnz-search/div[2]/main/product-grid/product-stamp-grid[${ItemIndex}]/cdx-card/a/div/product-price`);
            const priceTxt = await retry(priceElement.getProperty);
            const priceRawText = await priceTxt.jsonValue();
            const [nameElement] = await page.$x(`/html/body/wnz-content/div[2]/wnz-search/div[2]/main/product-grid/product-stamp-grid[${ItemIndex}]/cdx-card/a/h2`);
            const nameTxt = await retry(nameElement.getProperty);
            const nameRawText = await nameTxt.jsonValue();
            console.log(nameRawText, ' ', priceRawText)
        }
    }
}

async function retry(func,arg) {
    try {
        const result = await func(arg);
        console.log(result);
        console.log('success')
        return result;
    }
    catch (e) {
        console.log(e)
        console.log('retrying')
        await sleep(3000)
        retry(func);
    }
}

async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }  

scrapeCategory('https://shop.countdown.co.nz/shop/browse/meat-seafood/plant-based-alternatives');

