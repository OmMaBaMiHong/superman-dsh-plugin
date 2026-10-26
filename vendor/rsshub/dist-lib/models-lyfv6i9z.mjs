import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { FetchError } from "ofetch";
import { load } from "cheerio";
import markdownit from "markdown-it";
//#region lib/routes/huggingface/models.ts
const md = markdownit({ html: true });
const route = {
	path: "/models/:group",
	categories: ["programming"],
	example: "/huggingface/models/deepseek-ai",
	parameters: { group: "The organization or user group name" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["huggingface.co/:group/models"],
		target: "/models/:group"
	}],
	name: "Group Models",
	maintainers: ["WuNein"],
	handler,
	url: "huggingface.co"
};
async function handler(ctx) {
	const { group, cycle = "date" } = ctx.req.param();
	if (![
		"date",
		"week",
		"month"
	].includes(cycle)) throw new Error(`Invalid cycle: ${cycle}`);
	const url = `https://huggingface.co/${group}/models?sort=created`;
	const { body: response } = await got_default(url);
	const $ = load(response);
	let items = $("article").toArray().map((article) => {
		const $article = $(article);
		const title = $article.find("a > div > header > h4").text().trim();
		const link = `https://huggingface.co/${title}`;
		const datetime = $article.find("a > div > div > span.truncate > time").attr("datetime");
		return {
			title,
			link,
			description: $article.text().replaceAll(/\s+/g, " ").trim(),
			pubDate: datetime ? parseDate(datetime) : void 0
		};
	}).filter((item) => item.title);
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		try {
			const { body: detailResp } = await got_default(item.link + "/raw/main/README.md");
			item.description += md.render(detailResp);
			const $Out = load(item.description);
			$Out("img").each((_, e) => {
				const $e = $Out(e);
				const src = $e.attr("src");
				if (!src) return;
				if (/^https?:\/\//i.test(src)) $e.attr("src", src);
				else if (src.startsWith("/")) $e.attr("src", `${item.link}/resolve/main/` + src);
				else {
					const baseUrl = item.link + "/resolve/main/";
					$e.attr("src", baseUrl + src.replace(/^\.\//, ""));
				}
			});
			item.description = $Out.html();
			return item;
		} catch (error) {
			if (error instanceof FetchError && (error.statusCode === 403 || error.statusCode === 401)) try {
				const { body: respHtml } = await got_default(item.link + "/blob/main/README.md?code=true");
				const detailHtml = load(respHtml)("body").find("div > main > div > section > div > div > div > div > div > table > tbody").text().trim();
				item.description += md.render(detailHtml);
				return item;
			} catch {
				return item;
			}
			return item;
		}
	})));
	return {
		title: `Huggingface ${group} Models`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
