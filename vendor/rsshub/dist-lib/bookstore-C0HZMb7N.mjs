import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/douban/other/bookstore.ts
const route = {
	path: "/bookstore",
	categories: ["social-media"],
	example: "/douban/bookstore",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "豆瓣书店",
	maintainers: ["xyqfer"],
	handler
};
async function handler() {
	const link = "https://market.douban.com/book/";
	return {
		title: "豆瓣书店",
		link,
		description: "在豆瓣书店，遇见美好·書生活",
		item: (await got_default({
			method: "get",
			url: "https://market.douban.com/api/freyr/books?page=1&page_size=20&type=book",
			headers: { Referer: link }
		})).data.data.map(({ title, url, price, square_pic, rectangle_pic, desc }) => ({
			title,
			link: url,
			description: `
        <img src="${rectangle_pic}"><br>
        <img src="${square_pic}"><br>
        ${desc}<br>
        <strong>价格:</strong> ${price}元
      `
		}))
	};
}
//#endregion
export { route };
