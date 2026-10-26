import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as baseURL } from "./const-v4T9voj7.mjs";
import { load } from "cheerio";
//#region lib/routes/shopify/apps/[handle].reviews.ts
const route = {
	path: "/apps/:handle/reviews/:page?",
	example: "/shopify/apps/flow/reviews",
	parameters: { handle: "例如一个 App 的链接 https://apps.shopify.com/flow，其中 flow 就是指的是 handle" },
	name: "App reviews",
	maintainers: ["PrintNow"],
	handler,
	radar: [{ source: ["apps.shopify.com/:handle"] }]
};
async function handler(ctx) {
	const { handle = "", page = "1" } = ctx.req.param();
	const htmlContent = (await got_default.get(`${baseURL}/${handle}/reviews`, {
		searchParams: {
			sort_by: "newest",
			page
		},
		headers: {
			accept: "text/html, application/xhtml+xml",
			"accept-language": "en-US;q=0.9",
			referer: baseURL,
			dnt: "1"
		}
	})).data;
	const $ = load(htmlContent);
	const items = $("div[data-merchant-review]").toArray().map((item) => {
		const $item = $(item);
		const reviewID = $item.attr("data-review-content-id");
		const $review1 = $item.find("div:nth-child(1)");
		const $review2 = $item.find("div:nth-child(2)");
		const description = $item.find("div[data-truncate-review] div[data-truncate-content-copy] p").html() || "";
		const author = $review2.find("div.tw-text-fg-primary").text().trim();
		return {
			guid: reviewID,
			title: description,
			author,
			pubDate: new Date($review1.find("div[aria-label] + div").text().trim()),
			description,
			_extra: {
				ratting_value: Number($review1.find("div[role=\"img\"]").attr("aria-label")?.slice(0, 1)),
				location: $review2.find("div.tw-text-fg-primary + div").text().trim(),
				author
			}
		};
	});
	return {
		title: `Reviews handle:${handle} page:${page} – Shopify App Store`,
		link: `${baseURL}/${handle}/reviews`,
		allowEmpty: true,
		language: "en-us",
		item: items
	};
}
//#endregion
export { route };
