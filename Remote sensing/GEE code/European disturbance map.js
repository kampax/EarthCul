/***************************************************************************************
 * Project: EarthCul
 * Author: Carlos Javier Navarro
 * Email: carlosnavarro@ugr.es
 * Description: Code to download disturbance (riot) maps prepared at the European level
 *              from LandTrend with a 30-meter pixel resolution. The disturbance data 
 *              are clipped to national park AOIs and filtered to include only events 
 *              occurring after 2005.
 * Data source:
 * - European Environment Agency (EEA) Biogeographical regions in Europe
 *   https://www.eea.europa.eu/data-and-maps/figures/biogeographical-regions-in-europe-2
 * 
 * Visualization:
 * - https://corneliussenf.users.earthengine.app/view/european-disturbance-map
 * 
 * Notes:
 * - The script allows selecting a national park AOI from the "BBs_EarthCul" collection.
 * - Outputs are exported to Google Drive in park-specific folders using EPSG:3035 CRS.
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

var parque = "SierraNevada" ;
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI);

// Color palette (https://github.com/gee-community/ee-palettes)
var palettes = require('users/gena/packages:palettes');
var palette = palettes.matplotlib.viridis[7];
// Load disturbance image collection and mosaic
var disturbance_maps = ee.ImageCollection("users/corneliussenf/european_disturbance_maps").mosaic();
var vis_disturbance = {min: 2015, max: 2020, palette: palette};
Map.addLayer(disturbance_maps, vis_disturbance, 'Disturbance year');

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Clip   Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

disturbance_maps = disturbance_maps.clip(AOI);

// Binary maps
disturbance_maps = disturbance_maps.gt(2005);//This is to use only disrtubance that occur after 2005.

Map.addLayer(disturbance_maps, {}, "disturbance_maps binario");


//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///// //////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

var projection = disturbance_maps.select('b1').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;

print(disturbance_maps.projection().nominalScale());

Export.image.toDrive({
	image:disturbance_maps,
	description:'disturbance_maps',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 30,
	crs: 'EPSG:3035',
// 	crsTransform: crs_transform,
	maxPixels:1e13,
});
