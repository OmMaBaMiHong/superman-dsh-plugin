import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { load } from "cheerio";
//#region lib/routes/ups/track.ts
const route = {
	path: "/track/:trackingNumber",
	categories: ["other"],
	example: "/ups/track/1Z78R6790470567520",
	parameters: { trackingNumber: "The UPS tracking number (e.g., 1Z78R6790470567520)." },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Tracking",
	maintainers: ["Aquabet"],
	handler
};
async function handler(ctx) {
	const { trackingNumber } = ctx.req.param();
	const url = `https://www.ups.com/track?loc=en_US&tracknum=${trackingNumber}`;
	const context = await outPlaywright();
	const page = await context.newPage();
	await page.route("**/*", (route) => {
		if ([
			"image",
			"stylesheet",
			"font",
			"ping",
			"fetch"
		].includes(route.request().resourceType())) route.abort();
		else route.continue();
	});
	await page.goto(url, { waitUntil: "domcontentloaded" });
	const viewDetailsButton = "#st_App_View_Details";
	try {
		await page.waitForSelector(viewDetailsButton);
		await page.click(viewDetailsButton);
	} catch {
		return {
			title: `UPS Tracking - ${trackingNumber}`,
			link: url,
			item: []
		};
	}
	await page.waitForSelector("tr[id^=\"stApp_activitydetails_row\"]");
	const content = await page.content();
	await context.close();
	const $ = load(content);
	const items = $("tr[id^=\"stApp_activitydetails_row\"]").toArray().map((el, i) => {
		const dateTimeStr = ($(el).find(`#stApp_activitiesdateTime${i}`).text() || "Not Provided").trim().replace(/(\d+\/\d+\/\d{4})(\d+:\d+\s[AP]\.?M\.?)/, "$1 $2").replaceAll("P.M.", "PM").replaceAll("A.M.", "AM");
		const pubDate = parseDate(dateTimeStr);
		const lines = $(el).find(`#stApp_milestoneActivityLocation${i}`).text().trim().replaceAll(/\s*\n\s*/g, "\n").split("\n").map((l) => l.trim()).filter(Boolean);
		const status = lines[0];
		const location = lines.at(-1) || "";
		return {
			title: status,
			link: url,
			guid: `${trackingNumber}-${i}`,
			description: `
                Status: ${status} <br>
                Location: ${location} <br>
                Date and Time: ${dateTimeStr}
            `,
			pubDate
		};
	});
	return {
		title: `UPS Tracking - ${trackingNumber}`,
		link: url,
		item: items
	};
}
//#endregion
export { route };
