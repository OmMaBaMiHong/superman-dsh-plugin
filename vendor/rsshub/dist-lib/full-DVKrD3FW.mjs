import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as parser } from "./rss-parser-lNYr71DQ.mjs";
import { load } from "cheerio";
//#region lib/routes/npr/full.ts
const getArticleDetail = (link) => cache_default.tryGet(link, async () => {
	const $ = load((await got_default(link)).data);
	let categories = $(".tag").toArray().map((el) => $(el).text().trim());
	if (categories.length < 1) {
		const slug = $(".slug a").contents().first().text().trim();
		if (slug) categories = [slug];
	}
	if ($(".audio-availability-message").length > 0) return null;
	for (const x of $(".audio-module").toArray()) {
		const audio_tag = `<audio controls><source src="${$($(x).find(".audio-tool-download a")).attr("href")}" type="audio/mp3"></audio>`;
		$(x).replaceWith(audio_tag);
	}
	const audio = $("#headlineaudio").length > 0 ? $("#headlineaudio").html() + "<br>" : "";
	const m = $.html().match(/\?storyId=(\d+)&amp;mediaId=(\d+)/);
	if (m) {
		const video_tag = `<iframe width="740" height="416" src="https://www.npr.org/embedded-video?storyId=${m[1]}&mediaId=${m[2]}&jwMediaType=music" frameborder="0" scrolling="no"></iframe>`;
		const nprVideo = $(".npr-video");
		if (nprVideo.length === 1) nprVideo.replaceWith(video_tag);
	}
	$("div.bucketwrap.internallink.insettwocolumn.inset2col").remove();
	$("aside.ad-wrap").remove();
	$(".enlarge_measure").remove();
	$(".enlarge_html").remove();
	$(".hide-caption").remove();
	$(".toggle-caption").remove();
	$(".credit-caption b.credit").remove();
	$(".credit-caption span.credit").wrap("<figcaption></figcaption>");
	$(".caption > p").wrap("<figcaption></figcaption>");
	return {
		article: audio + $(".storytext").toArray().map((el) => $(el).html()).join(""),
		categories
	};
});
const route = {
	path: "/:endpoint?",
	categories: ["traditional-media"],
	example: "/npr/1001",
	parameters: { endpoint: "Channel ID, can be found in Official RSS URL, `1001` by default" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["bennyyip"],
	handler,
	description: "Provide full article RSS for CBC topics."
};
async function handler(ctx) {
	const endpoint = ctx.req.param("endpoint") || "1001";
	const feed = await parser.parseURL(`https://feeds.npr.org/${endpoint}/rss.xml`);
	const items = (await Promise.all(feed.items.map(async (item) => {
		const itemDetails = await getArticleDetail(item.link);
		if (itemDetails === null) return null;
		return {
			...item,
			description: itemDetails.article,
			category: itemDetails.categories
		};
	}))).filter(Boolean);
	return {
		title: feed.title,
		link: feed.link,
		description: feed.description,
		icon: "https://media.npr.org/images/podcasts/primary/npr_generic_image_300.jpg?s=200",
		item: items
	};
}
//#endregion
export { route };
