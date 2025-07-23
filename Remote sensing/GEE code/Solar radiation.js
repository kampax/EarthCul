/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var radiation = ee.Image("projects/ee-elaurenyoung/assets/GHI");
/***************************************************************************************
 * Project: EarthCul
 * Author: Carlos Javier Navarro
 * Email: carlosnavarro@ugr.es
 * Description: Code to download solar radiation maps (Global Horizontal Irradiation - GHI
 *              and Direct Normal Irradiation - DNI) from the Global Solar Atlas project.
 *              Data are clipped to selected national park AOIs from the "BBs_EarthCul" 
 *              feature collection.
 * Data source:
 * - Global Solar Atlas (GSA)
 *   https://gee-community-catalog.org/projects/gsa/
 *   https://globalsolaratlas.info/support/faq
 * 
 * Notes:
 * - GHI and DNI refer to irradiance on horizontal and sun-facing surfaces respectively.
 * - Higher DIF/GHI ratio indicates more cloud cover or atmospheric moisture.
 * - Uses matplotlib plasma palette for visualization.
 * - Exports GeoTIFF images to Google Drive organized by park-specific folders.
 ***************************************************************************************/

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
var parque = "SierraNevada" ;
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI);
// Select the dataset
var dni = ee.Image("projects/earthengine-legacy/assets/projects/sat-io/open-datasets/global_solar_atlas/dni_LTAy_AvgDailyTotals");
var ghi = ee.Image("projects/earthengine-legacy/assets/projects/sat-io/open-datasets/global_solar_atlas/ghi_LTAy_AvgDailyTotals");
//Visualitation
var palettes = require('users/gena/packages:palettes');
Map.addLayer(dni,{min:0.8,max:10,palette:palettes.matplotlib.plasma[7]},'DNI');
Map.addLayer(ghi, {min:0.8,max:10,palette:palettes.matplotlib.plasma[7]},'GHI');
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Clip   Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
ghi = ghi.clip(AOI);
dni = dni.clip(AOI);
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
var projection = ghi.select('b1').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;
print(ghi.projection().nominalScale());
Export.image.toDrive({
	image:ghi,
	description:'ghi',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 278.29872698318394,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});
Export.image.toDrive({
	image:dni,
	description:'dni',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 278.29872698318394,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});