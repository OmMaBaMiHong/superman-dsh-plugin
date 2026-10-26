import { t as got_default } from "./got-Dnzt41dd.mjs";
import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { renderToString } from "hono/jsx/dom/server";
//#region lib/routes/jd/price.tsx
const route = {
	path: "/price/:id",
	categories: ["shopping"],
	example: "/jd/price/526835",
	parameters: { id: "商品 id，可在商品详情页 URL 中找到" },
	features: {
		requireConfig: false,
		requirePuppeteer: false,
		antiCrawler: false,
		supportBT: false,
		supportPodcast: false,
		supportScihub: false
	},
	name: "商品价格",
	maintainers: ["nczitzk"],
	handler,
	description: `::: tip
如商品 \`https://item.jd.com/526835.html\` 中的 id 为 \`526835\`，所以路由为 [\`/jd/price/526835\`](https://rsshub.app/jd/price/526835)
:::`
};
async function handler(ctx) {
	const id = ctx.req.param("id");
	const currentUrl = `https://item.jd.com/${id}.html`;
	const data = (await got_default({
		method: "get",
		url: `http://p.3.cn/prices/mgets?skuIds=J_${id}`
	})).data[0];
	return {
		title: `京东商品价格 - ${(await got_default({
			method: "get",
			url: currentUrl
		})).data.match(/name: '(.*?)'/)[1]}`,
		link: currentUrl,
		item: [{
			guid: data.p,
			title: data.p,
			link: currentUrl,
			description: renderToString(/* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsxs("p", { children: ["目前价格：", /* @__PURE__ */ jsx("b", { children: data.p })] }),
				/* @__PURE__ */ jsxs("p", { children: ["指导价：", /* @__PURE__ */ jsx("b", { children: data.op })] }),
				/* @__PURE__ */ jsxs("p", { children: ["最高价：", /* @__PURE__ */ jsx("b", { children: data.m })] })
			] }))
		}]
	};
}
//#endregion
export { route };
