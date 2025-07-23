/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var canopy_vis = {"min":0,"max":50,"palette":["#010005","#150b37","#3b0964","#61136e","#85216b","#a92e5e","#cc4248","#e75e2e","#f78410","#fcae12","#f5db4c","#fcffa4"]},
    sd_vis = {"min":0,"max":15,"palette":["#0d0406","#241628","#36274d","#403a76","#3d5296","#366da0","#3488a6","#36a2ab","#44bcad","#6dd3ad","#aee3c0","#def5e5"]},
    canopy_height = ee.Image("users/nlang/ETH_GlobalCanopyHeight_2020_10m_v1"),
    standard_deviation = ee.Image("users/nlang/ETH_GlobalCanopyHeightSD_2020_10m_v1");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

/***************************************************************************************
 * Project: EarthCul
 * Author: Carlos Javier Navarro
 * Email: carlosnavarro@ugr.es
 * Description: Code to download canopy height layers and their associated standard deviation
 *              at 10-meter resolution. The layers are extracted for Areas of Interest (AOIs)
 *              corresponding to national parks defined in the "BBs_EarthCul" feature collection.
 * Data source: Lang et al. 2022 - "A high-resolution canopy height model of the Earth"
 *              arXiv:2204.08322
 * Data URL: https://gee-community-catalog.org/projects/canopy/
 * 
 * Notes:
 * - The code allows selecting the park of interest to clip the images.
 * - Images are exported to Google Drive in park-specific folders.
 ***************************************************************************************/



var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
/////////////////////////
// Select the park
/////////////////////////
// Aiguestortes
// Ordesa
// Peneda
// Guadarrama
// Picos
// SierraNieves
// SierraNevada
// Teide
var parque = "Teide" ;
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.addLayer(canopy_height, canopy_vis, 'Canopy top height');
Map.addLayer(standard_deviation, sd_vis, 'Standard deviation');
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Clip   Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
canopy_height = canopy_height.clip(AOI);
standard_deviation = standard_deviation.clip(AOI);
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
var projection = canopy_height.select('b1').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;
print(canopy_height.projection().nominalScale());
Export.image.toDrive({
	image:canopy_height,
	description:'canopy_height',
	folder: 'GEE'+parque,
	region: AOI,
	scale: 10,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});