import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as renderDescription } from "./post-CQqLdqbm.mjs";
//#region lib/routes/vcb-s/index.ts
const rootUrl = "https://vcb-s.com";
const postsAPIUrl = `${rootUrl}/wp-json/wp/v2/posts`;
const route = {
	path: "/",
	radar: [{
		source: ["vcb-s.com/"],
		target: ""
	}],
	name: "Unknown",
	maintainers: ["cxfksword"],
	handler,
	url: "vcb-s.com/"
};
async function handler(ctx) {
	const limit = ctx.req.query("limit") ?? 7;
	const url = `${postsAPIUrl}?per_page=${limit}&_embed`;
	const response = await got_default.get(url);
	if (typeof response.data === "string") response.data = JSON.parse(response.body.trim());
	const items = response.data.map((item) => {
		const description = renderDescription({
			post: item.content.rendered.replaceAll(/<pre class="js-medie-info-detail[^>]*>(.*?)<\/pre>/gs, "<pre><code>$1</code></pre>").replaceAll(/<div.+?dw-box-download[^>]+>(.*?)<\/div>/gs, "<pre>$1</pre>"),
			medias: item._embedded["wp:featuredmedia"]
		});
		return {
			title: item.title.rendered,
			link: item.link,
			description,
			pubDate: parseDate(item.date_gmt),
			author: item._embedded.author[0].name
		};
	});
	return {
		title: "VCB-Studio - 大家一起实现的故事！",
		link: rootUrl,
		item: items
	};
}
//#endregion
export { route };
