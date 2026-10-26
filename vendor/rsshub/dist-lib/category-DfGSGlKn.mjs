import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./description-Cb-UFpEy.mjs";
import { load } from "cheerio";
//#region lib/routes/vimeo/category.ts
const route = {
	path: "/category/:category/:staffpicks?",
	categories: ["social-media"],
	view: 3,
	example: "/vimeo/category/documentary/staffpicks",
	parameters: {
		category: "Category name can get from url like `documentary` in [https://vimeo.com/categories/documentary/videos](https://vimeo.com/categories/documentary/videos) ",
		staffpicks: "type `staffpicks` to sort with staffpicks"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Category",
	maintainers: ["MisteryMonster"],
	handler
};
async function handler(ctx) {
	const { category, staffpicks } = ctx.req.param();
	const categoryparams = category;
	let sortparams = "&direction=desc&sort=date";
	let feedtitle = category;
	if (staffpicks && staffpicks !== "staffpicks") return;
	if (staffpicks) {
		sortparams += "&filter=conditional_featured";
		feedtitle += `: ${category} staffpicks`;
	}
	const url = `https://api.vimeo.com/categories/${categoryparams}/videos?page=1&per_page=18${sortparams}`;
	const VimeoAuthorization = (await got_default({
		method: "get",
		url: "https://vimeo.com/_rv/viewer"
	})).data.jwt;
	const vimeojs = (await got_default({
		method: "get",
		url,
		headers: { Authorization: `jwt ${VimeoAuthorization}` }
	})).data.data;
	const feedlink = `https://vimeo.com/categories/${category}/videos/sort:latest`;
	const feedlinkstaffpicks = "?staffpicked=true";
	const feedDescription = await cache_default.tryGet(feedlink + (staffpicks ? feedlinkstaffpicks : ""), async () => {
		return load((await got_default({ url: feedlink + (staffpicks ? feedlinkstaffpicks : "") })).data)("meta[name=\"description\"]").attr("content");
	});
	return {
		title: `${feedtitle} | Vimeo category`,
		link: feedlink + (staffpicks ? feedlinkstaffpicks : ""),
		description: feedDescription,
		item: vimeojs.map((item) => ({
			title: item.name,
			description: renderDescription({
				videoUrl: item.uri.replace("/videos", ""),
				vdescription: item.description || ""
			}),
			pubDate: parseDate(item.created_time),
			link: item.link,
			author: item.user.name
		}))
	};
}
//#endregion
export { route };
