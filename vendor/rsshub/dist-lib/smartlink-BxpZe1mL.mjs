import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { i as toTitleCase } from "./common-utils-xJr7JYuG.mjs";
//#region lib/routes/smartlink/index.ts
function parseTitle(smartlinkUrl) {
	try {
		const pathSegments = new URL(smartlinkUrl).pathname.split("/").filter((segment) => segment.length > 0);
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		const dateIndex = pathSegments.findIndex((segment) => dateRegex.test(segment));
		let titleSlug = dateIndex !== -1 && dateIndex < pathSegments.length - 1 ? pathSegments[dateIndex + 1] : pathSegments.at(-1) || "";
		titleSlug = titleSlug.replace(/\.(html?)$/i, "");
		return toTitleCase(titleSlug.replaceAll("-", " "));
	} catch {
		return smartlinkUrl.split("?", 1)[0];
	}
}
function isYouTubeUrl(url) {
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		return [
			"youtube.com",
			"www.youtube.com",
			"m.youtube.com",
			"youtu.be"
		].includes(hostname);
	} catch {
		return false;
	}
}
function getTitle(item) {
	return isYouTubeUrl(item.smartlink) ? item.smartlink.split("?", 1)[0] : parseTitle(item.smartlink);
}
const route = {
	path: "/:site",
	categories: ["social-media"],
	example: "/smartlink/bloombergpursuits",
	parameters: { site: "the site attached to smartlink.bio/" },
	radar: [{ source: ["smartlink.bio/"] }],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Posts",
	maintainers: ["nickyfoto"],
	handler,
	description: "smartlink.bio link in bio takes your audience from Instagram and TikTok to your website in one easy step."
};
async function handler(ctx) {
	const site = ctx.req.param("site");
	const items = (await rofetch(`https://smartlink.bio/api/instagram/${site}/posts`)).map((item) => ({
		title: getTitle(item),
		link: item.smartlink.split("?", 1)[0],
		description: `<p><img src="${item.imageUrl}"></p>`,
		pubDate: item.created,
		guid: item.id
	}));
	return {
		title: `@${site} SmartLink`,
		link: `https://smartlink.bio/${site}`,
		item: items
	};
}
//#endregion
export { route };
