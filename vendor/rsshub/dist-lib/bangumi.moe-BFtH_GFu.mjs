import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/bangumi.moe/index.ts
const route = {
	path: "/:tags{.+}?",
	categories: ["anime"],
	example: "/bangumi.moe",
	parameters: { tags: "Tags, empty by default, multiple tags separated by `/`" },
	radar: [{ source: ["bangumi.moe/"] }],
	name: "Latest",
	maintainers: ["nczitzk"],
	handler,
	url: "bangumi.moe/"
};
async function handler(ctx) {
	const { tags } = ctx.req.param();
	const isLatest = !tags;
	const rootUrl = "https://bangumi.moe";
	let response;
	let searchLink = rootUrl;
	if (isLatest) response = await got_default({
		method: "get",
		url: `${rootUrl}/api/torrent/latest`
	});
	else {
		const torrentUrl = `${rootUrl}/api/torrent/search`;
		const tag_id = await searchTagIds(tags, rootUrl);
		searchLink = `${rootUrl}/search/${tag_id.join("+")}`;
		response = await got_default({
			method: "post",
			url: torrentUrl,
			json: { tag_id }
		});
	}
	let items = response.data.torrents?.slice(0, ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 30).map((item) => ({
		title: item.title,
		link: `${rootUrl}/torrent/${item._id}`,
		description: item.introduction,
		pubDate: parseDate(item.publish_time),
		enclosure_url: item.magnet,
		enclosure_type: "application/x-bittorrent",
		category: item.tag_ids
	})) ?? [];
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const detailResponse = await got_default({
			method: "post",
			url: `${rootUrl}/api/tag/fetch`,
			json: { _ids: item.category }
		});
		item.category = [];
		for (const tag of detailResponse.data) for (const t of tag.synonyms) item.category.push(t);
		return item;
	})));
	return {
		title: "萌番组 Bangumi Moe",
		link: isLatest || items.length === 0 ? rootUrl : searchLink,
		item: items,
		allowEmpty: true
	};
}
async function searchTagIds(tags, rootUrl) {
	const tagUrl = `${rootUrl}/api/tag/search`;
	return (await Promise.all(tags.split("/").map((param) => cache_default.tryGet(`bangumi.moe:tag:${param}`, async () => {
		const paramResponse = await got_default({
			method: "post",
			url: tagUrl,
			json: {
				name: decodeURIComponent(param),
				keywords: true,
				multi: true
			}
		});
		return paramResponse.data.found ? paramResponse.data.tag.map((tag) => tag._id)[0] : "";
	})))).toSorted((a, b) => a.localeCompare(b));
}
//#endregion
export { route };
