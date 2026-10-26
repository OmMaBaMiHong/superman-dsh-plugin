import { n as parseRelativeDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
import { load } from "cheerio";
//#region lib/routes/gov/moa/moa.ts
const hostUrl = "http://www.moa.gov.cn/";
const hostUrlObj = new URL(hostUrl);
const route = {
	path: "/suburl/:suburl{.+}",
	categories: ["government"],
	example: "/gov/moa/suburl/gk/zcjd/",
	radar: [{
		source: ["moa.gov.cn/"],
		target: "/suburl/:suburl"
	}],
	parameters: { suburl: "下级目录，请使用最下级的目录" },
	name: "新闻",
	maintainers: ["Origami404", "lyqluis"],
	handler,
	url: "moa.gov.cn/",
	description: `更多例子：

- \`农业农村部动态\`的网页链接是\`http://www.moa.gov.cn/xw/zwdt/\`, 对应的\`suburl\`是\`xw/zwdt\`
- \`财务公开\`的网页链接是\`http://www.moa.gov.cn/gk/cwgk_1/\`, 对应的\`suburl\`是\`gk/cwgk_1\`
- 像[政策法规](http://www.moa.gov.cn/gk/zcfg/)这种页面 (\`http://www.moa.gov.cn/gk/zcfg/\`), 它**不是**一个合法的分类目录，它是\`法律\`, \`行政法规\`, \`部门规章\`等一堆栏目的集合，这时候请点开对应栏目的\`更多 >>\`进入栏目的最下级目录，再根据上面的规则提取\`suburl\`
- 特别地，\`图片新闻\`对应的\`suburl\`为\`xw/tpxw/\`, \`最新公开\`对应的\`suburl\`为\`govpublic\`, \`数据>最新发布\`对应的\`suburl\`为\`sj/zxfb\``
};
async function handler(ctx) {
	const rawSuburl = ctx.req.param("suburl");
	const suburl = rawSuburl.slice(-1) === "/" ? rawSuburl : rawSuburl + "/";
	if (suburl === "xw/tpxw/") return await dealChannel(suburl, {
		channelTitleSelector: ".pub-media2-head",
		listSelector: ".tupian_list li",
		titleSelector: "a[class=\"block w_fill ellipsis adc ahc\"]",
		dateSelector: "span"
	});
	if (suburl.startsWith("sj/zxfb")) return await dealLatestDataChannel();
	if (suburl.startsWith("gk")) return await dealChannel(suburl, {
		channelTitleSelector: "title",
		listSelector: ".commonlist li",
		titleSelector: "a",
		dateSelector: "span"
	});
	if (suburl.startsWith("govpublic")) return await dealChannel("govpublic/1/index.htm", {
		channelTitleText: "最新公开",
		listSelector: ".commonlist li",
		titleSelector: "a",
		dateSelector: "span"
	});
	return await dealChannel(suburl, {
		channelTitleSelector: ".pub-media1-head-title",
		listSelector: ".ztlb",
		titleSelector: "a",
		dateSelector: "span"
	});
}
async function dealChannel(suburl, selectors) {
	const { channelTitleSelector, listSelector, titleSelector, dateSelector, channelTitleText } = selectors;
	const url = suburl.startsWith("http") ? suburl : hostUrl + suburl;
	const $ = load((await got_default.get(url)).data);
	const channelTitle = channelTitleText ?? $(channelTitleSelector).text();
	const pageInfos = $(listSelector).toArray().map((e) => {
		const element = $(e);
		const titleElement = element.find(titleSelector);
		const title = titleElement.text();
		const [link, pageType] = dealLink(titleElement, url);
		return {
			pageType,
			title,
			link,
			pubDate: parseRelativeDate(element.find(dateSelector).text().trim())
		};
	});
	const items = await Promise.all(pageInfos.map(async (item) => {
		const link = item.link;
		const cacheIn = await cache_default.get(link);
		if (cacheIn) return JSON.parse(cacheIn);
		if (item.pageType === "normal") item = await dealNormalPage(link, item);
		else if (item.pageType === "govpublic") item = await dealGovpublicPage(link, item);
		else item.description = `外部链接：${item.link}`;
		cache_default.set(link, JSON.stringify(item));
		return item;
	}));
	return {
		title: `中华人民共和国农业农村部 - ${channelTitle}`,
		link: url,
		item: items
	};
}
async function dealNormalPage(link, item) {
	const $ = load((await got_default.get(link)).data);
	if (link.includes("zbft")) {
		const pageHeader = $(".nybzb").html() ?? "";
		const pics = $(".tpsl").html() ?? "";
		const content = $(".wzsl").html() ?? "";
		item.description = pageHeader + pics + content;
		return item;
	}
	const metaElements = $(".bjjMAuthorBox span.dc_2").toArray();
	item.author = `${$(metaElements[1]).text()} ${$(metaElements[2]).text()}`;
	const exactTime = $(metaElements[0]).text();
	const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(exactTime);
	const timeMatch = /\d{2}:\d{2}/.exec(exactTime);
	item.pubDate = parseRelativeDate(`${dateMatch[0]} ${timeMatch[0]}`);
	item.description = $(".arc_body").html();
	return item;
}
async function dealGovpublicPage(link, item) {
	if (item.link.endsWith(".pdf")) return item;
	const $ = load((await got_default.get(link)).data);
	const body = $(".gsj_htmlcon_bot");
	const [, year, month, date] = $(".pubtime").text().match(/：(\d{4})[|年-](\d{1,2})[|月-](\d{1,2})日?/);
	const [, author] = $(".pubtime.source")?.text()?.match(/：(.+)/) ?? [null, ""];
	if (year && month && date) item.pubDate = `${year}-${month}-${date}`;
	item.author = author;
	item.description = body.html();
	return item;
}
async function dealLatestDataChannel() {
	const res = await got_default({
		url: "http://zdscxx.moa.gov.cn:8080/nyb/getMessages",
		method: "post",
		json: {
			page: 1,
			rows: 20,
			type: "最新发布",
			isLatestMessage: true
		}
	});
	return {
		title: "中华人民共和国农业农村部 - 数据 - 最新发布",
		link: "http://zdscxx.moa.gov.cn:8080/nyb/pc/messageList.jsp",
		item: await Promise.all(res.data.result.table.map((item) => {
			const { date, id } = item;
			item.pubDate = date;
			const link = item.link = `http://zdscxx.moa.gov.cn:8080/nyb/pc/messageView.jsp?id=${id}`;
			return cache_default.tryGet(link, async () => {
				const { content, source } = await getLatestDataArticleDetail(id);
				item.description = content;
				item.author = source;
				return item;
			});
		}))
	};
}
async function getLatestDataArticleDetail(id) {
	return (await got_default({
		url: "http://zdscxx.moa.gov.cn:8080/nyb/getMessagesById",
		method: "post",
		form: { id }
	})).data.result;
}
function dealLink(element, url) {
	const rawLink = element.attr("href");
	const { host, href } = new URL(rawLink, url);
	let pageType;
	if (host === hostUrlObj.host) pageType = href.includes("gk") || href.includes("govpublic") ? "govpublic" : "normal";
	else pageType = "outside";
	return [href, pageType];
}
//#endregion
export { route };
