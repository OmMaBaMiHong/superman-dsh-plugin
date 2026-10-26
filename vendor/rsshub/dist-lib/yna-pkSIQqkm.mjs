import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/yna/index.ts
const route = {
	path: "/:lang?/:channel?",
	categories: ["traditional-media"],
	example: "/yna/en/national",
	parameters: {
		lang: "Language, see below, `ko` by default",
		channel: "RSS Feed Channel, see below, `news` by default"
	},
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		requireConfig: false
	},
	name: "News",
	maintainers: ["quiniapiezoelectricity"],
	handler,
	description: `| Language | 한국어 | English | 简体中文 | 日本語 | عربي | Español | Français |
| -------- | ------ | ------- | -------- | ------ | ---- | ------- | -------- |
| \`:lang\`  | \`ko\`   | \`en\`    | \`cn\`     | \`jp\`   | \`ar\` | \`es\`    | \`fr\`     |

For a full list of RSS Feed Channels, please refer to the RSS feed page of the corresponding language

| RSS Feed Page                                             |
| --------------------------------------------------------- |
| [한국어](https://www.yna.co.kr/rss/index?site=footer_rss) |
| [English](https://en.yna.co.kr/channel/index)             |
| [简体中文](https://cn.yna.co.kr/channel/index)            |
| [日本語](https://jp.yna.co.kr/channel/index)              |
| [عربي](https://ar.yna.co.kr/channel/index)                |
| [Español](https://sp.yna.co.kr/channel/index)             |
| [Français](https://fr.yna.co.kr/channel/index)            |

::: tip
For example, the path for the RSS feed url <https://www.yna.co.kr/rss/economy.xml> and <https://cn.yna.co.kr/RSS/news.xml> would be \`/ko/economy\` and \`/cn/news\` respectively.
:::`
};
async function handler(ctx) {
	const lang = ctx.req.param("lang") ?? "ko";
	const channel = ctx.req.param("channel") ?? "news";
	let url;
	switch (lang) {
		case "ko":
			url = `https://www.yna.co.kr/rss/${channel}.xml`;
			break;
		default:
			url = `https://${lang}.yna.co.kr/RSS/${channel}.xml`;
			break;
	}
	const feed = await parser.parseURL(url);
	const items = await Promise.all(feed.items.map((item) => cache_default.tryGet(item.link, async () => {
		item.pubDate = lang === "ko" ? parseDate(item.pubDate) : timezone(parseDate(item.pubDate), 9);
		const $ = load((await got_default(item.link)).data);
		item.author = item.creator ?? $(".tit-name").toArray().map((c) => $(c).text()).join(", ");
		const article = $("article.story-news");
		article.find(".related-group").remove();
		article.find(".writer-zone01").remove();
		item.description = article.html();
		return item;
	})));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		language: feed.language ?? lang,
		item: items
	};
}
//#endregion
export { route };
