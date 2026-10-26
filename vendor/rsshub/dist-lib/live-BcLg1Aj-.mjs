import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/kepu/live.tsx
const route = {
	path: "/live",
	categories: ["new-media"],
	example: "/kepu/live",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: true,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["live.kepu.net.cn/replay/index"] }],
	name: "直播回看",
	maintainers: ["nczitzk"],
	handler,
	url: "live.kepu.net.cn/replay/index"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ? Number(ctx.req.query("limit")) : 50;
	const rootUrl = "https://live.kepu.net.cn";
	const apiRootUrl = "https://live.kepu.net.cn:8089";
	const currentUrl = new URL("replay/index", rootUrl).href;
	const apiUrl = new URL("index.php/front/index/replay_list", apiRootUrl).href;
	const { data: response } = await got_default.post(apiUrl, { form: {
		page: 1,
		size: limit
	} });
	let items = response.data.data.slice(0, limit).map((item) => ({
		title: item.title,
		link: new URL(`live/index?id=${item.id}`, rootUrl).href,
		description: item.desc,
		author: item.company,
		guid: item.id,
		pubDate: timezone(parseDate(item.live_start_time ?? item.start_time), 8),
		updated: timezone(parseDate(item.live_end_time ?? item.end_time), 8),
		itunes_item_image: new URL(item.cover, apiRootUrl).href,
		comments: item.display_comment ?? 0
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const apiReplayUrl = new URL("index.php/front/live/replay_url", apiRootUrl).href;
		const { data: detailResponse } = await got_default.post(apiReplayUrl, { form: { id: item.guid } });
		item.guid = `kepu-live#${item.guid}`;
		item.enclosure_url = detailResponse.data.RecordIndexInfoList.RecordIndexInfo.pop()?.RecordUrl;
		if (item.enclosure_url) item.enclosure_type = `video/${item.enclosure_url.split(/\./).pop()}`;
		const poster = item.itunes_item_image;
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
			item.itunes_item_image ? /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
				src: item.itunes_item_image,
				alt: item.title
			}) }) : null,
			item.enclosure_url ? /* @__PURE__ */ jsxs("video", {
				poster,
				controls: true,
				children: [/* @__PURE__ */ jsx("source", {
					src: item.enclosure_url,
					type: item.enclosure_type
				}), /* @__PURE__ */ jsx("object", {
					data: item.enclosure_url,
					children: /* @__PURE__ */ jsx("embed", { src: item.enclosure_url })
				})]
			}) : null,
			item.description ? /* @__PURE__ */ jsx("p", { children: item.description }) : null
		] }));
		return item;
	})));
	const icon = new URL("favicon.ico", rootUrl).href;
	const author = "中国科普博览";
	const subtitle = "直播回看";
	return {
		item: items,
		title: `${author} - ${subtitle}`,
		link: currentUrl,
		description: "科学直播(live.kepu.net.cn)",
		language: "zh",
		icon,
		logo: icon,
		subtitle,
		author,
		itunes_author: author,
		itunes_category: "Science",
		allowEmpty: true
	};
}
//#endregion
export { route };
