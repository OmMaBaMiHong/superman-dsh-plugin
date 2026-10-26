import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nikkei/index.ts
const route = {
	path: "/index",
	name: "Home",
	example: "/nikkei/index",
	maintainers: ["zjysdhr"],
	handler,
	url: "www.nikkei.com"
};
async function handler() {
	const url = "https://www.nikkei.com";
	const $ = load((await got_default(url)).data);
	return {
		title: "日本経済新聞",
		link: url,
		item: $("a[data-rn-inview-track-value]").toArray().map((e) => {
			e = $(e);
			const data = e.data("rn-track-value");
			const title = data.title;
			const link = `${url}/article/${data.kiji_id_raw}/`;
			const parent = e.parent();
			const img = parent.find("img[class^=image_]");
			return {
				title,
				description: `<img src="${img.attr("src")}" alt="${img.attr("alt")}">` + (parent.find("[class^=excerptContainer]").length ? parent.find("[class^=excerptContainer]").html() : ""),
				link
			};
		})
	};
}
//#endregion
export { route };
