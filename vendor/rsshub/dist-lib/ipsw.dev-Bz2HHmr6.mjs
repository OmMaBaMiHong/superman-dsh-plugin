import { t as got_default } from "./got-Dnzt41dd.mjs";
import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { load } from "cheerio";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/ipsw.dev/index.tsx
const route = {
	path: "/index/:productID",
	categories: ["program-update"],
	example: "/ipsw.dev/index/iPhone16,1",
	parameters: { productID: "Product ID" },
	name: "Apple latest beta firmware",
	maintainers: ["RieN7"],
	handler
};
async function handler(ctx) {
	const { productID } = ctx.req.param();
	const link = `https://ipsw.dev/product/version/${productID}`;
	const $ = load((await got_default({
		method: "get",
		url: link,
		headers: { Referer: "https://ipsw.dev/" }
	})).data);
	const productName = $("#IdentifierModal > div > div > div.modal-body > p:nth-child(1) > em").text();
	const list = $(".firmware").toArray().map((element) => {
		const ele = $(element);
		const version = ele.find("td:nth-child(1) > div > div > strong").text();
		const build = ele.find("td:nth-child(1) > div > div > div > code").text();
		const date = ele.find("td:nth-child(3)").text();
		const size = ele.find("td:nth-child(4)").text();
		return {
			title: `${productName} - ${version}`,
			link: `https://ipsw.dev/download/${productID}/${build}`,
			pubDate: new Date(date).toLocaleDateString(),
			guid: build,
			description: renderToString(/* @__PURE__ */ jsx("table", { children: /* @__PURE__ */ jsxs("tbody", { children: [
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Version" }), /* @__PURE__ */ jsx("td", { children: version })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Build" }), /* @__PURE__ */ jsx("td", { children: build })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Released" }), /* @__PURE__ */ jsx("td", { children: date })] }),
				/* @__PURE__ */ jsxs("tr", { children: [/* @__PURE__ */ jsx("th", { children: "Size" }), /* @__PURE__ */ jsx("td", { children: size })] })
			] }) }))
		};
	});
	return {
		title: `${productName} Released`,
		link,
		item: list
	};
}
//#endregion
export { route };
