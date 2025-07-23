# Remote Sensing Variables

This module extracts and processes multiple remote sensing datasets to characterize biophysical and environmental conditions across 8 Spanish National Parks for the EarthCul project's Cultural Ecosystem Services analysis.

## Overview

Remote sensing provides synoptic, multi-temporal data on landscape characteristics that influence cultural ecosystem services. This module integrates various satellite-based products and derived indices to quantify environmental conditions, landscape structure, and ecosystem functioning patterns across protected areas.

## Data Sources and Variables

### 1. Land Surface Temperature (`LST.js`)
- **Source**: Landsat 8 Collection
- **Algorithm**: Sofia Ermida's open-source LST algorithm
- **Resolution**: 30m (resampled from 100m thermal)
- **Temporal Coverage**: Multi-annual statistics (2015-2022)
- **Metrics**: Annual median, standard deviation, coefficient of variation, percentiles (5th, 95th)


### 2. Solar Radiation (`Solar radiation.js`)
- **Source**: Global Solar Atlas (GSA)
- **Variables**: 
  - **GHI**: Global Horizontal Irradiation (horizontal surface)
  - **DNI**: Direct Normal Irradiation (sun-facing surface)
- **Resolution**: ~1km


### 3. Nighttime Lights (`Night Lights.js`)
- **Source**: NOAA VIIRS Day/Night Band Annual V22
- **Resolution**: ~463m
- **Temporal Coverage**: 2015-2022 median composite


### 4. Population Density (`Population density and counts.js`)
- **Source**: CIESIN Gridded Population World v4.11 (GPWv4)
- **Variables**: Population density and counts
- **Resolution**: ~927m (30 arc-seconds)
- **Year**: 2020


### 5. Canopy Structure (`Cannopy.js`)
- **Source**: ETH Global Canopy Height Model (Lang et al. 2022)
- **Variables**: 
  - Canopy height (mean)
  - Standard deviation of height
- **Resolution**: 10m


### 6. Forest Disturbances (`European disturbance map.js`)
- **Source**: European Disturbance Maps (Senf et al.)
- **Method**: LandTrendr time series analysis
- **Resolution**: 30m  
- **Temporal Coverage**: Disturbances after 2005


### 7. Soil Properties (`Soil groups.js`)
- **Source**: HiHydroSoil v2.0
- **Variable**: Hydrologic soil groups (A, B, C, D classifications)
- **Resolution**: 250m


### 8. Seasonal Clustering (`Seasonal Kmeans.js`)
- **Source**: Sentinel-2 Surface Reflectance
- **Method**: Unsupervised K-means clustering by season
- **Resolution**: 10m
- **Seasons**: Winter (Dec-Feb), Spring (Mar-May), Summer (Jun-Aug), Autumn (Sep-Nov)


### 9. Ecosystem Services Index (`ESPI.js`)
- **Source**: Sentinel-2 Surface Reflectance Harmonized
- **Method**: Ecosystem Services Provision Index (ESPI)
- **Indices Used**: NDVI
- **Resolution**: 10m

## Processing Methodology

### Google Earth Engine Implementation
All scripts are implemented in Google Earth Engine (GEE) JavaScript API:

1. **Area of Interest Selection**: Each script allows selection from 8 national parks
2. **Cloud Masking**: Automated cloud and shadow removal (for optical data)
3. **Temporal Aggregation**: Multi-annual composites and statistical summaries
4. **Spatial Clipping**: Data extracted for park boundaries
5. **Export**: GeoTIFF outputs organized by park-specific folders


## Technical Specifications

### Coordinate Reference Systems
- **Processing CRS**: EPSG:3035 (LAEA Europe) for consistent analysis
- **Export CRS**: EPSG:3035 or park-specific UTM zones


### Spatial Resolutions
- **10m**: Sentinel-2 based products (ESPI, seasonal clustering)
- **30m**: Landsat-based products (LST, disturbances)
- **250m**: Soil classifications
- **463m**: Nighttime lights
- **927m**: Population data
- **1km**: Solar radiation

### Temporal Coverage
- **Primary Period**: 2015-2022 (varies by dataset)
- **LST**: Multi-annual statistics with percentiles
- **Population**: 2020 snapshot
- **Solar Radiation**: Long-term averages
- **Disturbances**: Events post-2005


### Processing Standards
- **Resampling**: Appropriate methods by data type (bilinear for continuous, nearest for categorical)
- **Compositing**: Robust statistics (median) for temporal aggregation
- **Export Format**: Standardized GeoTIFF with proper metadata



## Software Dependencies

### Google Earth Engine
- **JavaScript API**: Cloud-based processing platform
- **Data Catalog**: Access to global satellite archives
- **Computational Resources**: Scalable processing infrastructure


### Integration Workflow
1. **GEE Processing**: Cloud-based computation and export
2. **Local Download**: Transfer from Google Drive
3. **Spatial Alignment**: Coordinate system harmonization

## Key References

### Methodological References
- **LST Algorithm**: Ermida, S.L., et al. (2020). Google Earth Engine open-source code for Land Surface Temperature estimation from the Landsat series. *Remote Sensing*, 12(9), 1471.

- **ESPI Method**: Paruelo, J. M., Texeira, M., Staiano, L., Mastrángelo, M., Amdan, L., & Gallego, F. (2016). An integrative index of Ecosystem Services provision based on remotely sensed data. Ecological indicators, 71, 145-154.

- **Canopy Height**: Lang, N., Jetz, W., Schindler, K., & Wegner, J. D. (2023). A high-resolution canopy height model of the Earth. Nature Ecology & Evolution, 7(11), 1778-1789.

### Data Sources
- **Global Solar Atlas**: https://globalsolaratlas.info/
- **NOAA VIIRS**: https://developers.google.com/earth-engine/datasets/catalog/NOAA_VIIRS_DNB_ANNUAL_V22
- **GPWv4**: https://developers.google.com/earth-engine/datasets/catalog/CIESIN_GPWv411_GPW_Population_Density
- **HiHydroSoil**: https://gee-community-catalog.org/projects/hihydro_soil/

## Contact

- **Primary Contact**: Carlos Javier Navarro (carlosnavarro@ugr.es)
- **Project**: EarthCul - Cultural Ecosystem Services Analysis
- **Institution**: University of Granada, Spain