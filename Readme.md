
# EarthCul: Cultural Ecosystem Services Analysis

This repository contains the complete codebase for the EarthCul project, which focuses on analyzing Cultural Ecosystem Services (CES) across eight Spanish National Parks using multi-source environmental data and social media-derived presence points.

## Project Overview

The EarthCul project aims to model and understand Cultural Ecosystem Services by integrating environmental variables with social media data from Spanish National Parks. The analysis covers the following parks:

- **Aigüestortes i Estany de Sant Maurici** (Aiguestortes)
- **Ordesa y Monte Perdido** (Ordesa)
- **Peneda-Gerês** (Peneda)
- **Sierra de Guadarrama** (Guadarrama)
- **Picos de Europa** (Picos)
- **Sierra de las Nieves** (SierraNieves)
- **Sierra Nevada** (SierraNevada)
- **Teide** (Teide)

![Studyarea](Figures/Figure%20EarthCul_Gray_Regiones.jpg)
**Figure 1**. European biogeographical regions and location of the eight mountain National Parks across the Iberian Peninsula and the Canary Islands. The National Parks included are: (1) Aigüestortes i Estany de Sant Maurici, (2) Ordesa y Monte Perdido, (3) Picos de Europa, (4) Peneda-Gerês, (5) Sierra de Guadarrama, (6) Sierra de las Nieves, (7) Sierra Nevada, and (8) Teide


## Data Sources

### Cultural Ecosystem Services Data
- **Social Media Photos**: CES presence points derived from Flickr and Twitter photos
- **AI Validation**: Photos labeled using AI models and validated by experts

### Environmental Variables
The environmental variables used as model inputs come from multiple sources:

1. **OpenStreetMap (OSM)**: Infrastructure and point-of-interest data
2. **Remote Sensing**: Satellite-derived biophysical variables
3. **Topographic Variables**: Elevation, slope, aspect, and derived metrics
4. **Climate Variables**: Current and future climate data from [CHELSA](https://chelsa-climate.org/)
5. **Landscape Metrics**: Spatial patterns calculated with [Fragstats](https://www.fragstats.org/)
6. **Viewshed Analysis**: Visibility calculations
7. **Land Use/Land Cover**: [CORINE Land Cover](https://land.copernicus.eu/en/products/corine-land-cover) maps

## Repository Structure

```
EarthCul/
├── Climate variables/         # Climate data processing
├── EFAS/                      # Ecosystem Functional Attributes (EFAs)
├── Landscape variables/       # Fragstats landscape metrics
├── OSM/                       # OpenStreetMap data processing
├── Photo downloads/           # Social media photo acquisition
├── Post processing/           # Data alignment and metadata creation
├── Remote sensing/            # Satellite data processing
├── RGB diversity/             # Spectral diversity analysis based on RGB 
├── Topographic variables/     # Terrain analysis

```

## Main Components

### 📍 OpenStreetMap Variables (`OSM/`)
Downloads and processes infrastructure and amenity data including:
- Accommodation facilities
- Transportation infrastructure
- Recreation facilities
- Natural and cultural landmarks
- Derived metrics (count, distance, presence)

**Key Scripts:**
- `1) Variable download/`: OSM data acquisition
- `2) Derived metrics/`: Spatial analysis and metric calculation

### 🛰️ Remote Sensing (`Remote sensing/`)
Processes satellite data using Google Earth Engine (GEE):
- Biophysical variables
- Spectral indices
- Solar radiation models
- Soil characteristics

### 🗻 Topographic Variables (`Topographic variables/`)
Terrain analysis and derived topographic metrics for each park.

### 🌡️ Climate Variables (`Climate variables/`)
Processing of current and future climate scenarios from CHELSA database.

### 🌲 Landscape Variables (`Landscape variables/`)
Calculation of landscape fragmentation and connectivity metrics:
- **Input**: CORINE Land Cover maps
- **Tool**: Fragstats software
- **Window Size**: 1100m (determined through sensitivity analysis)
- **Includes**: Reclassification of land use codes

### 📊 Essential Forest Assessment System (`EFAS/`)
Processing of forest-related biophysical variables including:
- Resampling LANDSAT data
- Spatial summarization
- Layer alignment and clipping

### 🎨 RGB Diversity (`RGB diversity/`)
Spectral diversity analysis using seasonal K-means clustering to assess landscape heterogeneity.

### 📸 Photo Downloads (`Photo downloads/`)
Scripts for acquiring and processing social media photos from:
- Flickr API
- Twitter API

### ⚙️ Post Processing (`Post processing/`)
Final data preparation including:
- Raster alignment and clipping
- Metadata creation
- Data standardization across all parks

## Technical Requirements

### Python Environment
- **rasterio**: Geospatial raster processing
- **geopandas**: Vector data processing
- **pandas**: Data manipulation
- **numpy**: Numerical computations
- **GDAL**: Geospatial data abstraction
- **geemap**: Google Earth Engine Python API

### R Environment
- Spatial data processing packages
- Statistical analysis tools

### Google Earth Engine
- JavaScript API for cloud-based geospatial analysis
- Authenticated access required

### External Software
- **Fragstats**: Landscape metrics calculation
- **GDAL Tools**: Command-line geospatial utilities

## Data Processing Workflow

1. **Data Acquisition**
   - Download OSM data
   - Acquire satellite imagery via GEE
   - Collect social media photos
   - Obtain climate and topographic data

2. **Data Processing**
   - Reproject all layers to EPSG:3035
   - Standardize pixel resolution to 100m
   - Calculate derived metrics and indices
   - Perform landscape fragmentation analysis

3. **Data Integration**
   - Align all rasters to common grid
   - Clip to park boundaries
   - Create comprehensive metadata
   - Quality control and validation

4. **Final Products**
   - Standardized environmental variable layers
   - CES presence point datasets
   - Analysis-ready data for modeling

## Key Features

- **Multi-source Integration**: Combines diverse environmental data sources
- **Standardized Processing**: Consistent methodology across all parks
- **Scalable Architecture**: Modular code structure for easy replication
- **Quality Control**: Comprehensive metadata and validation procedures
- **Open Source**: Leverages open-source tools and data where possible

## Usage

Each folder contains specific scripts and documentation for different data processing steps. Users should:

1. Install required dependencies
2. Configure API access (GEE, social media platforms)
3. Run scripts in logical sequence (download → process → integrate)
4. Follow individual folder README files for detailed instructions

## Citation

If you use this code or data in your research, please cite the EarthCul project appropriately.


## Contact

carlosnavarro@ugr.es



