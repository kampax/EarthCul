/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var dataset = ee.Image("CIESIN/GPWv411/GPW_Population_Density/gpw_v4_population_density_rev11_2020_30_sec");
/***** End of imports. If edited, may not auto-convert in the playground. *****/

/***************************************************************************************
 * Project: EarthCul
 * Author: Carlos Javier Navarro
 * Email: carlosnavarro@ugr.es
 * Description: Code to download population density and population count maps from the
 *              Gridded Population of the World Version 4 (GPWv4) dataset, with a pixel
 *              resolution of approximately 927.67 meters. The data are clipped to the
 *              selected national park AOI from the "BBs_EarthCul" feature collection.
 * Data source:
 * - CIESIN GPWv411 Population Density and Count
 *   https://developers.google.com/earth-engine/datasets/catalog/CIESIN_GPWv411_GPW_Population_Density
 * 
 * Notes:
 * - Includes visualization palettes for density and count layers.
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
var parque = "Teide" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI, 10);
// Select dataset
var dataset = ee.Image('CIESIN/GPWv411/GPW_Population_Density/gpw_v4_population_density_rev11_2020_30_sec');
print(dataset);
var pop_density = dataset.select('population_density');
var pop_density_vis = {
  'max': 1000.0,
  'palette': [
    'ffffe7',
    'FFc869',
    'ffac1d',
    'e17735',
    'f2552c',
    '9f0c21'
  ],
  'min': 200.0
};
// Add Map
Map.addLayer(pop_density, pop_density_vis, 'population_density');
var dataset = ee.Image('CIESIN/GPWv411/GPW_Population_Count/gpw_v4_population_count_rev11_2020_30_sec');
print(dataset) 
var pop_count = dataset.select('population_count');
var pop_count_vis = {
  'max': 1000.0,
  'palette': [
    'ffffe7',
    '86a192',
    '509791',
    '307296',
    '2c4484',
    '000066'
  ],
  'min': 0.0
};
Map.addLayer(pop_count, pop_count_vis, 'population_count');
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Clip   Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
pop_count = pop_count.clip(AOI);
pop_density = pop_density.clip(AOI);
//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//
var projection = pop_count.select('population_count').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;
print(pop_count.projection().nominalScale());
Export.image.toDrive({
	image:pop_count,
	description:'population_count',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 927.662,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});
var projection = pop_density.select('population_density').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;
print(pop_count.projection().nominalScale());
Export.image.toDrive({
	image:pop_density,
	description:'pop_density',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 927.662,
	crs: crs,
	crsTransform: crs_transform,
	maxPixels:1e13,
});