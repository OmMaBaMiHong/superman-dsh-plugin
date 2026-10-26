import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
//#region lib/routes/tkww/index.ts
const route = {
	path: "/:column{.+}?",
	categories: ["traditional-media"],
	example: "/tkww/hong_kong",
	parameters: { column: "欄目，默認為 home (首頁)" },
	features: {
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "新聞",
	maintainers: ["quiniapiezoelectricity"],
	radar: [{
		source: ["www.tkww.hk/:column"],
		target: "/:column"
	}],
	handler,
	description: `::: tip
欄目可用\`名稱\`或對應網頁的\`path\`，
如 \`https://www.tkww.hk/hong_kong\` 的欄目可以填\`香港\`或是\`hong_kong\`
而 \`https://www.tkww.hk/china/shanghai\` 的欄目則需填\`china/shanghai\`
:::`
};
async function handler(ctx) {
	const column = ctx.req.param("column") ?? "home";
	const columns = await cache_default.tryGet("https://www.tkww.hk/columns.json", async () => await got_default("https://www.tkww.hk/columns.json"), config.cache.routeExpire, false);
	let metadata;
	let scope = columns.data.data;
	for (const segment of column.split("/")) {
		if (typeof segment !== "string") continue;
		metadata = scope.find((item) => item.name === segment || item.dirname === segment);
		scope = metadata?.children ?? [];
	}
	if (metadata === void 0) throw new InvalidParameterError(`Invalid Column: ${column}`);
	const stories = await got_default(`https://www.tkww.hk/columns/${metadata.uuid}/tkww/app/stories.json`);
	const items = await Promise.all(stories.data.data.stories.map((item) => cache_default.tryGet(item.url, async () => {
		item.link = item.url;
		item.description = item.summary;
		item.pubDate = item.publishTime;
		item.category = [];
		if (item.keywords) item.category = [...item.category, ...item.keywords];
		if (item.tags) item.category = [...item.category, ...item.tags];
		item.category = [...new Set(item.category)];
		item.description = (await got_default(item.jsonUrl)).data.data.content;
		return item;
	})));
	return {
		title: metadata.seoTitle,
		description: metadata.seoDescription,
		link: metadata.url,
		item: items
	};
}
//#endregion
export { route };
