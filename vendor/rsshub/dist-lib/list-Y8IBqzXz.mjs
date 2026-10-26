import { t as got_default } from "./got-Dnzt41dd.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { t as isValidHost } from "./valid-host-BH9Dd2Pf.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
import { CookieJar } from "tough-cookie";
//#region lib/routes/591/list.tsx
const cookieJar = new CookieJar();
const client = got_default.extend({ cookieJar });
function appendRentalAPIParams(urlString) {
	const searchParams = new URLSearchParams(urlString);
	searchParams.set("is_format_data", "1");
	searchParams.set("is_new_list", "1");
	searchParams.set("type", "1");
	return searchParams.toString();
}
async function getToken() {
	const csrfToken = load(await client("https://rent.591.com.tw").text())("meta[name=\"csrf-token\"]").attr("content");
	if (!csrfToken) throw new Error("CSRF token not found");
	return csrfToken;
}
async function getHouseList(houseListURL) {
	const csrfToken = await getToken();
	const { data: { data: houseList } } = await client({
		url: houseListURL,
		headers: { "X-CSRF-TOKEN": csrfToken }
	}).json();
	return houseList;
}
/**

@typedef {object} House
@property {string} title - The title of the house.
@property {string} type - The type of the house.
@property {number} post_id - The post id of the house.
@property {string} kind_name - The name of the kind of the house.
@property {string} room_str - A string representation of the number of rooms in the house.
@property {string} floor_str - A string representation of the floor of the house.
@property {string} community - The community the house is located in.
@property {string} price - The price of the house.
@property {string} price_unit - The unit of the price of the house.
@property {string[]} photo_list - A list of photos of the house.
@property {string} section_name - The name of the section where the house is located.
@property {string} street_name - The name of the street where the house is located.
@property {string} location - The location of the house.
@property {RentTagItem[]} rent_tag - An array of rent tags for the house.
@property {string} area - The area of the house.
@property {string} role_name - The name of the role of the house.
@property {string} contact - The contact information for the house.
@property {string} refresh_time - The time the information about the house was last refreshed.
@property {number} yesterday_hit - The number of hits the house received yesterday.
@property {number} is_vip - A flag indicating whether the house is VIP or not.
@property {number} is_combine - A flag indicating whether the house is combined or not.
@property {number} hurry - A flag indicating whether there is a hurry for the house.
@property {number} is_socail - A flag indicating whether the house is social or not.
@property {Surrounding} surrounding - The surrounding area of the house.
@property {string} discount_price_str - A string representation of the discounted price of the house.
@property {number} cases_id - The id of the cases for the house.
@property {number} is_video - A flag indicating whether there is a video for the house.
@property {number} preferred - A flag indicating whether the house is preferred or not.
@property {number} cid - The id of the house.
*/
/**

@typedef {object} RentTagItem
@property {string} id - The id of the rent tag item.
@property {string} name - The name of the rent tag item.
*/
/**

@typedef {object} Surrounding
@property {string} type - The type of the surrounding.
@property {string} desc - The description of the surrounding.
@property {string} distance - The distance to the surrounding.
*/
const renderHouse = (house) => {
	const photoList = house.photo_list.slice(1);
	return renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx("img", {
			src: house.photo_list[0],
			style: "margin-bottom: 20px;"
		}),
		/* @__PURE__ */ jsxs("table", { children: [
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "類型" }), /* @__PURE__ */ jsx("td", { children: house.kind_name })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "坪數" }), /* @__PURE__ */ jsxs("td", { children: [house.area, " 坪"] })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "樓層" }), /* @__PURE__ */ jsx("td", { children: house.floor_str })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "社區" }), /* @__PURE__ */ jsx("td", { children: house.community })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "地點" }), /* @__PURE__ */ jsx("td", { children: house.location })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "更新時間" }), /* @__PURE__ */ jsx("td", { children: house.refresh_time })] }),
			/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("td", { children: "標籤" }), /* @__PURE__ */ jsx("td", { children: house.rent_tag.map((tag) => /* @__PURE__ */ jsx("code", { children: tag.name })) })] })
		] }),
		/* @__PURE__ */ jsxs("p", { children: ["更多資訊請見 ", /* @__PURE__ */ jsx("a", {
			href: `https://rent.591.com.tw/home/${house.post_id}`,
			children: "591 租屋"
		})] }),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("h3", { children: "更多圖片" }),
		/* @__PURE__ */ jsx("br", {}),
		/* @__PURE__ */ jsx("div", {
			id: "more-pictures",
			children: photoList.map((photo) => /* @__PURE__ */ jsx("img", {
				src: photo,
				style: "margin-bottom: 20px;"
			}))
		})
	] }));
};
const route = {
	path: "/:country/rent/:query?",
	categories: ["other"],
	example: "/591/tw/rent/order=posttime&orderType=desc",
	parameters: {
		country: "Country code. Only tw is supported now",
		query: "Query Parameters"
	},
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "Rental house",
	maintainers: ["Yukaii"],
	handler,
	description: `::: tip
Copy the URL of the 591 filter housing page and remove the front part \`https://rent.591.com.tw/?\`, you will get the query parameters.
:::`
};
async function handler(ctx) {
	const query = ctx.req.param("query") ?? "";
	const country = ctx.req.param("country") ?? "tw";
	if (!isValidHost(country) && country !== "tw") throw new InvalidParameterError("Invalid country codes. Only \"tw\" is supported now.");
	/** @type {House[]} */
	const houses = await getHouseList(`https://rent.591.com.tw/home/search/rsList?${appendRentalAPIParams(query)}`);
	const queryUrl = `https://rent.591.com.tw/?${query}`;
	const items = houses.map((house) => {
		const { title, post_id, price, price_unit } = house;
		const itemUrl = `https://rent.591.com.tw/home/${post_id}`;
		return {
			title: `${title} - ${price} ${price_unit}`,
			description: renderHouse(house),
			link: itemUrl
		};
	});
	ctx.set("json", { houses });
	return {
		title: "591 租屋 - 自訂查詢",
		link: queryUrl,
		description: `591 租屋 - 自訂查詢, query: ${query}`,
		item: items
	};
}
//#endregion
export { route };
