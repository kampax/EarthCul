
 /* -----------------------------------------------------------------------------
   Creates a unsupervised clustering map for each Sentinel-2 mosaic by 
   meteorological season
   
   João Gonçalves
   Porto, March 2018
 ------------------------------------------------------------------------------ */

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


var parque = "SierraNieves" ;
var BBs = ee.FeatureCollection("users/cnav/EarthCul/BBs_EarthCul");
var AOI = BBs.filter(ee.Filter.eq("PN", parque));
Map.centerObject(AOI, 10);

// Make image collections ---------------------------------------------------
// Filter by date/calendar range and cloud coverage

// Multi-annual cloud-free mosaic for winter season
var S2_wint = ee.ImageCollection('COPERNICUS/S2').
  filter(ee.Filter.calendarRange(12,2,'month')).
  filter(ee.Filter.calendarRange(2015,2022,'year')).
  filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', 30).
  filterBounds(AOI);

// Multi-annual cloud-free mosaic for spring season
var S2_sprg = ee.ImageCollection('COPERNICUS/S2').
  filter(ee.Filter.calendarRange(3,5,'month')).
  filter(ee.Filter.calendarRange(2015,2022,'year')).
  filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', 30).
  filterBounds(AOI);

// Multi-annual cloud-free mosaic for summer season
var S2_summ = ee.ImageCollection('COPERNICUS/S2').
  filter(ee.Filter.calendarRange(6,8,'month')).
  filter(ee.Filter.calendarRange(2015,2022,'year')).
  filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', 30).
  filterBounds(AOI);

// Multi-annual cloud-free mosaic for autumn season
var S2_autm = ee.ImageCollection('COPERNICUS/S2').
  filter(ee.Filter.calendarRange(9,11,'month')).
  filter(ee.Filter.calendarRange(2015,2022,'year')).
  filterMetadata('CLOUDY_PIXEL_PERCENTAGE','less_than', 30).
  filterBounds(AOI);

print(S2_wint);
print(S2_sprg);
print(S2_summ);
print(S2_autm);

// Make image mosaic ---------------------------------------------------------
// Median mosaic

/*
var S2_wint_mosaic = S2_wint.median().select(['B1','B2','B3','B4',
'B5','B6','B7','B8','B8A','B11','B12']);
var S2_sprg_mosaic = S2_sprg.median().select(['B1','B2','B3','B4',
'B5','B6','B7','B8','B8A','B11','B12']);
var S2_summ_mosaic = S2_summ.median().select(['B1','B2','B3','B4',
'B5','B6','B7','B8','B8A','B11','B12']);
var S2_autm_mosaic = S2_autm.median().select(['B1','B2','B3','B4',
'B5','B6','B7','B8','B8A','B11','B12']);
*/

var S2_wint_mosaic = S2_wint.select(['B2','B3','B4']).median();
var S2_sprg_mosaic = S2_sprg.select(['B2','B3','B4']).median();
var S2_summ_mosaic = S2_summ.select(['B2','B3','B4']).median();
var S2_autm_mosaic = S2_autm.select(['B2','B3','B4']).median();


print(S2_wint_mosaic);
print(S2_sprg_mosaic);
print(S2_summ_mosaic);
print(S2_autm_mosaic);


// Train cluster based on sample ---------------------------------------------------------

var S2_wint_mos_samp = S2_wint_mosaic.sample({
  region: AOI,
  scale: 10,
  numPixels: 30000
});

var S2_sprg_mos_samp = S2_sprg_mosaic.sample({
  region: AOI,
  scale: 10,
  numPixels: 30000
});

var S2_summ_mos_samp = S2_summ_mosaic.sample({
  region: AOI,
  scale: 10,
  numPixels: 30000
});

var S2_autm_mos_samp = S2_autm_mosaic.sample({
  region: AOI,
  scale: 10,
  numPixels: 30000
});


// Make kmeans clustering
var S2_wint_trainClust = ee.Clusterer.wekaKMeans(20).train(S2_wint_mos_samp);
var S2_sprg_trainClust = ee.Clusterer.wekaKMeans(20).train(S2_sprg_mos_samp);
var S2_summ_trainClust = ee.Clusterer.wekaKMeans(20).train(S2_summ_mos_samp);
var S2_autm_trainClust = ee.Clusterer.wekaKMeans(20).train(S2_autm_mos_samp);

// Predict class
var S2_wint_clust = S2_wint_mosaic.cluster(S2_wint_trainClust);
var S2_sprg_clust = S2_sprg_mosaic.cluster(S2_sprg_trainClust);
var S2_summ_clust = S2_summ_mosaic.cluster(S2_summ_trainClust);
var S2_autm_clust = S2_autm_mosaic.cluster(S2_autm_trainClust);

var project = S2_wint.first().select('B4').projection().getInfo();
var crs = project.crs;
print(project);

// Export ---------------------------------------------------------------------

Export.image.toDrive({image: S2_wint_clust,
                      description: 'S2_wint_clust-1', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                      maxPixels:1e13
});

Export.image.toDrive({image: S2_sprg_clust,
                      description: 'S2_sprg_clust-1', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                       maxPixels:1e13
});

Export.image.toDrive({image: S2_summ_clust,
                      description: 'S2_summ_clust-1', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                      maxPixels:1e13
});

Export.image.toDrive({image: S2_autm_clust,
                      description: 'S2_autm_clust-1', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                       maxPixels:1e13
});




// Export ---------------------------------------------------------------------

Export.image.toDrive({image: S2_summ_mosaic.select( ['B4', 'B3', 'B2']),
                      description: 'S2_summ_mosaic', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs, 
                      scale: 10,
                       maxPixels:1e13
});

Export.image.toDrive({image: S2_wint_mosaic.select( ['B4', 'B3', 'B2']),
                      description: 'S2_wint_mosaic', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                       maxPixels:1e13
});

Export.image.toDrive({image: S2_sprg_mosaic.select( ['B4', 'B3', 'B2']),
                      description: 'S2_sprg_mosaic', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10,
                      maxPixels:1e13
});

Export.image.toDrive({image: S2_autm_mosaic.select( ['B4', 'B3', 'B2']),
                      description: 'S2_autm_mosaic', 
                      folder: 'GEE_'+parque,
                      region: AOI,
                      crs: crs,
                      scale: 10, 
                      maxPixels:1e13
});

// Visualize image data -------------------------------------------------------


// Map results

Map.addLayer(S2_wint_clust.randomVisualizer(), {}, 'S2 kmeans');
Map.addLayer(S2_sprg_clust.randomVisualizer(), {}, 'S2 kmeans');
