import { t as logger } from "./logger-BS24s3sd.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { o as parseCompanyName, s as parseCompanyPosts, t as BASE_URL } from "./utils-DculJRba.mjs";
import { load } from "cheerio";
//#region lib/routes/linkedin/posts.ts
const route = {
	path: "/company/:company_id/posts",
	categories: ["social-media"],
	example: "/linkedin/company/google/posts",
	parameters: { company_id: "Company's LinkedIn profile ID" },
	description: "Get company's LinkedIn posts by company ID",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: false,
		supportRadar: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Company Posts",
	maintainers: ["saifazmi"],
	handler: async (ctx) => {
		const company_id = ctx.req.param("company_id");
		const context = await outPlaywright();
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			route.request().resourceType() === "document" ? route.continue() : route.abort();
		});
		const url = new URL(`${BASE_URL}/company/${company_id}`);
		logger.http(`Requesting ${url.href}`);
		await page.goto(url.href, { waitUntil: "domcontentloaded" });
		const response = await page.content();
		await page.close();
		const $ = load(response);
		const companyName = parseCompanyName($);
		const posts = parseCompanyPosts($);
		await context.close();
		return {
			title: `LinkedIn - ${companyName}'s Posts`,
			link: url.href,
			description: `This feed gets ${companyName}'s posts from LinkedIn`,
			item: posts.map((post) => ({
				title: post.text,
				description: post.text,
				link: post.link,
				pubDate: post.date,
				updated: post.date
			}))
		};
	}
};
//#endregion
export { route };
