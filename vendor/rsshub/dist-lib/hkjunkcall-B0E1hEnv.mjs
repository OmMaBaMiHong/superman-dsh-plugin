import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/hkjunkcall/index.ts
const route = {
	path: "/",
	radar: [{
		source: ["hkjunkcall.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "hkjunkcall.com/"
};
async function handler() {
	const currentUrl = `https://hkjunkcall.com/cdpushdash.asp`;
	const $ = load((await got_default({
		method: "get",
		url: currentUrl
	})).data);
	const list = $(".hh15").toArray().map((item) => {
		item = $(item).parent();
		return {
			title: item.text(),
			link: item.attr("href")
		};
	});
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content(".card").find("div, h2").remove();
		item.guid = item.link.split("/").pop();
		item.description = content(".card").html();
		item.pubDate = parseDate(detailResponse.data.match(/<br \/>(\d+-\d+-\d+)<\/div><\/a>/)[1]);
		return item;
	})));
	return {
		title: $("title").text(),
		link: currentUrl,
		item: items
	};
}
//#endregion
export { route };
