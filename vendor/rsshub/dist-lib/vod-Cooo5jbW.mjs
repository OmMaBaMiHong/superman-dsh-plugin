import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { load } from "cheerio";
//#region lib/routes/olevod/vod.ts
const route = {
	path: "/vod/:id",
	categories: ["multimedia"],
	example: "/olevod/vod/202449091",
	parameters: { id: "视频id号" },
	radar: [{
		source: ["www.olevod.one/vod/:id"],
		target: "/vod/:id"
	}],
	name: "视频",
	maintainers: ["fang63625"],
	handler,
	features: { nsfw: true }
};
async function handler(ctx) {
	const urlBase = "https://www.olevod.one";
	const url = `${urlBase}/vod/${ctx.req.param("id")}`;
	const $ = load(await rofetch(url));
	const title = $(".title.scookie").text().trim();
	const image = $(".vodlist_thumb.lazyload").attr("data-original");
	return {
		title,
		link: url,
		item: $(".content_playlist.clearfix a").toArray().map((item) => {
			const tmp = $(item);
			const href = urlBase + tmp.attr("href");
			return {
				title: `${title}  ${tmp.text()}`,
				link: href
			};
		}),
		image: urlBase + image
	};
}
//#endregion
export { route };
