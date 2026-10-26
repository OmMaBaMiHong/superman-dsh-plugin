import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/crac/exam.tsx
const route = {
	path: "/exam",
	categories: ["government"],
	example: "/crac/exam",
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "考试信息",
	maintainers: ["admxj"],
	radar: [{
		source: ["www.crac.org.cn/*"],
		target: "/exam"
	}],
	handler
};
async function handler() {
	const baseUrl = "http://82.157.138.16:8091/CRAC";
	return {
		title: "考试信息-中国无线电协会业余无线电分会",
		link: "http://82.157.138.16:8091/CRAC/crac/pages/list_examMsg.html",
		item: (await got_default({
			method: "post",
			url: `${baseUrl}/app/exam_advice/examAdviceList`,
			body: { req: {
				type: "0",
				page_no: "1",
				page_size: "10"
			} }
		})).data.res.list.map((item) => {
			const id = Buffer.from(item.id).toString("base64");
			const type = Buffer.from(item.type).toString("base64");
			const link = `${baseUrl}/crac/pages/list_detail.html?id=${id}&type=${type}`;
			return {
				title: item.name,
				link,
				id: item.id,
				author: item.exam.organizer,
				pubDate: item.createDate,
				updated: item.updateDate,
				startDate: item.exam.signUpStartDate,
				category: [item.examType],
				image: item.weixin,
				description: renderToString(/* @__PURE__ */ jsx(ExamDescription, { item }))
			};
		})
	};
}
const ExamDescription = ({ item }) => /* @__PURE__ */ jsxs("div", {
	class: "notice-info",
	children: [/* @__PURE__ */ jsxs("table", {
		class: "exam-table",
		id: "exam_table",
		style: "width: 90%;margin: 30px auto 0;border: 1px solid #e2e5ef;",
		children: [
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "组织者："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.organizer }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "报名开始日期："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.signUpStartDate })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "报名截止日期："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.signUpEndDate }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "补充材料截止日期："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.supplementEndDate })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "考试日期："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.examDate }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "最多参考人数："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.maxNum })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "联系方式："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.telephone }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "考试方式："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.mode === 0 ? "机上考试" : "纸上考试" })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "考试类型："
				}),
				/* @__PURE__ */ jsxs("td", { children: [item.exam.type, "类"] }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "考试地点："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.examArea })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "电子邮箱："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.email }),
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "备注："
				}),
				/* @__PURE__ */ jsx("td", { children: item.exam.remarks })
			] }),
			/* @__PURE__ */ jsxs("tr", { children: [
				/* @__PURE__ */ jsx("th", {
					style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;",
					children: "微信群二维码："
				}),
				/* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("img", {
					src: item.exam.weixin,
					style: "width: auto;height: 100px;"
				}) }),
				/* @__PURE__ */ jsx("th", { style: "width: 15%;padding: 12px 0;text-align: right;font-weight: normal;background-color: #f3f8ff;" }),
				/* @__PURE__ */ jsx("td", {})
			] })
		]
	}), /* @__PURE__ */ jsx("div", {
		class: "content",
		id: "detail_content",
		children: item.content ? raw(item.content) : null
	})]
});
//#endregion
export { route };
