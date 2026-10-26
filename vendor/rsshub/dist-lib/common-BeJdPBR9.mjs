import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/reuters/common.tsx
const renderDescription = ({ result }) => {
	const contentElements = result.content_elements ?? [];
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		result.summary ? /* @__PURE__ */ jsxs(Fragment, { children: ["Summary:", /* @__PURE__ */ jsx("ul", { children: result.summary.map((summary, index) => /* @__PURE__ */ jsx("li", { children: summary.description }, `${summary.description ?? "summary"}-${index}`)) })] }) : null,
		result.related_content ? /* @__PURE__ */ jsxs(Fragment, { children: [
			result.related_content.galleries?.flatMap((gallery, galleryIndex) => (gallery.content_elements ?? []).map((element, elementIndex) => element.type === "image" ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: element.renditions?.original?.["1920w"],
				alt: element.alt_text
			}), /* @__PURE__ */ jsx("figcaption", { children: element.caption })] }, `gallery-${galleryIndex}-image-${elementIndex}`) : null)),
			result.related_content.images?.map((image, index) => image.type === "image" ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("img", {
				src: image.renditions?.original?.["1920w"],
				alt: image.alt_text
			}), /* @__PURE__ */ jsx("figcaption", { children: image.caption })] }, `image-${index}`) : null),
			result.related_content.galleries?.flatMap((gallery, galleryIndex) => (gallery.content_elements ?? []).map((element, elementIndex) => element.type === "video" ? /* @__PURE__ */ jsxs("figure", { children: [/* @__PURE__ */ jsx("video", {
				controls: true,
				poster: element.thumbnail?.url,
				children: /* @__PURE__ */ jsx("source", {
					src: element.source?.mp4,
					type: "video/mp4"
				})
			}), element.description] }, `gallery-${galleryIndex}-video-${elementIndex}`) : null))
		] }) : null,
		contentElements.map((element, index) => {
			if (element.type === "paragraph") return /* @__PURE__ */ jsx("p", { children: element.content ? raw(element.content) : null }, `paragraph-${index}`);
			if (element.type === "header") return /* @__PURE__ */ jsx(`h${element.level ?? 1}`, { children: element.content ? raw(element.content) : null }, `header-${index}`);
			return null;
		}),
		result.sign_off ? /* @__PURE__ */ jsx("span", { children: result.sign_off }) : null
	] }));
};
const route = {
	path: "/:category/:topic?",
	categories: ["traditional-media"],
	view: 0,
	example: "/reuters/world/us",
	parameters: {
		category: {
			description: "find it in the URL, or tables below",
			options: [
				{
					value: "world",
					label: "World"
				},
				{
					value: "business",
					label: "Business"
				},
				{
					value: "legal",
					label: "Legal"
				},
				{
					value: "markets",
					label: "Markets"
				},
				{
					value: "breakingviews",
					label: "Breakingviews"
				},
				{
					value: "technology",
					label: "Technology"
				},
				{
					value: "graphics",
					label: "Graphics"
				},
				{
					value: "authors",
					label: "Authors"
				}
			],
			default: "world"
		},
		topic: "find it in the URL, or tables below, leave empty for `All`"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["reuters.com/:category/:topic?", "reuters.com/"] }],
	name: "Category/Topic/Author",
	maintainers: [
		"LyleLee",
		"HenryQW",
		"proletarius101",
		"black-desk",
		"nczitzk",
		"pseudoyu"
	],
	handler,
	description: `- \`:category\`:

  | World | Business | Legal | Markets | Breakingviews | Technology | Graphics |
  | ----- | -------- | ----- | ------- | ------------- | ---------- | -------- |
  | world | business | legal | markets | breakingviews | technology | graphics |

- \`world/:topic\`:

  | All | Africa | Americas | Asia Pacific | China | Europe | India | Middle East | United Kingdom | United States | The Great Reboot | Reuters Next |
  | --- | ------ | -------- | ------------ | ----- | ------ | ----- | ----------- | -------------- | ------------- | ---------------- | ------------ |
  |     | africa | americas | asia-pacific | china | europe | india | middle-east | uk             | us            | the-great-reboot | reuters-next |

- \`business/:topic\`:

  | All | Aerospace & Defense | Autos & Transportation | Energy | Environment | Finance | Healthcare & Pharmaceuticals | Media & Telecom | Retail & Consumer | Sustainable Business | Charged | Future of Health | Future of Money | Take Five | Reuters Impact |
  | --- | ------------------- | ---------------------- | ------ | ----------- | ------- | ---------------------------- | --------------- | ----------------- | -------------------- | ------- | ---------------- | --------------- | --------- | -------------- |
  |     | aerospace-defense   | autos-transportation   | energy | environment | finance | healthcare-pharmaceuticals   | media-telecom   | retail-consumer   | sustainable-business | charged | future-of-health | future-of-money | take-five | reuters-impact |

- \`legal/:topic\`:

  | All | Government | Legal Industry | Litigation | Transactional |
  | --- | ---------- | -------------- | ---------- | ------------- |
  |     | government | legalindustry  | litigation | transactional |

- \`authors/:topic\`:

  | Default | Jonathan Landay | any other authors |
  | ------- | --------------- | ----------------- |
  | reuters | jonathan-landay | their name in URL |

More could be found in the URL of the category/topic page.`
};
async function handler(ctx) {
	const MUST_FETCH_BY_TOPICS = /* @__PURE__ */ new Set(["authors", "tags"]);
	const CAN_USE_SOPHI = ["world"];
	const category = ctx.req.param("category");
	const topic = ctx.req.param("topic") ?? (category === "authors" ? "reuters" : "");
	const limit = ctx.req.query("limit") ? Number.parseInt(ctx.req.query("limit")) : 20;
	const useSophi = ctx.req.query("sophi") === "true" && topic !== "" && CAN_USE_SOPHI.includes(category);
	const section_id = `/${category}/${topic ? `${topic}/` : ""}`;
	const browserHeaders = {
		Accept: "application/json, text/plain, */*",
		"Accept-Language": "en-US,en;q=0.9",
		Referer: "https://www.reuters.com/"
	};
	try {
		const { title, description, rootUrl, response } = await (async () => {
			if (MUST_FETCH_BY_TOPICS.has(category)) {
				const rootUrl = "https://www.reuters.com/pf/api/v3/content/fetch/articles-by-topic-v1";
				const response = await rofetch(rootUrl, {
					query: { query: JSON.stringify({
						offset: 0,
						size: limit,
						topic_url: section_id,
						website: "reuters"
					}) },
					headers: browserHeaders
				});
				return {
					title: `${response.result.topics[0].name} | Reuters`,
					description: response.result.topics[0].entity_id,
					rootUrl,
					response
				};
			}
			const rootUrl = "https://www.reuters.com/pf/api/v3/content/fetch/articles-by-section-alias-or-id-v1";
			const response = await rofetch(rootUrl, {
				query: { query: JSON.stringify({
					offset: 0,
					size: limit,
					section_id,
					website: "reuters",
					...useSophi && {
						fetch_type: "sophi",
						sophi_page: "*",
						sophi_widget: "topic"
					}
				}) },
				headers: browserHeaders
			});
			return {
				title: response.result.section.title,
				description: response.result.section.section_about,
				rootUrl,
				response
			};
		})();
		let items = response.result.articles.map((e) => ({
			title: e.title,
			link: new URL(e.canonical_url, rootUrl).href,
			guid: e.id,
			pubDate: parseDate(e.published_time),
			updated: parseDate(e.updated_time),
			author: e.authors?.map((e) => e.name).join(", "),
			category: e.kicker.names,
			description: e.description
		}));
		items = items.filter((e, i) => items.findIndex((f) => e.guid === f.guid) === i);
		items = (await Promise.allSettled(items.map((item) => ctx.req.query("fulltext") === "true" ? cache_default.tryGet(item.link, async () => {
			const detailResponse = await rofetch(item.link, { headers: browserHeaders });
			const content = load(detailResponse.data);
			if (detailResponse.url.startsWith("https://www.reuters.com/investigates/")) {
				const ldJson = JSON.parse(content("script[type=\"application/ld+json\"]").text());
				content(".special-report-article-container .container, #slide-dek, #slide-end, .share-in-article-container").remove();
				item.title = ldJson.headline;
				item.pubDate = parseDate(ldJson.dateCreated);
				item.author = ldJson.creator;
				item.category = ldJson.keywords;
				item.description = content(".special-report-article-container").html();
				return item;
			}
			const matches = content("script#fusion-metadata").text().match(/Fusion.globalContent=(\{[\s\S]*?\});/);
			if (matches) {
				const data = JSON.parse(matches[1]);
				item.title = data.result.title || item.title;
				item.description = renderDescription({ result: data.result });
				item.pubDate = parseDate(data.result.display_time);
				item.author = data.result.authors.map((author) => author.name).join(", ");
				item.category = data.result.taxonomy.keywords;
				return item;
			}
			content(".title").remove();
			content(".article-metadata").remove();
			item.title = content("meta[property=\"og:title\"]").attr("content");
			item.pubDate = parseDate(detailResponse.data.match(/"datePublished":"(.*?)","dateModified/)[1]);
			item.author = detailResponse.data.match(/\{"@type":"Person","name":"(.*?)"\}/g).map((p) => p.match(/"name":"(.*?)"/)[1]).join(", ");
			item.description = content("article").html();
			return item;
		}) : item))).filter((r) => r.status === "fulfilled").map((r) => r.value);
		return {
			title,
			description,
			image: "https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png?d=116",
			link: `https://www.reuters.com${section_id}`,
			item: items
		};
	} catch (error) {
		if (error?.name !== "FetchError") throw error;
		const arcResponse = await rofetch(topic ? `https://www.reuters.com/arc/outboundfeeds/v4/mobile/section${section_id}?outputType=json` : `https://www.reuters.com/arc/outboundfeeds/v4/mobile/section/${category}/?outputType=json`, { headers: browserHeaders });
		if (arcResponse.wireitems?.length) {
			const items = arcResponse.wireitems.map((item) => {
				const story = item.templates.find((t) => t.template === "story_with_image")?.story;
				if (!story) return null;
				return {
					title: story.hed,
					link: item.templates.find((t) => t.template === "story_with_image")?.template_action?.url,
					guid: story.usn,
					pubDate: parseDate(story.updated_at),
					updated: parseDate(story.updated_at),
					description: story.lede,
					author: story.authors?.map((author) => author.name).join(", "),
					category: [arcResponse.analytics?.topic_channel, arcResponse.analytics?.topic_sub_channel].filter(Boolean)
				};
			}).filter(Boolean);
			return {
				title: arcResponse.analytics?.title || `${arcResponse.wire_name} | Reuters`,
				description: arcResponse.analytics?.content_title,
				image: "https://www.reuters.com/pf/resources/images/reuters/logo-vertical-default-512x512.png?d=116",
				link: arcResponse.canonical_action?.url || `https://www.reuters.com${section_id}`,
				category: [arcResponse.analytics?.topic_channel, arcResponse.analytics?.topic_sub_channel].filter(Boolean),
				item: items.slice(0, limit)
			};
		}
	}
}
//#endregion
export { route };
