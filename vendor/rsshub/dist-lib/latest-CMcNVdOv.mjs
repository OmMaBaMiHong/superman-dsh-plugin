import "./types-DNj6Etbg.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import dayjs from "dayjs";
import { load } from "cheerio";
//#region lib/routes/yilinzazhi/latest.ts
const route = {
	path: "/latest",
	categories: ["reading"],
	view: 0,
	example: "/yilinzazhi/latest",
	radar: [{
		source: ["www.yilinzazhi.com"],
		target: "/"
	}],
	name: "近期文章汇总",
	maintainers: ["g0ngjie"],
	handler,
	url: "www.yilinzazhi.com",
	description: "最近一期的文章汇总"
};
async function handler() {
	const baseUrl = "https://www.yilinzazhi.com/";
	const $ = load((await got_default(baseUrl)).data);
	const currentYear = dayjs().year();
	const stage = $($(".year-section").toArray().find((el) => $(el).find(".year-title").text().includes(currentYear + ""))).find("a").toArray().map((elem) => {
		const aTag = $(elem);
		return {
			link: baseUrl + aTag.attr("href"),
			title: aTag.text()
		};
	})[0];
	const contents = (await cache_default.tryGet(stage.link, async () => {
		const $$ = load((await got_default(stage.link)).data);
		return $$(".maglistbox dl").toArray().map((catalog) => {
			return {
				title: $$(catalog).find("dt span").text(),
				tables: $$(catalog).find("a").toArray().map((aTag) => {
					const href = $$(aTag).attr("href");
					const yearType = currentYear + href.slice(4, 5);
					return {
						title: $$(aTag).text(),
						link: `${baseUrl}${currentYear}/yl${yearType}/${href}`
					};
				})
			};
		});
	})).flatMap((catalog) => catalog.tables);
	const items = await Promise.all(contents.map(async (target) => await cache_default.tryGet(target.link, async () => {
		target.description = load((await got_default(target.link)).data)(".blkContainerSblk.collectionContainer").html();
		return target;
	})));
	return {
		title: "意林 - 近期文章汇总",
		link: stage.link,
		item: items
	};
}
//#endregion
export { route };
