//This code allows the download of night light maps with a resolution of 463.83 meters.
// Source:
//https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_ANNUAL_V22


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
