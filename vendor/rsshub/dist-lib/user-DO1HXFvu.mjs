import "./types-DNj6Etbg.mjs";
import { t as PRESETS } from "./header-generator-DACPoxdp.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/changba/user.tsx
const route = {
	path: "/:userid",
	categories: ["social-media"],
	view: 4,
	example: "/changba/skp6hhF59n48R-UpqO3izw",
	parameters: { userid: "用户ID, 可在对应分享页面的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: true,
		supportScihub: false
	},
	radar: [{ source: ["changba.com/s/:userid"] }],
	name: "用户",
	maintainers: [
		"kt286",
		"xizeyoupan",
		"pseudoyu"
	],
	handler
};
async function handler(ctx) {
	const url = `https://changba.com/wap/index.php?s=${ctx.req.param("userid")}`;
	const data = (await got_default({
		method: "get",
		url,
		headerGeneratorOptions: PRESETS.MODERN_IOS
	})).data;
	const $ = load(data);
	const list = $(".user-work .work-info").toArray();
	const author = $("div.user-main-info > span.txt-info > a.uname").text();
	const authorimg = $("div.user-main-info > .poster > img").attr("data-src");
	let items = await Promise.all(list.map((item) => {
		const $ = load(item);
		const link = $("a").attr("href");
		return cache_default.tryGet(link, async () => {
			const result = await got_default({
				method: "get",
				url: link,
				headerGeneratorOptions: PRESETS.MODERN_IOS
			});
			const re = /workid: '\d+'/;
			let workid;
			try {
				workid = result.data.match(re)[0];
			} catch {
				return null;
			}
			workid = workid.split("'", 2)[1];
			if (!workid) return null;
			const mp3 = `https://upscuw.changba.com/${workid}.mp3`;
			const description = renderToString(/* @__PURE__ */ jsx(ChangbaWorkDescription, {
				desc: $("div.des").text(),
				mp3url: mp3
			}));
			const itunes_item_image = $("div.work-cover").attr("style").replace(")", "").split("url(", 2)[1];
			return {
				title: $(".work-title").text(),
				description,
				link,
				author,
				itunes_item_image,
				enclosure_url: mp3,
				enclosure_type: "audio/mpeg"
			};
		});
	}));
	items = items.filter(Boolean);
	return {
		title: author + " - 唱吧",
		link: url,
		description: $("meta[name=\"description\"]").attr("content") || author + " - 唱吧",
		item: items,
		image: authorimg,
		itunes_author: author,
		itunes_category: "唱吧"
	};
}
const ChangbaWorkDescription = ({ desc, mp3url }) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("p", { children: desc }), /* @__PURE__ */ jsx("audio", {
	id: "audio",
	src: mp3url,
	preload: "metadata"
})] });
//#endregion
export { route };
