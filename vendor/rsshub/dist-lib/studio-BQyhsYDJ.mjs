import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/thepaper/839studio/studio.ts
const route = {
	path: "/839studio",
	name: "澎湃美数课作品集",
	maintainers: ["umm233"],
	handler
};
async function handler() {
	const data = (await got_default({
		method: "get",
		url: "http://projects.thepaper.cn/thepaper-cases/839studio/?lang=zh"
	})).data;
	const $ = load(data);
	return {
		title: "澎湃美数课作品集",
		link: "http://projects.thepaper.cn/thepaper-cases/839studio/",
		item: $("div[class=imgtext]").toArray().map((item) => {
			item = $(item);
			return {
				title: item.find(".imgup a").first().text(),
				description: `描述：${item.find(".imgdown p").text()}`,
				link: item.find(".imgup a").attr("href")
			};
		})
	};
}
//#endregion
export { route };
