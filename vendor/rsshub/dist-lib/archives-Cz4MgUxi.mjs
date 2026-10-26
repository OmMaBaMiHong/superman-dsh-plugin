import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/aiblog-2xv/archives.ts
const route = {
	path: "/archives",
	categories: ["blog"],
	example: "/aiblog-2xv/archives",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["aiblog-2xv.pages.dev/archives"],
		target: "/archives"
	}],
	name: "归档-全部文章",
	maintainers: ["Liao-Ke"],
	handler
};
async function handler() {
	const baseUrl = "https://aiblog-2xv.pages.dev";
	const $ = load(await rofetch(`${baseUrl}/archives`));
	const list = $("#top > main > div > div.archive-month").toArray().flatMap((monthItem) => $(monthItem).find(".archive-posts .archive-entry").toArray().map((postItem) => {
		const $post = $(postItem);
		const $link = $post.find("a").first();
		const $title = $post.find("h3").first();
		const $dateMeta = $post.find(".archive-meta span");
		return {
			title: $title.text().trim(),
			link: $link.attr("href") || "",
			pubDate: parseDate($dateMeta.eq(0).attr("title") || ""),
			author: $post.find(".archive-meta span").last().text().trim() || "",
			description: ""
		};
	}));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const $main = load(await rofetch(item.link))("main").first();
		item.description = `<article>
                    <header>
                        <div class="post-description">
                        ${$main.find("header .post-description").first().html()}
                        </div>
                    </header>

                    <figure class="entry-cover">
                        ${$main.find("figure").first().html()}
                    </figure>
                    
                    <div class="post-content">
                        ${$main.find(".post-content").first().html()}
                    </div>
                    </article>`;
		return item;
	})));
	return {
		title: "归档-全部文章 | AI Blog",
		link: `${baseUrl}/archives`,
		item: items.filter((item) => item.title && item.link)
	};
}
//#endregion
export { route };
