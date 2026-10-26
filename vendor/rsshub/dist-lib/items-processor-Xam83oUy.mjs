//#region lib/routes/publico/items-processor.ts
function getItems(data) {
	return data(".category-list li").toArray().map((item) => {
		item = data(item);
		const title = item.find("h2").text();
		const link = item.find("a").attr("href");
		const author = item.find("p").text();
		return {
			title,
			link,
			description: `<img src="${item.find("picture img").attr("src")}" alt="${title}">`,
			author
		};
	});
}
//#endregion
export { getItems as t };
