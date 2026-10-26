import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as timezone } from "./timezone-BBvDwS_3.mjs";
import { load } from "cheerio";
//#region lib/routes/whu/rsgis.ts
const baseUrl = "https://rsgis.whu.edu.cn";
const categoryMap = {
	index: {
		name: "首页",
		path: ""
	},
	xyxw: {
		name: "学院新闻",
		path: "xyxw1",
		sub: {
			xyyw: {
				name: "学院要闻",
				path: "xyyw2"
			},
			hzjl: {
				name: "合作交流",
				path: "hzjl"
			},
			mtjj: {
				name: "媒体聚焦",
				path: "mtjj"
			},
			xgyw: {
				name: "学工要闻",
				path: "xgyw"
			}
		}
	},
	kxyj: {
		name: "科学研究",
		path: "kxyj",
		sub: {
			xsbg: {
				name: "学术报告",
				path: "xsbg"
			},
			xsjl: {
				name: "学术交流",
				path: "xsjl"
			},
			kycg: {
				name: "学术成果",
				path: "kycg"
			},
			sbxx: {
				name: "申报信息",
				path: "sbxx"
			}
		}
	},
	tzgg: {
		name: "通知公告",
		path: "tzgg1",
		sub: {
			xytz: {
				name: "学院通知",
				path: "xytz"
			},
			jxdt: {
				name: "教学动态",
				path: "jxdt"
			},
			xsdt: {
				name: "学术动态",
				path: "xsdt"
			},
			rcyj: {
				name: "人才引进",
				path: "rcyj"
			}
		}
	}
};
/**
* Check whether the link is external.
*
* @param link Post link
* @returns Whether or not weixin post
*/
function checkExternal(link) {
	return !!link.match(/^((http:\/\/)|(https:\/\/))?([\dA-Za-z]([\dA-Za-z-]{0,61}[\dA-Za-z])?\.)+[A-Za-z]{2,6}(\/)/)?.length;
}
/**
* Get information from a list of paired link and date.
*
* @param element
* @returns A list of RSS meta node.
*/
function parseListLinkDateItem(element, currentUrl) {
	const linkElement = element.find("a").first();
	const title = linkElement.text();
	const href = linkElement.attr("href");
	if (href === void 0) throw new Error("Cannot get link");
	const external = checkExternal(href);
	return {
		title,
		link: external ? href : new URL(href, currentUrl).href,
		pubDate: timezone(parseDate(element.find("div.date1").first().text(), "YYYY-MM-DD"), 8),
		description: title,
		external
	};
}
async function getDetail(item) {
	const link = item.link;
	return link ? await cache_default.tryGet(`whu:rsgis:${link}`, async () => {
		if (item.external) item.description = `<a href="${link}">阅读原文</a>`;
		else {
			const $ = load(await rofetch(link));
			const title = $("div.content div.content_title h1").first().text();
			const content = $("div.content div.v_news_content").first().html();
			item.title = title;
			item.description = content || "";
		}
		return item;
	}) : item;
}
/**
* Process index type.
*/
async function handleIndex() {
	const $ = load(await rofetch(`${baseUrl}/index.htm`));
	const xyxwList = $("div.main1 > div.newspaper:nth-child(1) > div.newspaper_list > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	const tzggList = $("div.main1 > div.newspaper:nth-child(2) > div.newspaper_list > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	const xsdtList = $("div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(1) > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	const xsjzList = $("div.main3 div.inner > div.newspaper:nth-child(1) > ul.newspaper_list2 > li:nth-child(2) > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	const jxdtList = $("div.main3 div.inner > div.newspaper:nth-child(2) > div.newspaper_list2 > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	const xgdtList = $("div.main3 div.inner > div.newspaper:nth-child(3) > div.newspaper_list2 > ul > li").toArray().map((item) => parseListLinkDateItem($(item), baseUrl));
	return await Promise.all([
		...xyxwList,
		...tzggList,
		...xsdtList,
		...xsjzList,
		...jxdtList,
		...xgdtList
	].map(async (item) => await getDetail(item)));
}
/**
* Process non-index types.
*
* @param type Level 1 type
* @param sub Level 2 type
*/
async function handlePostList(type, sub) {
	let urlList = [];
	const category = categoryMap[type];
	if (sub === "all") {
		const subMap = category.sub;
		urlList = Object.values(subMap).map((value) => {
			const subtype = value;
			return {
				url: `${baseUrl}/${category.path}/${subtype.path}.htm`,
				base: `${baseUrl}/${category.path}`
			};
		});
	} else if (Object.hasOwn(category.sub, sub)) urlList.push({
		url: `${baseUrl}/${category.path}/${category.sub[sub].path}.htm`,
		base: `${baseUrl}/${category.path}`
	});
	else throw new Error("No such sub type.");
	const urlPosts = await Promise.all(urlList.map(async (url) => {
		const $ = load(await rofetch(url.url));
		return $("div.neiinner > div.nav_right > div.right_inner > div.list > ul > li").toArray().map((item) => parseListLinkDateItem($(item), url.base));
	}));
	return await Promise.all(urlPosts.flat().map(async (item) => await getDetail(item)));
}
const route = {
	path: "/rsgis/:type/:sub?",
	categories: ["university"],
	example: "/whu/rsgis/index",
	parameters: {
		type: "栏目，详见表格",
		sub: "子栏目。当 `type` 为 `index` 的时候不起效；当 `type` 为其他合法值时，默认为 `all` 表示所有子类，其他可选项见下表。"
	},
	radar: [{
		source: ["rsgis.whu.edu.cn/index.htm"],
		target: "/rsgis/index"
	}],
	name: "武汉大学遥感信息工程学院",
	maintainers: ["HPDell"],
	description: `|  分类名  | \`type\` 值 |  子类名  | \`sub\` 值 |
| :------: | :-------- | :------: | :------- |
|   首页   | \`index\`   |          |          |
| 学院新闻 | \`xyxw\`    |   全部   | \`all\`    |
|          |           | 学院要闻 | \`xyyw\`   |
|          |           | 合作交流 | \`hzjl\`   |
|          |           | 媒体聚焦 | \`mtjj\`   |
|          |           | 学工要闻 | \`xgyw\`   |
| 科学研究 | \`kxyj\`    |   全部   | \`all\`    |
|          |           | 学术报告 | \`xsbg\`   |
|          |           | 学术交流 | \`xsjl\`   |
|          |           | 学术成果 | \`kycg\`   |
|          |           | 申报信息 | \`sbxx\`   |
| 通知公告 | \`tzgg\`    |   全部   | \`all\`    |
|          |           | 学院通知 | \`xytz\`   |
|          |           | 教学动态 | \`jxdt\`   |
|          |           | 学术动态 | \`xsdt\`   |
|          |           | 人才引进 | \`rcyj\`   |`,
	handler: async (ctx) => {
		const { type = "index", sub = "all" } = ctx.req.param();
		let itemList;
		switch (type) {
			case "index":
				itemList = await handleIndex();
				break;
			case "xyxw":
			case "kxyj":
			case "tzgg":
				itemList = await handlePostList(type, sub);
				break;
			default: throw new Error("No such type");
		}
		return {
			title: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
			link: baseUrl,
			description: `${categoryMap[type].name} - 武汉大学遥感信息工程学院`,
			item: itemList
		};
	}
};
//#endregion
export { route };
