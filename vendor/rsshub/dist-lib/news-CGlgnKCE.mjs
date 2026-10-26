import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
import pMap from "p-map";
//#region lib/routes/kcna/utils.ts
const rootUrl = "http://www.kcna.kp";
const fixDesc = ($, elem) => {
	$(elem).find(".fSpecCs").each((_, item) => {
		if (item.parent.name === "nobr") $(item).unwrap();
		item.name = "b";
		item.attribs = {};
	});
	return elem.html();
};
const fetchPhoto = (ctx, url) => cache_default.tryGet(url, async () => {
	const $ = load((await got_default(url)).data);
	let html = "";
	$(".content img").each((_, item) => {
		const src = item.attribs.src;
		if (src) html += html ? `<br><img src="${src}">` : `<img src="${src}">`;
	});
	return html;
});
const fetchVideo = (ctx, url) => cache_default.tryGet(url, async () => {
	let sources = load((await got_default(url)).data)("script[type=\"text/javascript\"]:not([src])").html().match(/<[^>]*source[^>]+src[^>]+>/g);
	sources &&= sources.map((item) => item.replaceAll("'", "\"").replaceAll(/src="([^"]+)"/g, (_match, p1) => `src="${rootUrl}${p1}"`));
	return `<video controls preload="metadata">${sources.join("\n")}</video>`;
});
//#endregion
//#region lib/routes/kcna/news.tsx
const route = {
	path: "/:lang/:category?",
	categories: ["traditional-media"],
	example: "/kcna/en",
	parameters: {
		lang: "Language, refer to the table below",
		category: "Category, refer to the table below"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: [
			"www.kcna.kp/:lang",
			"www.kcna.kp/:lang/category/articles/q/1ee9bdb7186944f765208f34ecfb5407.kcmsf",
			"www.kcna.kp/:lang/category/articles.kcmsf"
		],
		target: "/:lang"
	}],
	name: "News",
	maintainers: ["Rongronggg9"],
	handler,
	description: `| Language | 조선어 | English | 中国语 | Русский | Español | 日本語 |
| -------- | ------ | ------- | ------ | ------- | ------- | ------ |
| \`:lang\`  | \`kp\`   | \`en\`    | \`cn\`   | \`ru\`    | \`es\`    | \`jp\`   |

| Category                                                         | \`:category\`                        |
| ---------------------------------------------------------------- | ---------------------------------- |
| WPK General Secretary **Kim Jong Un**'s Revolutionary Activities | \`54c0ca4ca013a92cc9cf95bd4004c61a\` |
| Latest News (default)                                            | \`1ee9bdb7186944f765208f34ecfb5407\` |
| Top News                                                         | \`5394b80bdae203fadef02522cfb578c0\` |
| Home News                                                        | \`b2b3bcc1b0a4406ab0c36e45d5db58db\` |
| Documents                                                        | \`a8754921399857ebdbb97a98a1e741f5\` |
| World                                                            | \`593143484cf15d48ce85c26139582395\` |
| Society-Life                                                     | \`93102e5a735d03979bc58a3a7aefb75a\` |
| External                                                         | \`0f98b4623a3ef82aeea78df45c423fd0\` |
| News Commentary                                                  | \`12c03a49f7dbe829bceea8ac77088c21\` |`
};
async function handler(ctx) {
	const { lang, category = "1ee9bdb7186944f765208f34ecfb5407" } = ctx.req.param();
	const rootUrl = "http://www.kcna.kp";
	const pageUrl = `${rootUrl}/${lang}/category/articles/q/${category}.kcmsf`;
	const $ = load((await got_default(pageUrl)).data);
	return {
		title: sanitizeHtml($("head > title").text(), {
			allowedTags: [],
			allowedAttributes: {}
		}),
		link: pageUrl,
		item: await pMap($(".article-link li a").toArray().map((item) => {
			item = $(item);
			const dateElem = item.find(".publish-time");
			const dateString = dateElem.text().match(/\d+\.\d+\.\d+/);
			dateElem.remove();
			return {
				title: item.text(),
				link: rootUrl + item.attr("href"),
				pubDate: timezone(parseDate(dateString[0]), 9)
			};
		}), (item) => cache_default.tryGet(item.link, async () => {
			const $ = load((await got_default(item.link)).data);
			item.title = $("article-main-title").text() || item.title;
			const dateElem = $(".publish-time");
			const dateString = dateElem.text().match(/\d+\.\d+\.\d+/);
			dateElem.remove();
			item.pubDate = dateString ? timezone(parseDate(dateString[0]), 9) : item.pubDate;
			const description = fixDesc($, $(".article-content-body .content-wrapper"));
			const media = $(".media-icon a").toArray().map((elem) => rootUrl + elem.attribs.href);
			let photo, video;
			await Promise.all(media.map(async (medium) => {
				if (medium.includes("/photo/")) photo = await fetchPhoto(ctx, medium);
				else if (medium.includes("/video/")) video = await fetchVideo(ctx, medium);
			}));
			item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				description ? raw(description) : null,
				photo ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), raw(photo)] }) : null,
				video ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("br", {}), raw(video)] }) : null
			] }));
			return item;
		}), { concurrency: 3 })
	};
}
//#endregion
export { route };
