import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/soundofhope/channel.ts
const host = "https://www.soundofhope.org";
const route = {
	path: "/:channel/:id",
	categories: ["traditional-media"],
	example: "/soundofhope/term/203",
	parameters: {
		channel: "频道",
		id: "子频道 ID"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["soundofhope.org/:channel/:id"] }],
	name: "频道",
	maintainers: ["Fatpandac"],
	handler,
	description: `参数均可在官网获取，如：

\`https://www.soundofhope.org/term/203\` 对应 \`/soundofhope/term/203\``
};
async function handler(ctx) {
	const channel = ctx.req.param("channel");
	const id = ctx.req.param("id");
	const url = `${host}/${channel}/${id}`;
	const $ = load((await got_default(url)).data);
	const title = $("div.left > nav").text().split("/").slice(1).join("");
	const list = $("div.item").toArray().map((item) => ({
		title: $(item).find("div.title").text(),
		link: new URL($(item).find("a").attr("href"), host).href
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default(item.link)).data);
		item.description = content("div.Content__Wrapper-sc-1bvya0-0").html();
		item.pubDate = timezone(parseDate(content("div.date").text(), "YYYY.M.D HH:mm"), -8);
		return item;
	})));
	return {
		title: `希望之声 - ${title}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
