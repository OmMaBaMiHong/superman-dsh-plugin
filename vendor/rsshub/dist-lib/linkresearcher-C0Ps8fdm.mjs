import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import "./types-DNj6Etbg.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/linkresearcher/index.tsx
const renderBilingual = (zh, en) => renderToString(/* @__PURE__ */ jsx(Fragment, { children: en.map((enText, index) => /* @__PURE__ */ jsxs(Fragment, { children: [
	index === 0 ? null : /* @__PURE__ */ jsx("br", {}),
	/* @__PURE__ */ jsx("p", { children: enText }),
	/* @__PURE__ */ jsx("p", { children: zh[index] })
] })) }));
const baseURL = "https://www.linkresearcher.com";
const apiURL = `${baseURL}/api`;
const route = {
	name: "Articles",
	path: "/:params",
	example: "/linkresearcher/category=theses&columns=Nature%20导读&subject=生物",
	maintainers: ["y9c", "KarasuShin"],
	handler,
	view: 0,
	categories: ["journal"],
	parameters: { params: { description: "search parameters, support `category`, `subject`, `columns`, `query`" } },
	zh: { name: "文章" },
	"zh-TW": { name: "文章" }
};
async function handler(ctx) {
	const categoryMap = {
		theses: "论文",
		information: "新闻",
		careers: "职业"
	};
	const params = ctx.req.param("params");
	const filters = new URLSearchParams(params);
	const subject = filters.get("subject");
	const columns = filters.get("columns");
	const query = filters.get("query") ?? "";
	const category = filters.get("category") ?? "theses";
	if (!Object.hasOwn(categoryMap, category)) throw new InvalidParameterError("Invalid category");
	let title = categoryMap[category];
	const token = crypto.randomUUID();
	const data = { filters: { status: true } };
	if (subject) {
		data.filters.subject = subject;
		title += `「${subject}」`;
	}
	if (columns) {
		data.filters.columns = columns;
		title += `「${columns}」`;
	}
	const pageResponse = await rofetch(`${baseURL}/api/${category === "careers" ? "articles" : category}/search`, {
		method: "POST",
		headers: {
			"content-type": "application/json; charset=UTF-8",
			"x-xsrf-token": token,
			cookie: `XSRF-TOKEN=${token}`
		},
		params: {
			from: 0,
			size: 20,
			type: category === "careers" ? "CAREER" : "SEARCH"
		},
		body: {
			...data,
			query
		}
	});
	const items = await Promise.all(pageResponse.hits.map((item) => {
		const link = `${baseURL}/${category}/${item.id}`;
		return cache_default.tryGet(link, async () => {
			const response = await rofetch(`${apiURL}/${category === "theses" ? "theses" : "information"}/${item.id}`, { responseType: "json" });
			const dataItem = {
				title: response.title,
				pubDate: parseDate(response.onlineTime),
				link,
				image: response.cover,
				description: "zhTextList" in response && "enTextList" in response ? renderBilingual(response.zhTextList, response.enTextList) : response.content
			};
			if ("paperList" in response) {
				const { doi, authors } = response.paperList[0];
				dataItem.doi = doi;
				dataItem.author = authors.map((author) => ({ name: author }));
			}
			return dataItem;
		});
	}));
	return {
		title: `领研 | ${title}`,
		description: "领研是链接华人学者的人才及成果平台。领研为国内外高校、科研机构及科技企业提供科研人才招聘服务，也是青年研究者的职业发展指导及线上培训平台；研究者还可将自己的研究论文上传至领研，与超过五十万华人学者分享工作的最新进展。",
		image: `${baseURL}/assets/images/logo-app.png`,
		link: baseURL,
		item: items
	};
}
//#endregion
export { route };
