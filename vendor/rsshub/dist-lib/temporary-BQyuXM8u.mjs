import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/shanximuseum/namespace.ts
const namespace = {
	name: "Shanxi Museum",
	url: "www.shanximuseum.com.cn",
	zh: { name: "山西博物院" }
};
//#endregion
//#region lib/routes/shanximuseum/temporary.tsx
const route = {
	path: "/exhibition/temporary/:type?",
	categories: ["travel"],
	example: "/shanximuseum/exhibition/temporary/now&future",
	parameters: { type: "Temporary Exhibition type, supported values: now （正在展出）、future（即将展出）、now&future（正在展出&即将展出）、past（往期展览）。Supports multiple status combinations separated by &, + or , (e.g., now&future). Default: All exhibitions (now, future and past)." },
	name: "Temporary Exhibitions",
	maintainers: ["magazian"],
	radar: [{
		source: ["www.shanximuseum.com.cn/sx/exhibition/temporary.html"],
		target: "/exhibition/temporary"
	}],
	handler: async (ctx) => {
		const typeParam = ctx.req.param("type");
		const fetchTypes = typeParam ? [...new Set(typeParam.split(/[&+,|-]/))] : [
			"now",
			"future",
			"past"
		];
		const baseUrl = "https://www.shanximuseum.com.cn";
		const apiUrl = `${baseUrl}/sx/exhibition`;
		const apiConfig = {
			now: {
				endpoint: "/temporary_now",
				name: "正在展出",
				query: {}
			},
			future: {
				endpoint: "/temporary_future",
				name: "即将展出",
				query: {}
			},
			past: {
				endpoint: "/temporary_list",
				name: "往期展览",
				query: {
					offset: 0,
					count: 20,
					year: "",
					keyword: ""
				}
			}
		};
		const museumName = namespace.zh?.name || namespace.name;
		const titleTag = fetchTypes.length === 3 ? "全部展览" : fetchTypes.map((t) => apiConfig[t]?.name).join(" & ");
		const items = (await Promise.all(fetchTypes.map(async (t) => {
			const config = apiConfig[t];
			try {
				const resData = (await got_default({
					method: "get",
					url: `${apiUrl}${config.endpoint}`,
					searchParams: {
						...config.query,
						_: Date.now()
					}
				})).data?.data;
				return (Array.isArray(resData) ? resData : resData?.list || []).map((item) => {
					const title = item.title;
					const itemLink = item.fullurl;
					const pubDate = timezone(parseDate(item.publishtime * 1e3));
					const startDate = item.start_time.split(" ", 1)[0];
					const endDate = item.end_time.split(" ", 1)[0];
					const fullDuration = item.display_time;
					const location = item.area;
					return {
						title,
						link: itemLink,
						pubDate,
						description: renderToString(/* @__PURE__ */ jsxs("div", { children: [
							/* @__PURE__ */ jsx("img", { src: `${baseUrl}${item.image}` }),
							/* @__PURE__ */ jsx("br", {}),
							/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "地点：" }), location || "参考展览图片"] }),
							/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "开展：" }), startDate || "未定/常设"] }),
							/* @__PURE__ */ jsxs("p", { children: [/* @__PURE__ */ jsx("b", { children: "闭展：" }), endDate || "未定/常设"] }),
							fullDuration && /* @__PURE__ */ jsx("p", { children: /* @__PURE__ */ jsxs("small", { children: ["原始展期：", fullDuration] }) })
						] })),
						_extra: {
							museumName,
							title,
							location,
							startDate,
							endDate,
							itemLink
						}
					};
				});
			} catch {
				return [];
			}
		}))).flat();
		return {
			title: `${museumName} - 临时展览 - ${titleTag}`,
			link: `${baseUrl}/sx/exhibition/temporary.html`,
			language: "zh-CN",
			item: items
		};
	}
};
//#endregion
export { route };
