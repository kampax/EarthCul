/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var radiation = ee.Image("projects/ee-elaurenyoung/assets/GHI");
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//Code to download solar radiation maps obtained from the Global Solar Atlas project
//https://gee-community-catalog.org/projects/gsa/
// Information: https://globalsolaratlas.info/support/faq
// GLOBAL SOLAR ATLAS 
//-- GHI, Global Horizontal Irradiation
//--DNI, Direct Normal Irradiation
//--DIF, Diffuse Horizontal Irradiation
//GHI and DIF are referred to a surface horizontal to the ground, while DNI is referred to a surface perpendicular to the Sun. Higher values of DIF/GHI ratio represent a higher occurrence of clouds, higher atmospheric pollution or higher water vapor content.
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