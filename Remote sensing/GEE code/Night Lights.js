/***************************************************************************************
 * Project: EarthCul
 * Author: Carlos Javier Navarro
 * Email: carlosnavarro@ugr.es
 * Description: Code to download nighttime lights maps with approximately 463.83 meter
 *              resolution from the NOAA VIIRS DNB Annual V22 dataset. The data are clipped
 *              to the selected national park AOI from the "BBs_EarthCul" feature collection,
 *              and median values are computed over the period 2015-2022.
 * Data source:
 * - NOAA VIIRS Day/Night Band Annual Composite (V22)
 *   https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_ANNUAL_V22
 * 
 * Notes:
 * - Outputs are exported to Google Drive organized by park name.
 * - Uses EPSG:3035 projection.
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

var parque = "Guadarrama" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));

// Select and filter the dataset of night ligths
var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/ANNUAL_V22')
                  .filter(ee.Filter.date('2015-01-01', '2022-01-01'));

// reduce the median values for all the period
var nighttime = dataset.select('median').median().clip(AOI);
var nighttimeVis = {min: 0.0, max: 60.0};

Map.addLayer(nighttime, nighttimeVis, 'Nighttime');

//-----------------------------------------------------------------------------------------------------------------------------
///////////////////////////////////////////////// Export Images///////////////////////////////////////////////////////////////
//-----------------------------------------------------------------------------------------------------------------------------
//

var projection = nighttime.select('median').projection().getInfo();
var crs = projection.crs;
var crs_transform = projection.transform;

print(nighttime.select('median').projection().nominalScale());

Export.image.toDrive({
	image:nighttime,
	description:'Nighttime_VIIRS',
	folder: 'GEE/'+parque,
	region: AOI,
	scale: 463.83,
	crs: 'EPSG:3035',//3035
// 	crsTransform: crs_transform,
	maxPixels:1e13,
});
