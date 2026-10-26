import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { t as renderDescription } from "./description-BP-TG2x9.mjs";
import { load } from "cheerio";
//#region lib/routes/itch/devlog.ts
const route = {
	path: "/devlog/:user/:id",
	categories: ["game"],
	example: "/itch/devlog/teamterrible/the-baby-in-yellow",
	parameters: {
		user: "User id, can be found in URL",
		id: "Item id, can be found in URL"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Developer Logs",
	maintainers: ["nczitzk"],
	handler,
	description: `\`User id\` is the field before \`.itch.io\` in the URL of the corresponding page, e.g. the URL of [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is \`https://teamterrible.itch.io/the-baby-in-yellow/devlog\`, where the field before \`.itch.io\` is \`teamterrible\`.

\`Item id\` is the field between \`itch.io\` and \`/devlog\` in the URL of the corresponding page, e.g. the URL for [The Baby In Yellow Devlog](https://teamterrible.itch.io/the-baby-in-yellow/devlog) is \`https://teamterrible.itch.io/the-baby-in-yellow/devlog\`, where the field between \`itch.io\` and \`/devlog\` is \`the-baby-in-yellow\`.

So the route is [\`/itch/devlogs/teamterrible/the-baby-in-yellow\`](https://rsshub.app/itch/devlogs/teamterrible/the-baby-in-yellow).`
};
async function handler(ctx) {
	const user = ctx.req.param("user") ?? "";
	const id = ctx.req.param("id") ?? "";
	const limit = Number.parseInt(ctx.req.query("limit")) || 20;
	if (!isValidHost(user)) throw new InvalidParameterError("Invalid user");
	const rootUrl = `https://${user}.itch.io/${id}/devlog`;
	const $ = load((await got_default({
		method: "get",
		url: rootUrl
	})).data);
	let items = $(".title").toArray().slice(0, limit).map((item) => {
		item = $(item);
		return {
			title: item.text(),
			link: item.attr("href"),
			pubDate: timezone(parseDate(item.text()), 8)
		};
	});
	items = await Promise.all(items.map((item) => cache_default.tryGet(item.link, async () => {
		const content = load((await got_default({
			method: "get",
			url: item.link
		})).data);
		const infoJson = content("script[type=\"application/ld+json\"]:contains(\"@type\":\"BlogPosting\")");
		const info = JSON.parse(content(infoJson).text());
		item.author = info.author.name;
		item.pubDate = info.datePublished;
		item.description = renderDescription({
			images: content(".post_image").toArray().map((e) => content(e).attr("src")),
			description: content(".post_body").html()
		});
		return item;
	})));
	return {
		title: $("title").text(),
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
