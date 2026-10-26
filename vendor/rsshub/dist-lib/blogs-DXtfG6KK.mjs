import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { t as baseUrl } from "./utils-BRhLlhu12.mjs";
import { load } from "cheerio";
//#region lib/routes/science/blogs.ts
const route = {
	path: "/blogs/:name?",
	categories: ["journal"],
	example: "/science/blogs/pipeline",
	parameters: { name: "Short name for the blog, get this from the url. Defaults to pipeline" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{
		source: ["science.org/blogs/:name"],
		target: "/blogs/:name"
	}],
	name: "Blogs",
	maintainers: ["TomHodson"],
	handler,
	description: `To subscribe to [IN THE PIPELINE by Derek Lowe’s](https://science.org/blogs/pipeline) or the [science editor's blog](https://science.org/blogs/editors-blog), use the name parameter \`pipeline\` or \`editors-blog\`.`
};
async function handler(ctx) {
	const { name = "pipeline" } = ctx.req.param();
	const link = `${baseUrl}/blogs/${name}/feed`;
	const $ = load(await cache_default.tryGet(link, async () => {
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		await page.goto(link, { waitUntil: "domcontentloaded" });
		const response = await page.content();
		await page.close();
		await context.close();
		return response;
	}, config.cache.routeExpire, false), { xmlMode: true });
	const items = $("item").toArray().map((item) => {
		item = $(item);
		return {
			title: item.find("title").text().trim(),
			link: item.find("link").text().trim(),
			author: item.find(String.raw`dc\:creator`).text().trim(),
			pubDate: parseDate(item.find("pubDate").text().trim()),
			description: item.find(String.raw`content\:encoded`).text().trim()
		};
	});
	const { blog_name = "Unknown Title" } = $("channel > description").text().match(/Keyword search result for Blog Series: (?<blog_name>[^-]+) --/).groups;
	return {
		title: `Science Blogs: ${blog_name}`,
		description: `A Science.org blog called ${blog_name}`,
		image: `${baseUrl}/apple-touch-icon.png`,
		link: `${baseUrl}/blogs/${name}`,
		language: "en-US",
		item: items
	};
}
//#endregion
export { route };
