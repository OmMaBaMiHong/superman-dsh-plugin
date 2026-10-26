import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/deltaio/blog.ts
const route = {
	path: "/blog",
	categories: ["blog"],
	example: "/deltaio/blog",
	parameters: {},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["delta.io/blog"] }],
	name: "Blogs",
	maintainers: ["RengarLee"],
	handler,
	url: "delta.io/blog"
};
async function handler() {
	const baseUrl = "https://delta.io";
	const dataUrl = `${baseUrl}/page-data/blog/page-data.json`;
	const items = (await cache_default.tryGet(dataUrl, async () => {
		const { data } = await got_default(dataUrl);
		return data;
	}, config.cache.routeExpire, false)).result.data.allMdx.edges.map(({ node }) => ({
		title: node.frontmatter.title,
		description: node.frontmatter.description,
		author: node.frontmatter.author,
		pubDate: parseDate(node.frontmatter.date),
		link: `${baseUrl}${node.fields.slug}`,
		itunes_item_image: `${baseUrl}${node.frontmatter.thumbnail.childImageSharp.gatsbyImageData.images.fallback.src}`
	}));
	return {
		title: "delta.io blog",
		link: `${baseUrl}/blog`,
		item: items
	};
}
//#endregion
export { route };
