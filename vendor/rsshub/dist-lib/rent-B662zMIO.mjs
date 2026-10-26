import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as parseDate } from "./parse-date-Cr0wQjV_.mjs";
import { t as InvalidParameterError } from "./invalid-parameter-CGxhjomn.mjs";
import { n as getCitys, r as getDistricts, t as baseUrl } from "./utils-6oRwF0ha.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/wellcee/rent.tsx
const render = (item) => renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
	"租金: ",
	item.rent,
	/* @__PURE__ */ jsx("br", {}),
	item.dailyRent ? /* @__PURE__ */ jsxs(Fragment, { children: [
		"日租: ",
		item.dailyRent,
		/* @__PURE__ */ jsx("br", {})
	] }) : null,
	/* @__PURE__ */ jsx("br", {}),
	item.video ? /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("video", {
		controls: true,
		preload: "metadata",
		poster: `${item.video}?vframe/png/offset/0`,
		children: /* @__PURE__ */ jsx("source", {
			src: item.video,
			type: "video/mp4"
		})
	}), /* @__PURE__ */ jsx("br", {})] }) : null,
	item.imgs?.length ? item.imgs.map((img) => /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("img", { src: img }), /* @__PURE__ */ jsx("br", {})] })) : null
] }));
const route = {
	path: "/rent/:city/:district?",
	example: "/wellcee/rent/北京",
	parameters: {
		city: "城市",
		district: "地区"
	},
	name: "租房信息",
	maintainers: ["TonyRL"],
	handler,
	url: "www.wellcee.com",
	description: "支持的城市可以通过 [/wellcee/support-city](https://rsshub.app/wellcee/support-city) 获取"
};
async function handler(ctx) {
	const { city, district = "" } = ctx.req.param();
	const cityInfo = (await getCitys()).find((item) => item.chCityName === city);
	if (!cityInfo) throw new InvalidParameterError("Invalid city");
	let districtInfo;
	if (district) {
		const d = (await getDistricts(cityInfo.id)).find((item) => item.name === district);
		if (!d) throw new InvalidParameterError("Invalid district");
		districtInfo = d;
	}
	const items = (await rofetch(`${baseUrl}/api/house/filter`, {
		method: "POST",
		body: {
			districtIds: districtInfo?.id ? [districtInfo.id] : [],
			subways: [],
			rentTypeIds: [],
			timeTypeIds: [],
			price: [],
			tagTypeIds: [],
			cityId: cityInfo.id,
			lang: 1,
			pn: 1
		}
	})).data.list.map((item) => ({
		title: item.address,
		link: `${baseUrl}/rent-apartment/${item.id}`,
		description: render(item),
		pubDate: parseDate(item.loginTime, "X"),
		author: item.userInfo.name,
		category: [...item.tags, ...item.typeTags]
	}));
	return {
		title: `${city}${districtInfo?.name ?? ""}租房信息 - Wellcee`,
		description: `${cityInfo.statics.online_text} ${cityInfo.statics.total_text}`,
		image: cityInfo.icon,
		icon: cityInfo.icon,
		logo: cityInfo.icon,
		link: `${baseUrl}/rent-apartment/${cityInfo.cityName}/list?cityId=${cityInfo.id}&lang=zh${district ? `#districtIds=${districtInfo?.id}` : ""}`,
		item: items
	};
}
//#endregion
export { route };
