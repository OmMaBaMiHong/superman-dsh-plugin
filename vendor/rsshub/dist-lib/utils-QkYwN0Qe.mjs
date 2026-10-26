import { t as cache_default } from "./cache-CNhdNI4T.mjs";
import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/kuaidi100/utils.ts
const wwwid_key = "kuaidi100-wwwid";
const csrf_key = "kuaidi100-csrf";
const globacsrftoken_key = "kuaidi100-globacsrftoken";
const dasddocTitl_key = "kuaidi100-dasddocTitl";
const dasddocReferrer_key = "kuaidi100-dasddocReferrer";
const dasddocHref_key = "kuaidi100-dasddocHref";
const query_count = "kuaidi100-cookie-count";
const max_query_count = 30;
async function getCookie() {
	shouldUpdateCookie();
	let wwwid = await cache_default.get(wwwid_key);
	let csrf = await cache_default.get(csrf_key);
	let globacsrftoken = await cache_default.get(globacsrftoken_key);
	let dasddocTitl = await cache_default.get(dasddocTitl_key);
	let dasddocReferrer = await cache_default.get(dasddocReferrer_key);
	let dasddocHref = await cache_default.get(dasddocHref_key);
	if (!wwwid || !csrf || !dasddocTitl || !dasddocReferrer || !dasddocHref) {
		const set_cookie = (await got_default({
			method: "get",
			url: "https://www.kuaidi100.com/?from=appstore",
			headers: { Referer: "https://apps.apple.com/cn/app/%E5%BF%AB%E9%80%92100-%E5%8F%8C11%E5%AF%84%E4%BB%B6%E9%80%80%E8%B4%A7-%E4%B8%8A%E5%BF%AB%E9%80%92100/id458270120" }
		})).headers["set-cookie"];
		if (set_cookie) for (const e of set_cookie) switch (0) {
			case e.indexOf("WWWID"):
				wwwid = e.split(";", 1)[0];
				break;
			case e.indexOf("csrftoken"):
				csrf = e.split(";", 1)[0];
				break;
			case e.indexOf("globacsrftoken"):
				globacsrftoken = e.split(";", 1)[0];
				break;
			default: if (e.includes("dasddocTitle")) dasddocTitl = e.split(";", 1)[0];
			else if (e.includes("dasddocReferrer")) dasddocReferrer = e.split(";", 1)[0];
			else if (e.includes("dasddocHref")) dasddocHref = e.split(";", 1)[0];
		}
		cache_default.set(wwwid_key, wwwid, 600);
		cache_default.set(csrf_key, csrf, 600);
		cache_default.set(globacsrftoken_key, globacsrftoken, 600);
		cache_default.set(dasddocTitl_key, dasddocTitl, 600);
		cache_default.set(dasddocReferrer_key, dasddocReferrer, 600);
		cache_default.set(dasddocHref_key, dasddocHref, 600);
		shouldUpdateCookie(true);
	}
	return {
		wwwid,
		csrf,
		globacsrftoken,
		dasddocTitl,
		dasddocReferrer,
		dasddocHref
	};
}
function getCompanyList() {
	const key = `kuaidi100-company-name-${(/* @__PURE__ */ new Date()).toISOString().split("T", 1)[0]}`;
	return cache_default.tryGet(key, async () => {
		const wwwid = (await getCookie()).wwwid;
		let list = (await got_default({
			method: "post",
			url: "https://www.kuaidi100.com/company.do?method=js&t=201701051440",
			headers: {
				Referer: "https://www.kuaidi100.com/",
				Cookie: wwwid
			}
		})).body;
		try {
			list = list.slice(12).replaceAll("};", "}").replaceAll("'", "\"");
			list = JSON.parse(list);
			list = list.company;
		} catch {
			throw new Error("无法正确获取快递公司列表：请稍后重试");
		}
		return list;
	});
}
function shouldUpdateCookie(forcedUpdate = false) {
	if (forcedUpdate) cache_default.set(query_count, 0);
	else {
		const count = cache_default.get(query_count);
		if (count) if (count > max_query_count) {
			cache_default.set(query_count, 0);
			clearCookie();
		} else cache_default.set(query_count, count + 1);
		else cache_default.set(query_count, 1);
	}
}
function clearCookie() {
	cache_default.set(wwwid_key, null);
	cache_default.set(csrf_key, null);
}
var utils_default = {
	company: () => getCompanyList(),
	checkCode: async (number, id, phone) => {
		const company = (await getCompanyList()).find((c) => c.number === number);
		if (company) {
			if (number.includes("shunfeng") && !Number.isNaN(phone) && String(phone).length !== 4) return {
				status: false,
				message: "顺丰查询需要手机号后四位！",
				company
			};
			if (company.checkReg) return {
				status: true,
				regex: new RegExp(company.checkReg).test(id),
				company
			};
			return {
				status: true,
				regex: void 0,
				company
			};
		}
		return {
			status: false,
			message: "快递公司编号不受支持！",
			company: { name: "未知" }
		};
	},
	getQuery: async (number, id, phone) => {
		const query_key = `kuaidi100-query-${number}-${id}`;
		let query = await cache_default.get(query_key);
		const timestamp = Number.parseInt(Date.now() / 1e3);
		const lastTowMonth = Date.now() - 3600 * 24 * 60 * 1e3;
		const dateString = new Date(lastTowMonth).toLocaleDateString("ZH").split("/").join("");
		const queryMeta = encodeURIComponent(JSON.stringify({
			date: dateString,
			nums: [id]
		}));
		if (query) query = JSON.parse(query);
		else {
			const cookie = await getCookie();
			query = (await got_default({
				method: "get",
				url: `https://www.kuaidi100.com/query?type=${number}&postid=${id}&temp=${Math.random()}&phone=${phone ?? ""}`,
				headers: {
					Referer: "https://www.kuaidi100.com/",
					"Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7",
					Cookie: `${cookie.globacsrftoken}; ${cookie.csrf}; ${cookie.wwwid}; ${cookie.dasddocHref}; ${cookie.dasddocReferrer}; ${cookie.dasddocTitl}; addcom=${number}; addnu=${id}; snt_query_meta=${queryMeta}; sortStatus=0; Hm_lpvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp}; Hm_lvt_22ea01af58ba2be0fec7c11b25e88e6c=${timestamp - 1642}`
				}
			})).data;
			if (query.status === "200") {
				if (query.data && query.data[0].context === "查无结果") {
					clearCookie();
					throw new Error("暂时无法获取快递信息，请稍后重试...");
				}
				if (query.ischeck === "0") cache_default.set(query_key, query, 180);
				else cache_default.set(query_key, query);
			} else {
				cache_default.set(query_key, query);
				throw new Error(`[${query.status}]信息有误，请重新检查后订阅：${query.message}`);
			}
		}
		return query;
	}
};
//#endregion
export { utils_default as t };
