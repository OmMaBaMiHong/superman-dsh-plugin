import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import * as cheerio from "cheerio";
//#region lib/routes/sega/pjsekai.ts
const route = {
	path: "/pjsekai/news",
	categories: ["game"],
	example: "/sega/pjsekai/news",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["pjsekai.sega.jp/news/index.html"] }],
	name: "世界计划 多彩舞台 ｜ ProjectSekai ｜ プロセカ",
	maintainers: ["15x15G"],
	handler,
	url: "pjsekai.sega.jp/news/index.html"
};
async function handler() {
	const posts = (await got_default.get("https://cdn.jsdelivr.net/gh/Sekai-World/sekai-master-db-diff@master/userInformations.json")).data || [];
	return {
		title: "Project Sekai - News",
		link: "https://pjsekai.sega.jp/",
		description: "プロジェクトセカイ カラフルステージ！ feat.初音ミク",
		item: await Promise.all(posts.map(async (post) => {
			let link;
			let description;
			const guid = post.displayOrder.toString() + post.id.toString();
			if (post.path.startsWith("information/")) {
				const path = post.path.replace(/information\/index.html\?id=/, "");
				link = `https://production-web.sekai.colorfulpalette.org/${post.path}`;
				try {
					description = await cache_default.tryGet(guid, async () => {
						const result = await got_default.get(`https://production-web.sekai.colorfulpalette.org/html/${path}.html`);
						return cheerio.load(result.data).html();
					});
				} catch {
					description = link;
				}
			} else {
				link = post.path;
				description = post.title;
			}
			return {
				title: post.title,
				link,
				pubDate: timezone(new Date(post.startAt), 8),
				description,
				category: post.informationTag,
				guid
			};
		}))
	};
}
//#endregion
export { route };
