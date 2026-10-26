import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import crypto from "node:crypto";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/linkedin/cn/renderer.ts
const text_tag = {
	LINE_BREAK: 0,
	INLINE_CODE: 1,
	LEGACY_PUBLISHING_EMPHASIS: 2,
	LIST_ITEM: 3,
	LIST: 4,
	STRIKETHROUGH: 5,
	SUBSCRIPT: 6,
	SUPERSCRIPT: 7,
	UNDERLINE: 8,
	BOLD: 9,
	ITALIC: 10,
	PARAGRAPH: 11
};
var TreeNode = class {
	constructor(attr) {
		this.attr = attr;
		this.start = attr.start;
		this.end = attr.start + attr.length;
		this.children = [];
	}
};
var Ucs2Text = class Ucs2Text {
	constructor(text) {
		if (Array.isArray(text)) {
			this.string = null;
			this.codePoints = text;
		} else {
			this.string = text;
			const k = text.length;
			const d = [];
			let l, e, m = 0;
			while (m < k) {
				l = text.charCodeAt(m++);
				if (l >= 55296 && l <= 56319 && m < k) {
					e = text.charCodeAt(m++);
					if (56320 === (64512 & e)) d.push(((1023 & l) << 10) + (1023 & e) + 65536);
					else {
						d.push(l);
						m--;
					}
				} else d.push(l);
			}
			this.codePoints = d;
		}
		this.length = this.codePoints.length;
	}
	substring(start, end) {
		let _len = this.length, _start = start, _end = end;
		if (_end === 0) return new Ucs2Text("");
		if ((Number.isNaN(_start) || 0 > _start) && (_start = 0), (Number.isNaN(_end) || 0 > _end) && (_end = _len), _start > _len && (_start = _len), _end > _len && (_end = _len), _end < _start) {
			_len = [_start, _end];
			_end = _len[0];
			_start = _len[1];
		}
		return new Ucs2Text(_start === _end ? "" : this.codePoints.slice(_start, _end));
	}
	slice(a, b) {
		return this.substring(a, b).toString();
	}
	toString() {
		return null === this.string ? this.codePoints.map((a) => {
			let b = "";
			return 65535 < a && (b += String.fromCharCode((a -= 65536) >>> 10 & 1023 | 55296), a = 1023 & (56320 | a)), b + String.fromCharCode(a);
		}).join("") : this.string;
	}
};
const renderSingle = (node) => {
	switch (node?.attr?.detailData?.style) {
		case "BOLD": return `<b>${node.text}</b>`;
		case "LINE_BREAK": return "<br>";
		case "LIST_ITEM": return `<li>${node.text}</li>`;
		case "LIST": return `<ul>${node.text}</ul>`;
		case "INLINE_CODE": return `<code>${node.text}</code>`;
		case "LEGACY_PUBLISHING_EMPHASIS": return `<em>${node.text}</em>`;
		case "STRIKETHROUGH": return `<s>${node.text}</s>`;
		case "SUBSCRIPT": return `<sub>${node.text}</sub>`;
		case "SUPERSCRIPT": return `<sup>${node.text}</sup>`;
		case "UNDERLINE": return `<u>${node.text}</u>`;
		case "ITALIC": return `<i>${node.text}</i>`;
		case "PARAGRAPH": return `<p>${node.text}</p>`;
		default: return node.text || node;
	}
};
const parseAttr = (description) => {
	const { attributes, text } = description;
	const attrs = [...attributes];
	attrs.sort((b, d) => {
		const f = b.start + b.length, e = d.start + d.length;
		return f === e ? text_tag[b.detailData.style] - text_tag[d.detailData.style] : f - e;
	});
	const n = [];
	for (const q of attrs) {
		const p = new TreeNode(q);
		const w = q.start;
		while (0 < n.length && n.at(-1).attr.start >= w) p.children.push(n.pop());
		p.children.reverse();
		n.push(p);
	}
	const m = new Ucs2Text(text);
	const render = (node) => {
		if (node.children.length === 0) {
			node.text = m.slice(node.start, node.end);
			return renderSingle(node);
		}
		const res = [];
		let s = node.start;
		for (const child of node.children) {
			if (s < child.start) res.push(m.slice(s, child.start));
			s = child.end;
			res.push(render(child));
		}
		if (s < node.end) res.push(m.slice(s, node.end));
		node.text = res.join("");
		return renderSingle(node);
	};
	const q = [];
	let p = 0;
	for (const e of n) {
		if (e.start > p) q.push(m.slice(p, e.start));
		p = e.end;
		q.push(render(e));
	}
	if (p < m.length) q.push(m.slice(p));
	return q.join("");
};
//#endregion
//#region lib/routes/linkedin/cn/utils.tsx
const apiUrl = "https://www.linkedin.cn/karpos/api/graphql";
const searchHitQueryId = "searchSearchHitsByJob.be362cd720abd0ebf89b4bbc3253047f";
const jobPostingQueryId = "jobsJobPostingsById.3b9573e88687a86607ddb74ff013ef50";
const makeHeader = () => {
	const sessionId = crypto.randomBytes(8).toString("hex").slice(0, 8);
	return {
		Accept: "*/*",
		Cookie: `JSESSIONID="ajax:${sessionId}"`,
		"Content-Type": "application/x-www-form-urlencoded",
		Referer: "https://www.linkedin.cn/incareer/jobs/search",
		"csrf-token": `ajax:${sessionId}`,
		"x-http-method-override": "GET",
		"x-restli-protocol-version": "2.0.0"
	};
};
const period = {
	1: "r86400",
	7: "r604800",
	30: "r2592000"
};
const location = {
	china: "102890883",
	shanghai: "102772228",
	beijing: "103873152"
};
const makeVariables = (variables) => "(" + Object.entries(variables).filter(([, v]) => v).map(([k, v]) => `${k}:${encodeURIComponent(v)}`).join(",") + ")";
const makeBody = (body) => {
	let output = "";
	for (const [index, [key, value]] of Object.entries(body).entries()) {
		output += `${key}=${value}`;
		if (index < Object.keys(body).length - 1) output += "&";
	}
	return output;
};
const ctxToTitle = (ctx) => {
	const keywords = ctx.req.param("keywords");
	const { geo, remote, location, period, relevant } = ctx.req.query();
	const g = location || geo || "China";
	const r = remote ? "远程" : "";
	const p = period ? `近${period}天` : "";
	return `${relevant ? "相关" : "最新"}${p}在${g}的${keywords || ""}${r}工作机会`;
};
const parseSearchHit = async (ctx) => {
	const variables = {
		origin: "jserp",
		isForRemoteJobsPage: !!ctx.req.query("remote"),
		isChinaMultiNationalCorporation: false,
		count: ctx.req.query("limit") || 20,
		start: "0",
		geoUrn: `urn:li:ks_geo:${location[ctx.req.query("location")] || ctx.req.query("geo") || location.china}`,
		keywords: decodeURIComponent(ctx.req.param("keywords") || ""),
		f_TPR: period[ctx.req.query("period")] || "",
		sortType: ctx.req.query("relevant") ? "" : "DATE_DESCENDING"
	};
	return {
		jobs: (await got_default.post(apiUrl, {
			headers: makeHeader(),
			body: makeBody({
				operationName: "searchSearchHitsByJob",
				variables: makeVariables(variables),
				queryId: searchHitQueryId
			})
		})).data.data.searchSearchHitsByJob.elements.map((e) => e.target.jobPosting),
		title: ctxToTitle(ctx)
	};
};
const parseJobPosting = (ctx, jobPosting) => {
	const entityUrn = jobPosting.entityUrn;
	return cache_default.tryGet(`linkedincn:${entityUrn}`, async () => {
		const job = (await got_default.post(apiUrl, {
			headers: makeHeader(),
			body: makeBody({
				operationName: "jobViewPage",
				variables: makeVariables({ jobPostingUrn: entityUrn }),
				queryId: jobPostingQueryId
			})
		})).data.data.jobsJobPostingsById;
		job.desc = parseAttr(job.description);
		return {
			title: `${jobPosting.companyName} 正在找 ${jobPosting.title}`,
			link: `https://www.linkedin.cn/incareer/jobs/view/${entityUrn.split(":").pop()}`,
			guid: `linkedincn:${entityUrn}`,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("h2", { children: job.title }),
				/* @__PURE__ */ jsx("p", { children: job.applyMethod?.instantOffsiteApply ? /* @__PURE__ */ jsx("a", {
					href: job.applyMethod.instantOffsiteApply.companyApplyUrl,
					children: "点击申请"
				}) : null }),
				/* @__PURE__ */ jsx("p", { children: job.applyMethod?.basicOffsiteApply ? /* @__PURE__ */ jsx("a", {
					href: job.applyMethod.basicOffsiteApply.companyApplyUrl,
					children: "点击申请"
				}) : null }),
				/* @__PURE__ */ jsxs("p", { children: [
					"已有",
					job.numApplies,
					"人申请此职位， ",
					job.numViews,
					"人查看此职位"
				] }),
				job.compensationDescription ? /* @__PURE__ */ jsxs("p", { children: [
					"薪资：",
					job.compensationDescription || "N/A",
					" "
				] }) : null,
				/* @__PURE__ */ jsxs("p", { children: [
					"工作地点： ",
					job.geo?.defaultLocalizedName ?? "",
					" "
				] }),
				job.company ? /* @__PURE__ */ jsxs(Fragment, { children: [
					/* @__PURE__ */ jsx("h2", { children: "公司介绍" }),
					/* @__PURE__ */ jsx("p", { children: job.company.name }),
					/* @__PURE__ */ jsxs("p", { children: ["员工人数：", job.company.employeeCount] }),
					/* @__PURE__ */ jsx("p", { children: job.company.localizedDescription })
				] }) : null,
				/* @__PURE__ */ jsx("h2", { children: "职位介绍" }),
				/* @__PURE__ */ jsx("article", { children: job.desc ? raw(job.desc) : null })
			] })),
			pubDate: jobPosting.listedAt
		};
	});
};
//#endregion
//#region lib/routes/linkedin/cn/index.ts
const siteUrl = "https://www.linkedin.cn/incareer/jobs/search";
const route = {
	path: "/cn/jobs/:keywords?",
	categories: ["other"],
	example: "/linkedin/cn/jobs/Software",
	parameters: { keywords: "搜索关键字" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Jobs",
	maintainers: ["bigfei"],
	handler,
	description: `另外，可以通过添加额外的以下 query 参数来输出满足特定要求的工作职位：

| 参数       | 描述                                              | 举例                                                    | 默认值  |
| ---------- | ------------------------------------------------- | ------------------------------------------------------- | ------- |
| \`geo\`      | geo 编码                                          | 102890883（中国）、102772228（上海）、103873152（北京） | 空      |
| \`remote\`   | 是否只显示远程工作                                | \`true/false\`                                            | \`false\` |
| \`location\` | 工作地点                                          | \`china/shanghai/beijing\`                                | 空      |
| \`relevant\` | 排序方式 (true: 按相关性排序，false： 按日期排序) | \`true/false\`                                            | \`false\` |
| \`period\`   | 发布时间                                          | \`1/7/30\`                                                | 空      |

例如：
[\`/linkedin/cn/jobs/Software?location=shanghai&period=1\`](https://rsshub.app/linkedin/cn/jobs/Software?location=shanghai\\&period=1): 查找所有在上海的今日发布的所有 Software 工作

**为了方便起见，建议您在 [LinkedIn.cn](https://www.linkedin.cn/incareer/jobs/search) 上进行搜索，并使用 [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) 加载特定的 feed。**`
};
async function handler(ctx) {
	const { title, jobs } = await parseSearchHit(ctx);
	const items = await Promise.all(jobs.map((job) => parseJobPosting(ctx, job)));
	return {
		title: `领英 - ${title}`,
		link: siteUrl,
		item: items
	};
}
//#endregion
export { route };
