import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as config } from "./config-B5Cf_tHS.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/producthunt/today.tsx
const route = {
	path: "/today",
	categories: ["other"],
	example: "/producthunt/today",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["www.producthunt.com/"] }],
	name: "Top Products Launching Today",
	maintainers: ["miaoyafeng", "Fatpandac"],
	handler,
	url: "www.producthunt.com/"
};
async function handler() {
	const match = load(await rofetch("https://www.producthunt.com/", { headers: { "User-Agent": config.trueUA } }))("script:contains(\"ApolloSSRDataTransport\")").text().match(/"events":(\[.+\])\}\)/)?.[1]?.trim().replaceAll("undefined", "null");
	const list = JSON.parse(match).find((event) => event.type === "next" && event.value.data.homefeed).value.data.homefeed.edges.find((edge) => edge.node.id === "FEATURED-0").node.items.filter((i) => i.__typename === "Post").map((item) => ({
		title: item.name,
		link: `https://www.producthunt.com/products/${item.product.slug}`,
		postSlug: item.slug,
		description: item.tagline,
		pubDate: parseDate(item.createdAt),
		image: `https://ph-files.imgix.net/${item.thumbnailImageUuid}`,
		categories: item.topics.edges.map((topic) => topic.node.name)
	}));
	return {
		title: "Product Hunt Today Popular",
		link: "https://www.producthunt.com/",
		item: await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
			const post = (await rofetch("https://www.producthunt.com/frontend/graphql", {
				method: "POST",
				headers: { "User-Agent": config.trueUA },
				body: {
					operationName: "PostPage",
					variables: { slug: item.postSlug },
					extensions: { persistedQuery: {
						version: 1,
						sha256Hash: "488585149898ee974a51884b11e205c34ea8ad34ee01d47d7936a66a6db799ff"
					} }
				}
			})).data.post;
			item.author = post.user.name;
			item.description = renderDescription({
				tagline: post.tagline,
				description: post.description,
				media: post.media
			});
			return item;
		})))
	};
}
const renderDescription = ({ tagline, description, media }) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	tagline ? /* @__PURE__ */ jsx("blockquote", { children: tagline }) : null,
	description ? /* @__PURE__ */ jsx("div", { children: description }) : null,
	media?.map((item) => {
		if (item.mediaType === "image" && item.imageUuid) return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: `https://ph-files.imgix.net/${item.imageUuid}` }), /* @__PURE__ */ jsx("br", {})] });
		if (item.mediaType === "video" && item.metadata?.platform === "youtube" && item.metadata.videoId) return /* @__PURE__ */ jsx("iframe", {
			id: "ytplayer",
			type: "text/html",
			width: "640",
			height: "360",
			src: `https://www.youtube-nocookie.com/embed/${item.metadata.videoId}`,
			frameborder: "0",
			allowfullscreen: true,
			referrerpolicy: "strict-origin-when-cross-origin"
		});
		return null;
	})
] }));
//#endregion
export { route };
