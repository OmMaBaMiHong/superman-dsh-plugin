import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
//#region lib/routes/fortnite/news.ts
const route = {
	path: "/news/:options?",
	categories: ["game"],
	example: "/fortnite/news",
	parameters: { options: "Params" },
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "News",
	maintainers: ["lyqluis"],
	handler,
	description: `- \`options.lang\`, optional, language, eg. \`/fortnite/news/lang=en-US\`, common languages are listed below, more languages are available one the [official website](https://www.fortnite.com/news)

| English (default) | Spanish | Japanese | French | Korean | Polish |
| ----------------- | ------- | -------- | ------ | ------ | ------ |
| en-US             | es-ES   | ja       | fr     | ko     | pl     |`
};
async function handler(ctx) {
	const options = ctx.req.param("options")?.split("&").map((op) => op.split("="));
	const rootUrl = "https://www.fortnite.com";
	const path = "news";
	const language = options?.find((op) => op[0] === "lang")[1] ?? "en-US";
	const link = `${rootUrl}/${path}?lang=${language}`;
	const apiUrl = `https://www.fortnite.com/api/blog/getPosts?category=&postsPerPage=0&offset=0&locale=${language}&rootPageSlug=blog`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		route.request().resourceType() === "document" ? route.continue() : route.abort();
	});
	logger.http(`Requesting ${apiUrl}`);
	let data;
	try {
		const response = await page.goto(apiUrl, { waitUntil: "networkidle" });
		if (!response) throw new Error(`No response received from ${apiUrl}`);
		if (!response.ok()) {
			const statusText = response.statusText();
			const statusMessage = [response.status(), statusText].filter(Boolean).join(" ");
			throw new Error(`Fortnite API responded with ${statusMessage} for ${apiUrl}`);
		}
		const contentType = response.headers()["content-type"];
		if (!contentType?.includes("application/json")) throw new Error(`Fortnite API returned non-JSON response with content-type ${contentType ?? "unknown"}`);
		data = await response.json();
	} finally {
		await page.close();
		await context.close();
	}
	const { blogList: list } = data;
	return {
		title: "Fortnite News",
		link,
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, () => ({
			title: item.title,
			link: `${rootUrl}/${path}/${item.slug}?lang=${language}`,
			pubDate: parseDate(item.date),
			author: item.author,
			description: item.content
		}))))
	};
}
//#endregion
export { route };
