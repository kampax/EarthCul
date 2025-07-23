/***************************************************************************************
 * Project: EarthCul
 * Author: Sofia Ermida
 * Email: sofia.ermida@ipma.pt
 * Description: Code to estimate Land Surface Temperature (LST) from Landsat series using
 *              an open-source algorithm by Sofia Ermida. The script processes Landsat-8
 *              data with cloud masking and calculates annual metrics over a selected
 *              national park AOI defined in "BBs_EarthCul".
 * 
 * References:
 * - Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020.
 *   Google Earth Engine open-source code for Land Surface Temperature estimation
 *   from the Landsat series. Remote Sensing, 12(9), 1471.
 *   https://doi.org/10.3390/rs12091471
 * 
 * Notes:
 * - Allows selection of Landsat satellite, date range, and AOI.
 * - Produces mean LST layers and annual statistical metrics (median, stdDev, percentiles,
 *   coefficient of variation).
 * - Exports GeoTIFF images to Google Drive under park-specific folders.
 * - Includes alternative cloud masking and uses the Landsat LST module by Sofia Ermida.
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

// Ejemplo de filtro 
var parque = "Teide";
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));

/*
Author: Sofia Ermida (sofia.ermida@ipma.pt; @ermida_sofia)

This code is free and open. 
By using this code and any data derived with it, 
you agree to cite the following reference 
in any publications derived from them:
Ermida, S.L., Soares, P., Mantas, V., Göttsche, F.-M., Trigo, I.F., 2020. 
    Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series.
    Remote Sensing, 12 (9), 1471; https://doi.org/10.3390/rs12091471

Example 1:
  This example shows how to compute Landsat LST from Landsat-8 over Coimbra
  This corresponds to the example images shown in Ermida et al. (2020)
    
*/
// link to the code that computes the Landsat LST
var LandsatLST = require('users/sofiaermida/landsat_smw_lst:modules/Landsat_LST.js')
//var LandsatLST = require('users/cnav/EarthCul:LST_modules/Landsat_LST.js');

// select region of interest, date range, and landsat satellite

var satellite = 'L8';
var date_start = '2015-01-01';
var date_end = '2022-12-31';
var use_ndvi = true;

// get landsat collection with added variables: NDVI, FVC, TPW, EM, LST
var LandsatColl = LandsatLST.collection(satellite, date_start, date_end, AOI, use_ndvi);
print(LandsatColl);

// select the mean feature
var exImage = LandsatColl.mean().clip(AOI);

var cmap1 = ['blue', 'cyan', 'green', 'yellow', 'red'];
var cmap2 = ['F2F2F2','EFC2B3','ECB176','E9BD3A','E6E600','63C600','00A600']; 

Map.centerObject(AOI, 10)
// Map.addLayer(exImage.select('TPW'),{min:0.0, max:60.0, palette:cmap1},'TCWV', 0)
// Map.addLayer(exImage.select('TPWpos'),{min:0.0, max:9.0, palette:cmap1},'TCWVpos',0)
// Map.addLayer(exImage.select('FVC'),{min:0.0, max:1.0, palette:cmap2}, 'FVC', 0)
// Map.addLayer(exImage.select('EM'),{min:0.9, max:1.0, palette:cmap1}, 'Emissivity', 0)
// Map.addLayer(exImage.select('B10'),{min:290, max:320, palette:cmap1}, 'TIR BT', 0)
Map.addLayer(exImage.select('LST'),{min:290, max:320, palette:cmap1}, 'LST')
// Map.addLayer(exImage.multiply(0.0000275).add(-0.2),{bands: ['SR_B4', 'SR_B3', 'SR_B2'], min:0, max:0.3}, 'RGB', 0)


var cloudmask = require('users/sofiaermida/landsat_smw_lst:modules/cloudmask.js');

function maskClouds(image) {
  var qa = image.select('QA_PIXEL');
  var mask = qa.bitwiseAnd(1 << 3);
  return image.updateMask(mask.not());
};


// another option 
var L8 = ee.ImageCollection("LANDSAT/LC08/C02/T1_TOA")
.filterDate(date_start, date_end)
.map(maskClouds)


var LST_mean = L8.mean().select('B10').clip(AOI);

Map.addLayer(LST_mean, {min:290, max:320, palette:cmap1} , "L8");


// Función para calcular métricas anuales
var annualMetrics = function(year) {
  var start = ee.Date.fromYMD(year, 1, 1);
  var end = start.advance(1, 'year');
  var annualCollection = L8.filterDate(start, end);
  
  var median = annualCollection.median().rename('median');
  var stdDev = annualCollection.reduce(ee.Reducer.stdDev()).rename('stdDev');
  var percentile95 = annualCollection.reduce(ee.Reducer.percentile([95])).rename('percentile95');
  var percentile5 = annualCollection.reduce(ee.Reducer.percentile([5])).rename('percentile5');
  
  var mean = annualCollection.mean();
  var coefficientOfVariation = stdDev.divide(mean).rename('coefficientOfVariation');
  
  return ee.Image.cat([median, stdDev, coefficientOfVariation, percentile95, percentile5])
                .set('year', year);
};

// Crear una lista de años para iterar
var years = ee.List.sequence(ee.Date(date_start).get('year'), ee.Date(date_end).get('year'));

// Calcular métricas anuales
var annualMetricsCollection = ee.ImageCollection(years.map(annualMetrics));

// Función para calcular la mediana interanual de cada métrica
var interannualMedian = function(metric) {
  return annualMetricsCollection.select(metric).median().rename(metric + '_interannual_median');
};

// Calcular la mediana interanual para cada métrica
var metrics = ['median', 'stdDev', 'coefficientOfVariation', 'percentile95', 'percentile5'];
var interannualMedianImages = metrics.map(interannualMedian);

print('interannualMedianImages:', interannualMedianImages);

//////////////////
///EXPORT/////////
//////////////////

Export.image.toDrive({
  image: L8.select('B10'),
  description: 'LST',
  folder: 'GEE/'+ parque,
  scale: 30,
  region: AOI,
  fileFormat: 'GeoTIFF',
});


/////////////////////////////////
// Sofia Ermida's algorithm/////
/////////////////////////////////

Export.image.toDrive({
  image: exImage.select('LST'),
  description: 'LST_SE',
  folder: 'GEE/'+ parque,
  scale: 30,
  region: AOI,
  fileFormat: 'GeoTIFF',
});