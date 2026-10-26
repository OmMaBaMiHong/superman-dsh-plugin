import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/121/weather-live.tsx
const renderDescription = (description, images) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [description ? /* @__PURE__ */ jsx("p", { children: description }) : null, images?.length ? images.map((image) => image?.src ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
	src: image.src,
	alt: image.alt
}) }, image.src) : null) : null] }));
const handler = async (ctx) => {
	const limit = Number(ctx.req.query("limit") ?? "100");
	const baseUrl = "https://tf.121.com.cn";
	const imgBaseUrl = "https://wx.121.com.cn";
	const targetUrl = new URL("web/weatherLive/", baseUrl).href;
	const apiUrl = new URL("weather/weibo/message.js", baseUrl).href;
	const $ = load(await rofetch(targetUrl));
	const language = $("html").attr("lang") ?? "zh";
	const messages = await (await rofetch(apiUrl)).text();
	const items = JSON.parse(messages.split(/var\smessage=/).pop()).slice(0, limit).map((item) => {
		const title = item.Title;
		const description = renderDescription(item.Content, item.Img?.map((img) => ({
			src: new URL(`WeChat/data/weiweb/images/lwspic/${img}`, imgBaseUrl).href,
			alt: title
		})));
		const pubDate = item.DDatetime;
		const linkUrl = targetUrl;
		const guid = `121-${title}-${pubDate}`;
		const image = item.Img?.length > 0 ? new URL(`WeChat/data/weiweb/images/lwspic/${item.Img[0]}`, imgBaseUrl).href : void 0;
		const updated = pubDate;
		return {
			title,
			description,
			pubDate: pubDate ? parseDate(pubDate) : void 0,
			link: linkUrl ?? new URL(item.id, baseUrl).href,
			guid,
			id: guid,
			content: {
				html: description,
				text: description
			},
			image,
			banner: image,
			updated: updated ? parseDate(updated) : void 0,
			language
		};
	});
	const title = $("title").text();
	return {
		title,
		description: title,
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("img").first().attr("src") ? new URL($("img").first().attr("src"), baseUrl).href : void 0,
		author: $("div#webnameDiv").text(),
		language,
		id: targetUrl
	};
};
const route = {
	path: "/weatherLive",
	name: "深圳天气直播",
	url: "tf.121.com.cn",
	maintainers: ["nczitzk"],
	handler,
	example: "/121/weatherLive",
	parameters: void 0,
	description: void 0,
	categories: ["forecast"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["tf.121.com.cn", "tf.121.com.cn/web/weatherLive"],
		target: "/weatherLive"
	}],
	view: 5
};
//#endregion
export { handler, route };
