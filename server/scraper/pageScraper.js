
const { URL } = require('url'); 

const scraperObject = {
	async scraper(browser, _url) {
		let page = await browser.newPage();
		let visitedUrls = new Set();
		let targetHost = new URL(_url).host;
		
		async function getLinksRecursively(pageUrl) {
			if (visitedUrls.has(pageUrl)) {
				return [];
			}

			await page.goto(pageUrl);

			console.log(pageUrl);

			const links = await page.evaluate(() => {
				const linkElements = document.querySelectorAll('a');
				const linksArray = [];
				linkElements.forEach((link) => {
				  const href = link.getAttribute('href');
				  if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
					let parsedHref = new URL(href);
					if (parsedHref.host === targetHost) {
						linksArray.push(href);
					}
					
				  }
				});
				return linksArray;
			  });
		  
			  const pageTitle = await page.title(); // Get the page title
		  
			  const linkData = links.map((link) => ({
				link: pageUrl,
				source: pageUrl,
				target: link,
				content: pageTitle, // Include the page title
			  }));
		  
			  for (const link of links) {
				// Handle relative URLs
				const absoluteLink = new URL(link, pageUrl).href;
				linkData.push(...(await getLinksRecursively(absoluteLink)));
			  }
		  
			  return linkData;
			}
		  
			const linksData = await getLinksRecursively(_url);
		  		  
			console.log(linksData)
			return linksData;
    		
		}
	}


// const scraperObject = {
// 	async scraper(browser, _url){
// 		let scrapedData = [];
// 		let page = await browser.newPage();
// 		console.log(`Navigating to ${_url}...`);
// 		await page.goto(_url);

// 		let allLinks = new Map();

//         // Wait for the required DOM to be rendered
// 		await page.waitForSelector('body');
// 		// Get the link to all the required books
// 		let urls = await page.$$eval('li > a', as => as.map(a => {
// 			return {
// 				link: a.href,
// 				content: a.textContent
// 			}
// 		}));
		

// 		let pagePromise = (link) => new Promise(async(resolve, reject) => {
// 			let newPage = await browser.newPage();
// 			await newPage.goto(link);
// 			await newPage.waitForSelector('body');
// 			let newUrls = await newPage.$$eval('a', as => as.map(a => {
// 				return {
// 					link: a.href,
// 					content: a.textContent
// 				}
// 			}));

// 			resolve(newUrls);
// 			await newPage.close();
// 		});

// 		let addToMap = (link, content) => {
// 			if (allLinks.has(link)){
// 				allLinks.set(link, {
// 					count: allLinks.get(link).count + 1,
// 					content: content
// 				});
// 			} else {
// 				allLinks.set(link, {
// 					count: 1,
// 					content: content
// 				});
// 			}
// 		}

// 		for (let urlObj of urls) {
// 			addToMap(urlObj.link, urlObj.content);
// 			let currPageData = await pagePromise(urlObj.link);
// 			scrapedData.push({
// 				...urlObj,
// 				children: currPageData
// 			});

// 			currPageData.forEach((d) => {
// 				addToMap(d.link, d.content);

// 			})
// 		}

// 		//normalize count values
// 		let countValues = [...allLinks.values()].map((link) => {
// 			return link.count;
// 		})

// 		let min = Math.min(...countValues);
// 		let max = Math.max(...countValues);
 
// 		let scale = (number) => {
// 			let inMin = min, inMax = max;
// 			let outMin = 1, outMax = 5;
// 			let ret = (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
// 			return ret;
// 		}

// 		allLinks.forEach((key, value) => {
// 			allLinks.set(value, {
// 				count: scale(key.count),
// 				content: key.content
// 			})
// 		})

// 		let targetHost = new URL(_url).host;

// 		scrapedData = scrapedData.filter((d) => {
// 			const parsedUrl = new URL(d.link);
// 			return parsedUrl.host === targetHost;
// 		})

//         return scrapedData;
// 	},
// }



module.exports = scraperObject;