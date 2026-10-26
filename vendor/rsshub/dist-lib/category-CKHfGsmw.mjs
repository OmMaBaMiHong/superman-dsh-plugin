import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/thepaper/839studio/category.ts
const route = {
	path: "/839studio/:id",
	radar: [{ source: ["thepaper.cn/"] }],
	name: "澎湃美数课作品集 - 分类",
	maintainers: ["umm233"],
	handler,
	url: "thepaper.cn/"
};
async function handler(ctx) {
	const link = `http://projects.thepaper.cn/thepaper-cases/839studio/?cat=${ctx.req.param("id")}`;
	const data = (await got_default({
		method: "get",
		url: link
	})).data;
	const $ = load(data);
	const list = $("div[class=imgtext]");
	const category = $("div[class=lefth]").find("h1").text();
	const desc = $("div[class=leftc]").find("p").text();
	return {
		title: `澎湃美数课作品集-${category}`,
		link,
		description: desc,
		item: list.toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".archive_up a").first().text(),
				description: `描述：${item.find(".imgdown p").text()}`,
				link: item.find(".archive_up a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
