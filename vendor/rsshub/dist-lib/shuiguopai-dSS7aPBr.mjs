import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/shuiguopai/index.tsx
const route = {
	path: "/",
	radar: [{
		source: ["shuiguopai.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["nczitzk"],
	handler,
	url: "shuiguopai.com/",
	features: { nsfw: true }
};
async function handler(ctx) {
	const rootUrl = "https://sgptv.vip";
	const apiRootUrl = "https://api.cbbee0.com";
	const listUrl = `${apiRootUrl}/v1_2/homePage`;
	const filmUrl = `${apiRootUrl}/v1_2/filmInfo`;
	let items = (await got_default({
		method: "post",
		url: listUrl,
		json: {
			device_id: "",
			hm: "008-api",
			last_page: 0,
			length: ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 50,
			ltype: 1,
			page: 1,
			userToken: ""
		}
	})).data.data.list.map((item) => ({
		title: item.title,
		guid: item.library_id,
		link: `${rootUrl}/play-details/${item.library_id}`,
		pubDate: timezone(parseDate(item.show_time_origin, "YYYY-MM-DD HH:mm:ss"), 8),
		category: item.tags.map((t) => t.tag_title)
	}));
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "get",
			url: item.link
		});
		const content = load(detailResponse.data);
		content("iframe").remove();
		let videos;
		const filmId = detailResponse.data.match(/film_id:"([\d,]+)",/)?.[1];
		if (filmId) {
			const data = (await got_default({
				method: "post",
				url: filmUrl,
				json: {
					device_id: "",
					film_id: filmId,
					hm: "008-api",
					userToken: ""
				}
			})).data.data;
			videos = data.map((d) => d.download_url);
			item.category = data.flatMap((d) => d.tags.map((t) => t.tag_title));
			item.author = data.map((d) => d.actor).join(" ");
		}
		item.description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [videos?.map((video) => /* @__PURE__ */ jsx("video", {
			controls: true,
			children: /* @__PURE__ */ jsx("source", {
				src: video,
				type: "video/mp4"
			})
		})), raw(content(".content").html())] }));
		return item;
	})));
	return {
		title: "水果派",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
