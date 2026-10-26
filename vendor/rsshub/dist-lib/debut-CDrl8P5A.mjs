import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./desc-DnMTmsJu.mjs";
import { load } from "cheerio";
//#region lib/routes/cnki/debut.ts
const rootUrl = "https://chn.oversea.cnki.net";
const route = {
	path: "/journals/debut/:name",
	categories: ["journal"],
	example: "/cnki/journals/debut/LKGP",
	parameters: { name: "期刊缩写，可以在网址中得到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["navi.cnki.net/knavi/journals/:name/detail"] }],
	name: "网络首发",
	maintainers: ["Fatpandac"],
	handler
};
async function handler(ctx) {
	const name = ctx.req.param("name");
	const journalUrl = `${rootUrl}/knavi/JournalDetail?pcode=CjFD&pykm=${name}`;
	const title = load((await got_default.get(journalUrl)).data)("head > title").text();
	const $ = load((await got_default({
		method: "post",
		url: `${rootUrl}/knavi/JournalDetail/GetnfAllOutline`,
		form: {
			pageIdx: "0",
			type: "2",
			pcode: "CJFD",
			pykm: name
		}
	})).data);
	const list = $("dd").toArray().map((item) => ({
		title: $(item).find("span.name > a").text().trim(),
		link: `${rootUrl}/kcms/detail/${new URLSearchParams(new URL(`${rootUrl}/${$(item).find("span.name > a").attr("href")}`).search).get("url")}.html`,
		pubDate: parseDate($(item).find("span.company").text(), "YYYY-MM-DD HH:mm:ss")
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $ = load((await got_default.get(item.link)).data);
		item.description = renderDescription({
			author: $("h3.author > span").toArray().map((item) => $(item).text()).join(" "),
			company: $("a.author").toArray().map((item) => $(item).text()).join(" "),
			content: $("div.row > span.abstract-text").parent().text()
		});
		return item;
	})));
	return {
		title: `${title} - 全网首发`,
		link: `https://navi.cnki.net/knavi/journals/${name}/detail`,
		item: items
	};
}
//#endregion
export { route };
