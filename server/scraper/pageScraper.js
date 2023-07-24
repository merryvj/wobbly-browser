// var url = require('url');

var url = require('url');


const scraperObject = {
	async scraper(browser, _url){
		console.log("going to " + _url);
		const page = await browser.newPage();
		await page.goto(_url);
		let targetHost = url.parse(_url, true).host;

		//get all urls on page
		let links = await page.$$eval('a', as => as.map(a => a.href));

		//filter links for duplicates
		links = [...new Set(links)];
		links.filter((link) => !link.startsWith('#') && !link.startsWith('javascript:') && !link.startsWith('mailto:'));
		
	
		const mainTitle = await page.title();

		const result = {
			link: _url,
			content: mainTitle,
			children: [],
		};

		//visit each url to get data
		for (let link of links) {
			let parsedLink = url.parse(link, true);
			if (parsedLink.host != targetHost) {
				//const wwwPattern = /^https?:\/\/(www\.)/i;
				//const linkName = parsedLink.host.replace(wwwPattern, '');

				result.children.push({
					link: link,
					content: link,
					children: [link]
				})

			} else {
				await page.goto(link);
				const childLinks = await page.$$eval('a', as => as.map(a => a.href));
				const slugRegex = /\/([^/]+)\/?$/;
				const linkSlug = parsedLink.href.match(slugRegex)[1];

				result.children.push({
					link: link,
					content: linkSlug,
					children: childLinks
				})
			}
			
			
		}

		return result;
	},
}

module.exports = scraperObject;



// const scraperObject = {
// 	async scraper(browser, _url){
// 		let scrapedData = [];
// 		let visitedLinks = new Set();
// 		let page = await browser.newPage();
// 		console.log(`Navigating to ${_url}...`);
// 		await page.goto(_url);

// 		await page.waitForSelector('body');
// 		let title = await page.title();
		
// 		let urls = await page.$$eval('li > a', as => as.map(a => {
// 			visitedLinks.add(a.href);
// 			return {
// 				link: a.href,
// 				content: a.textContent,
// 				page: title,
// 			}
// 		}));
		

// 		let pagePromise = (link) => new Promise(async(resolve, reject) => {
// 			let newPage = await browser.newPage();
// 			await newPage.goto(link);
// 			await newPage.waitForSelector('body');
// 			let pageTitle = await newPage.title();
// 			let newUrls = await newPage.$$eval('a', as => as.map(a => {
// 				if (!visitedLinks.has(a.href)) {
// 					return {
// 						link: a.href,
// 						content: a.textContent,
// 						page: pageTitle
// 					}
// 				}
// 			}));

// 			resolve(newUrls);
// 			await newPage.close();
// 		});

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



//         return scrapedData;
// 	},
// }

// module.exports = scraperObject;

