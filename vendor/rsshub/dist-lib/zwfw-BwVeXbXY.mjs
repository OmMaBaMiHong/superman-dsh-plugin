import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as logger } from "./logger-BS24s3sd.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { n as outPlaywright } from "./playwright-DGfbX7qN.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { raw } from "hono/html";
//#region lib/routes/gov/hangzhou/zjzwfw.ts
async function crawler(item, context) {
	try {
		let response = "";
		const page = await context.newPage();
		await page.route("**/*", (route) => {
			const resourceType = route.request().resourceType();
			if ([
				"document",
				"script",
				"stylesheet",
				"xhr"
			].includes(resourceType)) route.continue();
			else route.abort();
		});
		await page.goto(item.link, {
			waitUntil: "networkidle",
			timeout: 29e3
		});
		await page.evaluate((selector) => document.querySelector(selector).click(), ".item-left .item .title .button");
		await page.waitForSelector(".item-left .item .bg_box div:nth-child(16)", { timeout: 5e3 });
		response = await page.content();
		return response || "";
	} catch (error) {
		logger.error("Error when visiting /gov/hangzhou/zwfw:", error);
		return "";
	}
}
function analyzer(box) {
	return {
		serviceInfo: {
			serviceTarget: box.find(".row:nth(1)>div:nth(1)").find(".inner").children().first().attr("content"),
			processingMethods: box.find(".row:nth(1)>div:nth(3)").find(".inner").text(),
			processingLocation: box.find(".row:nth(2)>div:nth(1)").find(".inner").text(),
			processingTime: box.find(".row:nth(3)>div:nth(1)").find(".inner").text()
		},
		applicationInfo: {
			acceptanceConditions: box.find(".row:nth(5)>div:nth(1)").find(".inner").text(),
			prohibitedRequirements: box.find(".row:nth(6)>div:nth(1)").find(".inner").text(),
			quantityRestrictions: box.find(".row:nth(7)>div:nth(1)").find(".inner").text()
		},
		resultInfo: {
			approvalResult: box.find(".row:nth(9)>div:nth(1)").find(".inner").text(),
			approvalSample: box.find(".row:nth(10)>div:nth(1)").find(".inner").html(),
			approvalResultType: box.find(".row:nth(10)>div:nth(3)").find(".inner").text()
		},
		feeInfo: {
			isThereAFee: box.find(".row:nth(12)>div:nth(1)").find(".inner").text(),
			isOnlinePaymentSupported: box.find(".row:nth(12)>div:nth(3)").find(".inner").text()
		},
		approvalInfo: {
			authoritySource: box.find(".row:nth(14)>div:nth(1)").find(".inner").text(),
			exerciseLevel: box.find(".row:nth(15)>div:nth(1)").find(".inner").text(),
			implementingEntity: box.find(".row:nth(15)>div:nth(3)").find(".inner").text()
		},
		deliveryInfo: {
			isLogisticsSupported: box.find(".row:nth(17)>div:nth(1)").find(".inner").text(),
			deliveryTimeframe: box.find(".row:nth(17)>div:nth(3)").find(".inner").text(),
			deliveryMethods: box.find(".row:nth(18)>div:nth(1)").find(".inner").text()
		},
		agentService: box.find(".row:nth(20)>div:nth(1)").find(".inner").text(),
		otherInfo: {
			departmentName: box.find(".row:nth(22)>div:nth(1)").find(".inner").text(),
			matterType: box.find(".row:nth(22)>div:nth(3)").find(".inner").text(),
			acceptingInstitution: box.find(".row:nth(23)>div:nth(1)").find(".inner").text(),
			basicCode: box.find(".row:nth(24)>div:nth(1)").find(".inner").text(),
			implementationCode: box.find(".row:nth(24)>div:nth(3)").find(".inner").text(),
			scopeOfGeneralHandling: box.find(".row:nth(25)>div:nth(1)").find(".inner").text(),
			documentType: box.find(".row:nth(25)>div:nth(3)").find(".inner").text(),
			decisionMakingAuthority: box.find(".row:nth(26)>div:nth(1)").find(".inner").text(),
			delegatedDepartment: box.find(".row:nth(26)>div:nth(3)").find(".inner").text(),
			onlineProcessingDepth: box.find(".row:nth(27)>div:nth(1)").find(".inner").text(),
			reviewType: box.find(".row:nth(27)>div:nth(3)").find(".inner").text(),
			isItAvailableInTheGovernmentServiceHall: box.find(".row:nth(28)>div:nth(1)").find(".inner").text(),
			isSelfServiceTerminalProcessingSupported: box.find(".row:nth(28)>div:nth(3)").find(".inner").text(),
			isACommitmentSystemImplemented: box.find(".row:nth(29)>div:nth(1)").find(".inner").text(),
			authorityAttribute: box.find(".row:nth(29)>div:nth(3)").find(".inner").text(),
			isAppointmentBookingSupported: box.find(".row:nth(30)>div:nth(1)").find(".inner").text(),
			isOnlineProcessingAvailable: box.find(".row:nth(30)>div:nth(3)").find(".inner").text(),
			naturalPersonThemeClassification: box.find(".row:nth(31)>div:nth(1)").find(".inner").text(),
			legalPersonThemeClassification: box.find(".row:nth(31)>div:nth(3)").find(".inner").text(),
			rightsAndObligationsOfAdministrativeCounterparties: box.find(".row:nth(32)>div:nth(1)").find(".inner").text(),
			applicableObjectDescription: box.find(".row:nth(33)>div:nth(1)").find(".inner").text(),
			contentInvolved: box.find(".row:nth(34)>div:nth(1)").find(".inner").text()
		}
	};
}
//#endregion
//#region lib/routes/gov/hangzhou/zwfw.tsx
const renderDescription = ({ serviceInfo, applicationInfo, resultInfo, feeInfo, approvalInfo, deliveryInfo, agentService, otherInfo }) => renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "办事信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "服务对象" }),
		/* @__PURE__ */ jsx("td", { children: serviceInfo.serviceTarget }),
		/* @__PURE__ */ jsx("th", { children: "办理形式" }),
		/* @__PURE__ */ jsx("td", { children: serviceInfo.processingMethods })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "办理地点" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: serviceInfo.processingLocation
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "办理时间" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: serviceInfo.processingTime
	})] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "申请信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "受理条件" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: applicationInfo.acceptanceConditions
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "禁止性要求" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: applicationInfo.prohibitedRequirements
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "数量限制" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: applicationInfo.quantityRestrictions
	})] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "结果信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "审批结果名称" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: resultInfo.approvalResult
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "审批结果样本" }),
		/* @__PURE__ */ jsx("td", { children: resultInfo.approvalSample ? raw(resultInfo.approvalSample) : null }),
		/* @__PURE__ */ jsx("th", { children: "审批结果类型" }),
		/* @__PURE__ */ jsx("td", { children: resultInfo.approvalResultType })
	] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "收费信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "是否收费" }),
		/* @__PURE__ */ jsx("td", { children: feeInfo.isThereAFee }),
		/* @__PURE__ */ jsx("th", { children: "是否支持网上支付" }),
		/* @__PURE__ */ jsx("td", { children: feeInfo.isOnlinePaymentSupported })
	] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "审批信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "权力来源" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: approvalInfo.authoritySource
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "行使层级" }),
		/* @__PURE__ */ jsx("td", { children: approvalInfo.exerciseLevel }),
		/* @__PURE__ */ jsx("th", { children: "实施主体性质" }),
		/* @__PURE__ */ jsx("td", { children: approvalInfo.implementingEntity })
	] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "送达信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "是否支持物流快递" }),
		/* @__PURE__ */ jsx("td", { children: deliveryInfo.isLogisticsSupported }),
		/* @__PURE__ */ jsx("th", { children: "送达时限" }),
		/* @__PURE__ */ jsx("td", { children: deliveryInfo.deliveryTimeframe })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "送达方式" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: deliveryInfo.deliveryMethods
	})] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "中介服务信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "中介服务事项名称" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: agentService
	})] }),
	/* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("th", {
		colspan: "4",
		children: "其他信息"
	}) }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "部门名称" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.departmentName }),
		/* @__PURE__ */ jsx("th", { children: "事项类型" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.matterType })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "受理机构" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: otherInfo.acceptingInstitution
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "基本编码" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.basicCode }),
		/* @__PURE__ */ jsx("th", { children: "实施编码" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.implementationCode })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "通办范围" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.scopeOfGeneralHandling }),
		/* @__PURE__ */ jsx("th", { children: "办件类型" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.documentType })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "决定机构" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.decisionMakingAuthority }),
		/* @__PURE__ */ jsx("th", { children: "委托部门" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.delegatedDepartment })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "网上办理深度" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.onlineProcessingDepth }),
		/* @__PURE__ */ jsx("th", { children: "事项审查类型" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.reviewType })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "是否进驻政务大厅" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.isItAvailableInTheGovernmentServiceHall }),
		/* @__PURE__ */ jsx("th", { children: "是否支持自助终端办理" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.isSelfServiceTerminalProcessingSupported })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "是否实行告知承诺" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.isACommitmentSystemImplemented }),
		/* @__PURE__ */ jsx("th", { children: "权力属性" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.authorityAttribute })
	] }),
	/* @__PURE__ */ jsxs("tr", { children: [
		/* @__PURE__ */ jsx("th", { children: "是否支持预约办理" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.isAppointmentBookingSupported }),
		/* @__PURE__ */ jsx("th", { children: "是否网办" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.isOnlineProcessingAvailable })
	] }),
	/* @__PURE__ */ jsx("tr", { children: otherInfo.legalPersonThemeClassification ? /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("th", { children: "自然人主题分类" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.naturalPersonThemeClassification }),
		/* @__PURE__ */ jsx("th", { children: "法人主题分类" }),
		/* @__PURE__ */ jsx("td", { children: otherInfo.legalPersonThemeClassification })
	] }) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("th", { children: "法人主题分类" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: otherInfo.naturalPersonThemeClassification
	})] }) }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "行政相对人权利和义务" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: otherInfo.rightsAndObligationsOfAdministrativeCounterparties
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "适用对象说明" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: otherInfo.applicableObjectDescription
	})] }),
	/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "涉及的内容" }), /* @__PURE__ */ jsx("td", {
		colspan: "3",
		children: otherInfo.contentInvolved
	})] })
] }) }));
const route = {
	path: "/zwfw",
	categories: ["government"],
	example: "/gov/hangzhou/zwfw",
	features: {
		requireConfig: false,
		requirePuppeteer: true,
		antiCrawler: true,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	radar: [{ source: ["hangzhou.gov.cn/col/col1256349/index.html"] }],
	name: "政务服务公开",
	maintainers: ["flynncao"],
	handler,
	url: "hangzhou.gov.cn/col/col1256349/index.html"
};
async function handler() {
	const host = "https://www.hangzhou.gov.cn/col/col1256349/index.html";
	const response = await rofetch(host);
	const context = await outPlaywright();
	const link = host;
	const $ = load(response.replace("<script type=\"text/xml\">", "").replace("<\/script>", "").replaceAll("<recordset>", "").replaceAll("</recordset>", "").replaceAll("<record>", "").replaceAll("</record>", "").replaceAll("<![CDATA[", "").replaceAll("]]>", ""));
	const list = $("li.clearfix").toArray().map((item) => {
		item = $(item);
		const title = item.find("a").first().text();
		const time = timezone(parseDate(item.find("span").first().text(), "YYYY-MM-DD"), 8);
		const a = item.find("a").first().attr("href");
		return {
			title,
			link: new URL(a, host).href,
			pubDate: time
		};
	}).filter((item) => !item.title.includes("置顶"));
	const items = await Promise.all(list.map((item) => cache_default.tryGet(item.link, async () => {
		const host = new URL(item.link).hostname;
		if (host === "www.zjzwfw.gov.cn") {
			const $ = load(await crawler(item, context));
			item.category = $("meta[name=\"ColumnType\"]").attr("content");
			item.description = renderDescription(analyzer($(".item-left .item .bg_box")));
			item.author = "浙江政务服务网";
		} else {
			const $ = load((await got_default(item.link)).data);
			item.description = host === "police.hangzhou.gov.cn" ? $(".art-content .wz_con_content").html() : $(".article").html();
			item.author = $("meta[name=\"ContentSource\"]").attr("content");
			item.category = $("meta[name=\"ColumnType\"]").attr("content");
		}
		item.pubDate = $("meta[name=\"PubDate\"]").length ? timezone(parseDate($("meta[name=\"PubDate\"]").attr("content"), "YYYY-MM-DD HH:mm"), 8) : item.pubDate;
		return item;
	})));
	await context.close();
	return {
		allowEmpty: true,
		title: "杭州市人民政府-政务服务公开",
		link,
		item: items
	};
}
//#endregion
export { route };
