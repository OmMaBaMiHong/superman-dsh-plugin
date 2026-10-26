import { t as got_default } from "./got-Dnzt41dd.mjs";
//#region lib/routes/tencent/news/coronavirus/utils.ts
/**
*
*
* @author CaoMeiYouRen
* @date 2022-12-18
* @param {string[]} [modules=[]] localCityNCOVDataList,diseaseh5Shelf,nowConfirmStatis,provinceCompare,FAutoforeignList,FAutoCountryConfirmAdd,WomWorld,WomAboard,VaccineTopData
*/
const getData = async (modules = []) => {
	return (await got_default("https://api.inews.qq.com/newsqa/v1/query/inner/publish/modules/list?modules=" + modules.join(","))).data;
};
//#endregion
export { getData as t };
