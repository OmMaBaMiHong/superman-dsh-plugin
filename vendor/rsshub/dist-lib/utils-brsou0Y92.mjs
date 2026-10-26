import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/web/utils.ts
async function fetchItems(queryParam) {
	const res = await got_default("https://web.dev/_d/dynamic_content", {
		body: `[null,null,null, "${queryParam}",null,null,null,null,31,null,null,null,2]`,
		method: "post"
	});
	const data = JSON.parse(res.data.replace(/^[^[]*/, ""));
	return await Promise.all(data[0].map((item) => {
		const link = item[6];
		return cache_default.tryGet(link, async () => {
			const { data: articleHtml } = await got_default.get(link);
			const articleBody = load(articleHtml)(".devsite-article-body");
			articleBody.find(".wd-authors").remove();
			return {
				title: item[0],
				pubDate: /* @__PURE__ */ new Date(item[5][0] * 1e3),
				description: articleBody.html(),
				link
			};
		});
	}));
}
function hyphen2Pascal(value) {
	return value.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("");
}
//#endregion
export { hyphen2Pascal as n, fetchItems as t };
