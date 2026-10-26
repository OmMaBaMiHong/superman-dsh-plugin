import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/ftchinese/utils.ts
const ProcessFeed = (i, $, link) => {
	const title = $("h1").text();
	let content = $("div.story-container").eq(i);
	content.find("div.story-image > figure").each((_, e) => {
		$(`<img src=${`https://thumbor.ftacademy.cn/unsafe/1340x754/${e.attribs["data-url"]}`}>`).insertAfter(content.find("div.story-lead")[0]);
	});
	content.find("div#subscribe-now-container").each((_, e) => {
		$(`<br/><p>此文章为付费文章，会员<a href='${link}'>请访问网站阅读</a>。</p>`).insertAfter(content.find("div.story-body")[0]);
		$(e).remove();
	});
	let author = "";
	content.find("span.story-author > a").each((_, e) => {
		author += `${$(e).text()} `;
	});
	author = author.trim();
	content.find("div.story-theme, h1.story-headline, div.story-byline, div.mpu-container-instory,script, div#story-action-placeholder, div.copyrightstatement-container, div.clearfloat, div.o-ads, h2.list-title, div.allcomments, div.logincomment, div.nologincomment").each((_, e) => {
		$(e).remove();
	});
	content = content.html();
	return {
		content,
		author,
		title
	};
};
const getData = async ({ site = "www", channel }) => {
	let feed;
	if (channel) {
		channel = channel.toLowerCase();
		channel = channel.split("-").join("/");
		try {
			feed = await parser.parseURL(`https://${site}.ftchinese.com/rss/${channel}`);
		} catch {
			return {
				title: `FT 中文网 ${channel} 不存在`,
				description: `FT 中文网 ${channel} 不存在`
			};
		}
	} else feed = await parser.parseURL(`https://${site}.ftchinese.com/rss/feed`);
	const items = await Promise.all(feed.items.map((item) => {
		item.link = item.link.replace("http://", "https://");
		return cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default.get(`${item.link}?full=y&archive`)).data);
			const results = [];
			for (let i = 0; i < $("div.story-container").length; i++) results.push(ProcessFeed(i, $, item.link));
			item.title = results[0].title;
			item.description = results.map((result) => result.content).join("");
			item.author = results[0].author;
			return item;
		});
	}));
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		item: items
	};
};
var utils_default = { getData };
//#endregion
//#region lib/routes/ftchinese/channel.ts
const route = {
	path: "/:language/:channel?",
	categories: ["traditional-media"],
	example: "/ftchinese/simplified/hotstoryby7day",
	parameters: {
		language: "语言，简体 `simplified`，繁体 `traditional`",
		channel: "频道，缺省为每日更新"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "FT 中文网",
	maintainers: ["HenryQW", "xyqfer"],
	handler,
	description: `::: tip

- 不支持付费文章。

:::

通过提取文章全文，以提供比官方源更佳的阅读体验。

支持所有频道，频道名称见 [官方频道 RSS](http://www.ftchinese.com/channel/rss.html).

- 频道为单一路径，如 \`http://www.ftchinese.com/rss/news\` 则为 \`/ftchinese/simplified/news\`.
- 频道包含多重路径，如 \`http://www.ftchinese.com/rss/column/007000002\` 则替换 \`/\` 为 \`-\` \`/ftchinese/simplified/column-007000002\`.`
};
async function handler(ctx) {
	return await utils_default.getData({
		site: ctx.req.param("language") === "simplified" ? "www" : "big5",
		channel: ctx.req.param("channel"),
		ctx
	});
}
//#endregion
export { route };
