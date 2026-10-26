import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/github/topic.ts
const route = {
	path: "/topics/:name/:qs?",
	categories: ["programming"],
	example: "/github/topics/framework",
	parameters: {
		name: "Topic name, which can be found in the URL of the corresponding [Topics Page](https://github.com/topics/framework)",
		qs: "Query string, like `l=php&o=desc&s=stars`. Details listed as follows:"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["github.com/topics"] }],
	name: "Topics",
	maintainers: ["queensferryme"],
	handler,
	url: "github.com/topics",
	description: `| Parameter | Description      | Values                                                                                                                          |
| --------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| \`l\`       | Language         | For instance \`php\`, which can be found in the URL of the corresponding [Topics page](https://github.com/topics/framework?l=php) |
| \`o\`       | Sorting Order    | \`asc\`, \`desc\`                                                                                                                   |
| \`s\`       | Sorting Criteria | \`stars\`, \`forks\`, \`updated\`                                                                                                     |

For instance, the \`/github/topics/framework/l=php&o=desc&s=stars\` route will generate the RSS feed corresponding to this [page](https://github.com/topics/framework?l=php\\&o=desc\\&s=stars).`
};
async function handler(ctx) {
	const { data, url } = await got_default(`https://github.com/topics/${ctx.req.param("name")}`, { searchParams: new URLSearchParams(ctx.req.param("qs")) });
	const $ = load(data);
	return {
		title: $("title").text(),
		description: $(".markdown-body").text().trim(),
		link: url,
		item: $("article.border").toArray().map((item) => {
			item = $(item);
			const title = item.find("h3").text().trim();
			return {
				title,
				author: title.split("/", 1)[0],
				description: (item.find("a img").prop("outerHTML") ?? "") + item.find("div > div > p").text(),
				link: `https://github.com${item.find("h3 a").last().attr("href")}`,
				category: item.find(".topic-tag").toArray().map((item) => $(item).text().trim()),
				pubDate: parseDate(item.find("relative-time").attr("datetime"))
			};
		})
	};
}
//#endregion
export { route };
