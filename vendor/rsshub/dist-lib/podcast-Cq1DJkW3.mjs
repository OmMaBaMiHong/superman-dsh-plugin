import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/xiaoyuzhou/podcast.ts
const route = {
	path: "/podcast/:id",
	categories: ["multimedia"],
	view: 4,
	example: "/xiaoyuzhou/podcast/6021f949a789fca4eff4492c",
	parameters: { id: "播客 id 或单集 id，可以在小宇宙播客的 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["xiaoyuzhoufm.com/podcast/:id", "xiaoyuzhoufm.com/episode/:id"] }],
	name: "播客",
	maintainers: [
		"hondajojo",
		"jtsang4",
		"pseudoyu",
		"cscnk52"
	],
	handler,
	url: "xiaoyuzhoufm.com/"
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	let link;
	let response;
	let $;
	let page_data;
	try {
		link = `https://www.xiaoyuzhoufm.com/podcast/${id}`;
		response = await rofetch(link);
		$ = load(response);
		const nextDataElement = $("#__NEXT_DATA__").get(0);
		page_data = JSON.parse(nextDataElement.children[0].data);
		if (!page_data.props.pageProps.podcast?.episodes) throw new Error("No episodes found in podcast data");
	} catch {
		link = `https://www.xiaoyuzhoufm.com/episode/${id}`;
		response = await rofetch(link);
		$ = load(response);
		const podcastLink = $("a[href^=\"/podcast/\"].name").attr("href");
		if (podcastLink) {
			link = `https://www.xiaoyuzhoufm.com/podcast/${podcastLink.split("/").pop()}`;
			response = await rofetch(link);
			$ = load(response);
			const nextDataElement = $("#__NEXT_DATA__").get(0);
			page_data = JSON.parse(nextDataElement.children[0].data);
		}
	}
	let episodes = page_data.props.pageProps.podcast.episodes.map((item) => ({
		title: item.title,
		enclosure_url: item.enclosure.url,
		itunes_duration: item.duration,
		enclosure_type: "audio/mpeg",
		link: `https://www.xiaoyuzhoufm.com/episode/${item.eid}`,
		eid: item.eid,
		pubDate: parseDate(item.pubDate),
		itunes_item_image: (item.image || item.podcast?.image)?.smallPicUrl
	}));
	episodes = await Promise.all(episodes.map((item) => cache_default.tryGet(item.link, async () => {
		const episodeItem = (await rofetch(`https://www.xiaoyuzhoufm.com/_next/data/${page_data.buildId}/episode/${item.eid}.json`)).pageProps.episode;
		item.description = episodeItem.shownotes || episodeItem.description || episodeItem.title || "";
		return item;
	})));
	return {
		title: page_data.props.pageProps.podcast.title,
		link: `https://www.xiaoyuzhoufm.com/podcast/${page_data.props.pageProps.podcast.pid}`,
		itunes_author: page_data.props.pageProps.podcast.author,
		itunes_category: "",
		image: page_data.props.pageProps.podcast.image.smallPicUrl,
		item: episodes,
		description: page_data.props.pageProps.podcast.description
	};
}
//#endregion
export { route };
