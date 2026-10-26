import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/oreno3d/get-sec-page-data.ts
const rootUrl$1 = "https://oreno3d.com";
const sync_detail = async (link) => {
	const sec_page_selector = "article.g-main-video-article";
	const raw_pic_selector = "header > figure.video-figure > a ";
	const video_name_selector = "header > h1.video-h1 ";
	const author_selector = "section:nth-child(4) > a > div.video-center";
	const origins_selector = "section:nth-child(5) > a > div.video-center";
	const characters_selector = "section:nth-child(6) > a > div.video-center";
	const tags_selector = "section:nth-child(7) > ul > li > a div.tag-text";
	const desc_selector = "section blockquote.video-information-comment";
	const iwara_link_selector = "header > figure.video-figure > a";
	const $ = load((await got_default(link)).data);
	const tags = [];
	const authors = [];
	const origins = [];
	const characters = [];
	const raw_pic_link = rootUrl$1 + $(raw_pic_selector).find("img").attr("src");
	const video_name = $(video_name_selector).text();
	$(sec_page_selector).find(author_selector).each((i, el) => {
		authors[i] = $(el).text();
		authors[i].replace(" ", "");
		authors[i].trim();
	});
	$(sec_page_selector).find(origins_selector).each((i, el) => {
		origins[i] = $(el).text();
		origins[i].replace(" ", "");
		origins[i].trim();
	});
	$(sec_page_selector).find(characters_selector).each((i, el) => {
		characters[i] = $(el).text();
		characters[i].replace(" ", "");
		characters[i].trim();
	});
	$(sec_page_selector).find(tags_selector).each((i, el) => {
		tags[i] = $(el).text();
		tags[i].replace(" ", "");
		tags[i].trim();
	});
	const desc = $(sec_page_selector).find(desc_selector).text();
	const iwara_link = $(iwara_link_selector).attr("href");
	return {
		raw_pic_link,
		video_name,
		authors: authors.join(" "),
		origins: origins.join(" "),
		characters: characters.join(" "),
		tags: tags.join(" "),
		desc,
		iwara_link,
		oreno3d_link: link
	};
};
//#endregion
//#region lib/routes/oreno3d/main.tsx
const rootUrl = "https://oreno3d.com";
const sortRename = {
	favorites: "高評価",
	hot: "急上昇",
	latest: "新着",
	popularity: "人気"
};
function get_user_url(rootUrl, ctx, sort) {
	let userUrl = "";
	if (ctx.req.param("keyword")) userUrl = `${rootUrl}/search?sort=${sort}&keyword=${ctx.req.param("keyword")}`;
	else if (ctx.req.param("characterid")) userUrl = `${rootUrl}/characters/${ctx.req.param("characterid")}?sort=${sort}`;
	else if (ctx.req.param("authorid")) userUrl = `${rootUrl}/authors/${ctx.req.param("authorid")}?sort=${sort}`;
	else if (ctx.req.param("tagid")) userUrl = `${rootUrl}/tags/${ctx.req.param("tagid")}?sort=${sort}`;
	else if (ctx.req.param("originid")) userUrl = `${rootUrl}/origins/${ctx.req.param("originid")}?sort=${sort}`;
	return userUrl;
}
const route = {
	path: [
		"/authors/:authorid/:sort/:pagelimit?",
		"/characters/:characterid/:sort/:pagelimit?",
		"/origins/:originid/:sort/:pagelimit?",
		"/search/:keyword/:sort/:pagelimit?",
		"/tags/:tagid/:sort/:pagelimit?"
	],
	categories: ["anime"],
	example: "/oreno3d/authors/3189/latest/1",
	parameters: {
		authorid: "Author id, can be found in URL",
		sort: "Sort method, see the table above",
		pagelimit: "The maximum number of pages to be crawled, the default is 1"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false,
		nsfw: true
	},
	name: "Author Search",
	maintainers: ["xueli_sherryli"],
	handler,
	description: `| favorites | hot | latest | popularity |
| --------- | --- | ------ | ---------- |
| favorites | hot | latest | popularity |`
};
async function handler(ctx) {
	function getLinksTitle(response) {
		const selector = "a.box";
		const $ = load(response.data);
		return {
			title: $("div.g-main-list").find("h1.main-h").text(),
			list: $(selector)
		};
	}
	async function getData(response) {
		const $ = load(response.data);
		const title = getLinksTitle(response).title;
		const list = getLinksTitle(response).list;
		return {
			items: await Promise.all(list.toArray().map(async (item) => {
				const sec_data = await sync_detail($(item).attr("href"));
				const raw_pic_link = sec_data.raw_pic_link;
				const video_name = sec_data.video_name;
				const authors = sec_data.authors;
				const origins = sec_data.origins;
				const characters = sec_data.characters;
				const tags = sec_data.tags;
				const desc = sec_data.desc;
				const iwara_link = sec_data.iwara_link;
				const oreno3d_link = sec_data.oreno3d_link;
				const description = renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("img", { src: raw_pic_link }),
					/* @__PURE__ */ jsxs("p", { children: ["标题：", /* @__PURE__ */ jsx("b", { children: video_name })] }),
					/* @__PURE__ */ jsxs("p", { children: ["作者：", /* @__PURE__ */ jsx("b", { children: authors })] }),
					/* @__PURE__ */ jsxs("p", { children: ["原作：", /* @__PURE__ */ jsx("b", { children: origins })] }),
					/* @__PURE__ */ jsxs("p", { children: ["角色：", /* @__PURE__ */ jsx("b", { children: characters })] }),
					/* @__PURE__ */ jsxs("p", { children: ["标签：", /* @__PURE__ */ jsx("b", { children: tags })] }),
					/* @__PURE__ */ jsx("p", { children: "简介：" }),
					/* @__PURE__ */ jsx("div", {
						style: "white-space: pre-line;",
						children: /* @__PURE__ */ jsx("b", { children: desc })
					}),
					/* @__PURE__ */ jsxs("p", { children: ["iwara链接：", /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx("a", {
						href: iwara_link,
						children: iwara_link
					}) })] }),
					/* @__PURE__ */ jsxs("p", { children: ["Oreno3D链接：", /* @__PURE__ */ jsx("b", { children: /* @__PURE__ */ jsx("a", {
						href: oreno3d_link,
						children: oreno3d_link
					}) })] })
				] }));
				const title = `${video_name} - ${authors}`;
				return await cache_default.tryGet(oreno3d_link, () => {
					return {
						title,
						author: authors,
						link: oreno3d_link,
						category: tags.split(" "),
						description
					};
				});
			})),
			title
		};
	}
	const sort = ctx.req.param("sort");
	let pagelimit = ctx.req.param("pagelimit") ?? 1;
	const userUrl = get_user_url(rootUrl, ctx, sort);
	const response = await got_default(userUrl);
	const $ = load(response.data);
	const maxPageSelector = "div.container > main > div.g-main-list > ul.pagination > li:last-child > a";
	if ($(maxPageSelector)) {
		const actualNum = new URLSearchParams($(maxPageSelector).attr("href")).get("page");
		if (Number.parseInt(pagelimit) >= Number.parseInt(actualNum)) pagelimit = actualNum;
	} else pagelimit = 1;
	const responseList = [response];
	const Links = [];
	for (let i = 1; i < pagelimit; i++) Links.push(`${userUrl}&page=${i + 1}`);
	await Promise.all(Links.map(async (link) => {
		const response = await got_default(link);
		responseList.push(response);
	}));
	const tempData = [];
	await Promise.all(responseList.map(async (response) => {
		const result = await getData(response);
		tempData.push(result);
	}));
	let realItem = [];
	for (const data of tempData) realItem = [...realItem, ...data.items];
	const data = {
		title: tempData[0].title,
		item: realItem
	};
	return {
		title: `${data.title} - ${sortRename[sort]}(Page 1-${pagelimit})`,
		link: userUrl,
		item: data.item
	};
}
//#endregion
export { route };
