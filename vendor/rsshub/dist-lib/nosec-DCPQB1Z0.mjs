import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/nosec/index.ts
const baseUrl = "https://nosec.org/home/ajaxindexdata";
const keykinds = {
	threaten: "威胁情报",
	security: "安全动态",
	hole: "漏洞预警",
	leakage: "数据泄露",
	speech: "专题报告",
	skill: "技术分析",
	tool: "安全工具"
};
const route = {
	path: "/:keykind?",
	categories: ["programming"],
	example: "/nosec/hole",
	parameters: { keykind: "对应文章分类" },
	name: "Posts",
	maintainers: ["hellodword"],
	description: `| 分类     | 标识       |
| :------- | :--------- |
| 威胁情报 | \`threaten\` |
| 安全动态 | \`security\` |
| 漏洞预警 | \`hole\`     |
| 数据泄露 | \`leakage\`  |
| 专题报告 | \`speech\`   |
| 技术分析 | \`skill\`    |
| 安全工具 | \`tool\`     |`,
	handler,
	radar: [{
		source: ["nosec.org/home/index/:keykind", "nosec.org/home/index"],
		target: (params) => `/nosec${params.keykind ? `/${params.keybind.replace(".html", "")}` : ""}`
	}]
};
async function handler(ctx) {
	const csrfresponse = await rofetch.raw("https://nosec.org/home/index");
	const token = load(csrfresponse._data)("meta[name=\"csrf-token\"]").attr("content");
	const cookies = csrfresponse.headers.getSetCookie().toString();
	const xsrf_token = cookies.match(/XSRF-TOKEN=[^\s;]+/)[0];
	const laravel_session = cookies.match(/laravel_session[^\s;]+/)[0];
	const keykind = ctx.req.param("keykind") || "";
	let formdata;
	let title;
	let link;
	if (Object.hasOwn(keykinds, keykind)) {
		formdata = `keykind=${keykind}&page=1`;
		title = `NOSEC 安全讯息平台 - ${keykinds[keykind]}`;
		link = `https://nosec.org/home/index/${keykind}.html`;
	} else {
		formdata = "keykind=&page=1";
		title = "NOSEC 安全讯息平台";
		link = "https://nosec.org/home/index";
	}
	const data = (await got_default({
		method: "post",
		url: baseUrl,
		headers: {
			"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
			Accept: "application/json",
			cookie: `${xsrf_token};${laravel_session}`,
			"X-CSRF-TOKEN": token
		},
		body: formdata
	})).data.data.threatData.data;
	return {
		title,
		link,
		description: title,
		item: data.map((item) => ({
			title: item.title,
			description: item.summary,
			pubDate: new Date(item.publiced_at).toUTCString(),
			link: `https://nosec.org/home/detail/${item.id}.html`,
			author: item.username
		}))
	};
}
//#endregion
export { route };
