import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/ntdtv/channel.ts
const host = "https://www.ntdtv.com";
const route = {
	path: "/:language/:id",
	categories: ["traditional-media"],
	example: "/ntdtv/b5/prog1201",
	parameters: {
		language: "语言，简体为`gb`，繁体为`b5`",
		id: "子频道名称"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.ntdtv.com/:language/:id"] }],
	name: "频道",
	maintainers: ["Fatpandac"],
	handler,
	description: `参数均可在官网获取，如：

\`https://www.ntdtv.com/b5/prog1201\` 对应 \`/ntdtv/b5/prog1201\``
};
async function handler(ctx) {
	const language = ctx.req.param("language");
	const id = ctx.req.param("id");
	const url = `${host}/${language}/${id}`;
	const $ = load((await got_default(url)).data);
	const title = $("h1.block_title").text();
	const list = $("div.list_wrapper > div").toArray().map((item) => ({
		title: $(item).find("div.title").text(),
		link: $(item).find("div.title > a").attr("href"),
		description: $(item).find("div.excerpt").text()
	})).filter((item) => item.link);
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default.get(item.link)).data);
		item.description = content("div.post_content").html();
		item.pubDate = timezone(parseDate(content("div.time > span").text()), 8);
		return item;
	})));
	return {
		title: `新唐人电视台 - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
