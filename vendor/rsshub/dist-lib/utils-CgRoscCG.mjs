import { t as rofetch } from "./ofetch-DleGqjHs.mjs";
import { t as cache_default } from "./cache-CNhdNI4T.mjs";
//#region lib/routes/oschina/utils.ts
const apiBaseUrl = "https://apiv1.oschina.net";
const baseUrl = "https://www.oschina.net";
const blogBaseUrl = "https://my.oschina.net";
const getBlog = (detailId) => rofetch(`${apiBaseUrl}/oschinapi/blog/detail`, { query: { id: detailId } });
const getBlogListCategory = () => cache_default.tryGet("oschina:blogListByCategory", async () => {
	return [
		...(await rofetch(`${baseUrl}/ApiHomeNew/blogListByCategory`)).result.map((item) => {
			const description = JSON.parse(item.catalog_params).description;
			return {
				id: item.id,
				name: item.name,
				description,
				logo: item.logo_url,
				apiPath: "/homeListByBlogTime"
			};
		}),
		{
			id: 0,
			name: "全部",
			apiPath: "/homeListByCategoryTime"
		},
		{
			id: 9998,
			name: "开源资讯",
			apiPath: "/homeListByNewType"
		},
		{
			id: 9999,
			name: "软件资讯",
			apiPath: "/homeListByNewType"
		}
	];
});
const getNews = (detailId) => rofetch(`${apiBaseUrl}/oschinapi/new/detail`, { query: { id: detailId } });
//#endregion
export { getBlogListCategory as a, getBlog as i, baseUrl as n, getNews as o, blogBaseUrl as r, apiBaseUrl as t };
