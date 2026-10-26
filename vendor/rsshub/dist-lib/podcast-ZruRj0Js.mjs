import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/scientificamerican/templates/description.tsx
const ScientificAmericanDescription = ({ images, intro, content }) => /* @__PURE__ */ jsxs(Fragment, { children: [
	images?.map((image) => {
		if (!image?.src) return null;
		const altValue = image.height ?? image.width ?? image.alt;
		return /* @__PURE__ */ jsx("figure", { children: /* @__PURE__ */ jsx("img", {
			src: image.src,
			alt: altValue ? String(altValue) : void 0
		}) });
	}),
	intro ? raw(intro) : null,
	content?.map((block) => {
		const Tag = block.tag;
		return /* @__PURE__ */ jsx(Tag, { children: raw(block.content) });
	})
] });
const renderDescription = (data) => renderToString(/* @__PURE__ */ jsx(ScientificAmericanDescription, { ...data }));
//#endregion
//#region lib/routes/scientificamerican/podcast.ts
const handler = async (ctx) => {
	const { id } = ctx.req.param();
	const limit = Number(ctx.req.query("limit") ?? "12");
	const baseUrl = "https://www.scientificamerican.com";
	const targetUrl = new URL(`podcast${id ? `/${id}` : "s"}/`, baseUrl).href;
	const response = await rofetch(targetUrl);
	const $ = load(response);
	const language = $("html").attr("lang") ?? "en";
	const data = response.match(/window\.__DATA__=JSON\.parse\(`(.*?)`\)/)?.[1];
	const parsedData = data ? JSON.parse(data.replaceAll(String.raw`\\`, "\\")) : void 0;
	let items = parsedData ? parsedData.initialData.props.results.slice(0, limit).map((item) => {
		const title = item.title;
		const image = item.image_url;
		const description = renderDescription({
			images: image ? [{
				src: image,
				alt: item.image_alt_text || title,
				width: item.image_width,
				height: item.image_height
			}] : void 0,
			intro: item.summary
		});
		const pubDate = item.date_published;
		const linkUrl = item.url;
		const categories = [...new Set([
			item.category,
			item.subtype,
			item.column,
			item.digital_column
		].filter(Boolean))];
		const authors = item.authors.map((author) => ({
			name: author.name,
			url: author.url ? new URL(author.url, baseUrl).href : void 0,
			avatar: author.picture_file
		}));
		const guid = `-${item.id}`;
		const updated = item.release_date ?? pubDate;
		let processedItem = {
			title,
			description,
			pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
			link: linkUrl ? new URL(linkUrl, baseUrl).href : void 0,
			category: categories,
			author: authors,
			doi: item.article_doi,
			guid,
			id: guid,
			content: {
				html: description,
				text: item.summary ?? description
			},
			image,
			banner: image,
			updated: updated ? timezone(parseDate(updated), 8) : void 0,
			language
		};
		const enclosureUrl = item.media_url;
		if (enclosureUrl) {
			const enclosureType = `audio/${enclosureUrl.replace(/\?.*$/, "").split(/\./).pop()}`;
			processedItem = {
				...processedItem,
				enclosure_url: enclosureUrl,
				enclosure_type: enclosureType,
				enclosure_title: title,
				itunes_item_image: image
			};
		}
		return processedItem;
	}) : [];
	items = (await Promise.all(items.map((item) => {
		if (!item.link) return item;
		return cache_default.tryGet(item.link, async () => {
			const detailData = (await rofetch(item.link)).match(/window\.__DATA__=JSON\.parse\(`(.*?)`\)/)?.[1];
			const parsedDetailData = detailData ? JSON.parse(detailData.replaceAll(String.raw`\\`, "\\")) : void 0;
			if (!parsedDetailData) return item;
			const articleData = parsedDetailData.initialData.article;
			const title = articleData.title;
			const image = articleData.image_url;
			const description = renderDescription({
				images: image ? [{
					src: image,
					alt: articleData.image_alt_text || title,
					width: articleData.image_width,
					height: articleData.image_height
				}] : void 0,
				intro: articleData.summary,
				content: articleData.content
			});
			const pubDate = articleData.published_at_date_time;
			const categories = [.../* @__PURE__ */ new Set([
				articleData.display_category,
				articleData.primary_category,
				articleData.subcategory,
				...articleData.categories ?? [],
				articleData.podcast_series_name
			])];
			const authors = articleData.authors.map((author) => ({
				name: author.name,
				url: author.url ? new URL(author.url, baseUrl).href : void 0,
				avatar: author.picture_file
			}));
			const guid = `scientificamerican-${articleData.id}`;
			const updated = articleData.updated_at_date_time ?? pubDate;
			let processedItem = {
				title,
				description,
				pubDate: pubDate ? timezone(parseDate(pubDate), 8) : void 0,
				category: categories,
				author: authors,
				doi: articleData.article_doi,
				guid,
				id: guid,
				content: {
					html: description,
					text: articleData.summary ?? description
				},
				image,
				banner: image,
				updated: updated ? timezone(parseDate(updated), 8) : void 0,
				language
			};
			const enclosureUrl = articleData.media_url;
			if (enclosureUrl) {
				const enclosureType = `audio/${enclosureUrl.replace(/\?.*$/, "").split(/\./).pop()}`;
				processedItem = {
					...processedItem,
					enclosure_url: enclosureUrl,
					enclosure_type: enclosureType,
					enclosure_title: title,
					itunes_item_image: image
				};
			}
			return {
				...item,
				...processedItem
			};
		});
	}))).filter((_) => true);
	return {
		title: $("title").text(),
		description: $("meta[name=\"description\"]").attr("content"),
		link: targetUrl,
		item: items,
		allowEmpty: true,
		image: $("meta[property=\"og:image\"]").attr("content"),
		author: $("meta[property=\"og:site_name\"]").attr("content"),
		language,
		feedLink: $("link[type=\"application/rss+xml\"]").attr("href"),
		itunes_author: $("meta[property=\"og:site_name\"]").attr("content"),
		itunes_category: "Science",
		id: $("meta[property=\"og:url\"]").attr("content")
	};
};
const route = {
	path: "/podcast/:id?",
	name: "Podcasts",
	url: "www.scientificamerican.com",
	maintainers: ["nczitzk"],
	handler,
	example: "/scientificamerican/podcast",
	parameters: { id: "ID, see below" },
	description: `::: tip
If you subscribe to [Science Quickly](https://www.scientificamerican.com/podcast/science-quickly/)，where the URL is \`https://www.scientificamerican.com/podcast/science-quickly/\`, extract the part \`https://www.scientificamerican.com/podcast/\` to the end, which is \`science-quickly\`, and use it as the parameter to fill in. Therefore, the route will be [\`/scientificamerican/podcast/science-quickly\`](https://rsshub.app/scientificamerican/podcast/science-quickly).
:::

| All | Science Quickly | Uncertain    |
| --- | --------------- | ------------ |
|     | science-quickly | science-talk |`,
	categories: ["new-media"],
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportRadar: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [
		{
			source: ["www.scientificamerican.com/podcasts/", "www.scientificamerican.com/podcast/:id"],
			target: (params) => {
				const id = params.id;
				return `/scientificamerican/podcast${id ? `/${id}` : ""}`;
			}
		},
		{
			title: "Science Quickly",
			source: ["www.scientificamerican.com/podcast/science-quickly/"],
			target: "/podcast/science-quickly"
		},
		{
			title: "Uncertain",
			source: ["www.scientificamerican.com/podcast/science-talk/"],
			target: "/podcast/science-talk"
		}
	],
	view: 0,
	zh: {
		path: "/podcast/:id?",
		name: "Podcasts",
		url: "www.scientificamerican.com",
		maintainers: ["nczitzk"],
		handler,
		example: "/scientificamerican/podcast",
		parameters: { id: "ID，见下表" },
		description: `::: tip
若订阅 [Science Quickly](https://www.scientificamerican.com/podcast/science-quickly/)，网址为 \`https://www.scientificamerican.com/podcast/science-quickly/\`，请截取 \`https://www.scientificamerican.com/podcast/\` 到末尾 \`/\` 的部分 \`science-quickly\` 作为 \`id\` 参数填入，此时目标路由为 [\`/scientificamerican/podcast/science-quickly\`](https://rsshub.app/scientificamerican/podcast/science-quickly)。
:::

| 全部 | Science Quickly | Uncertain    |
| ---- | --------------- | ------------ |
|      | science-quickly | science-talk |`
	}
};
//#endregion
export { handler, route };
