import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { load } from "cheerio";
//#region lib/routes/mrinalxdev/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/mrinalxdev/blog",
	url: "mrinalxdev.github.io/mrinalxblogs/blogs/blog.html",
	name: "Blog",
	maintainers: ["jack-110"],
	radar: [{
		source: ["mrinalxdev.github.io/mrinalxblogs/blogs/blog.html", "mrinalxdev.github.io/mrinalxblogs/"],
		target: "/blog"
	}],
	handler
};
async function handler() {
	const blogListUrl = `https://mrinalxdev.github.io/mrinalxblogs/blogs/blog.html`;
	const $ = load(await rofetch(blogListUrl));
	const list = $(".list-none a").toArray().filter((el) => {
		const href = $(el).attr("href") || "";
		return href.includes("/blogs/") && !href.includes("blog.html");
	}).map((el) => {
		const $el = $(el);
		const href = $el.attr("href") || "";
		const text = $el.text().trim();
		const dateMatch = text.match(/^(\d{1,2}(?:st|nd|rd|th)\s+\w+,\s+\d{4})\s+(\S.*)$/);
		let date;
		let title;
		if (dateMatch) {
			date = dateMatch[1];
			title = dateMatch[2];
		} else title = text;
		let link;
		if (href.startsWith("http")) link = href;
		else if (href.startsWith("/blogs/")) link = `https://mrinalxdev.github.io/mrinalxblogs${href}`;
		else link = new URL(href, blogListUrl).href;
		return {
			title,
			link,
			date
		};
	});
	return {
		title: "Mrinal's Blog",
		link: blogListUrl,
		description: "Technical blog by Mrinal covering Redis, Distributed Systems, Algorithms, and more.",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const $ = load(await rofetch(item.link));
			$("nav").remove();
			$("footer").remove();
			$("a[href*=\"buymeacoffee\"]").parent().remove();
			const content = $("body").html() || "";
			const dataItem = {
				title: item.title,
				link: item.link,
				description: content,
				author: "Mrinal"
			};
			if (item.date) dataItem.pubDate = parseDate(item.date, "Do MMMM, YYYY");
			return dataItem;
		})))
	};
}
//#endregion
export { route };
