# Landscape Variables

This folder contains landscape fragmentation and connectivity metrics calculated for 8 Spanish National Parks as part of the EarthCul project's Cultural Ecosystem Services analysis.

## Overview

Landscape metrics quantify spatial patterns and ecological processes across different scales, providing insights into habitat fragmentation, connectivity, and landscape heterogeneity. These metrics are essential for understanding the spatial configuration of ecosystems and their potential to provide cultural services.

## Data Sources

- **Base Layer**: [CORINE Land Cover (CLC)](https://land.copernicus.eu/en/products/corine-land-cover)
  - Pan-European land cover mapping
  - 100m spatial resolution
  - Available for all study areas with consistent methodology
- **Classification Scheme**: See `LULC_CORINE_Codes.csv` for detailed reclassification table

## Methodology

### Moving Window Analysis
Landscape metrics were calculated using the [Fragstats software](https://www.fragstats.org/) with a moving window approach to capture spatial patterns at multiple scales.

**Window Size Determination**: A sensitivity analysis was conducted to identify the optimal window size for landscape analysis, determining the threshold between microscale and macroscale patterns.

![Scale Sensitivity Analysis](Figures/scale_sensibility.jpeg)

**Figure 1:** Scale sensitivity analysis showing the optimal window size of 1100 meters for landscape metric calculations.

### Landscape Metrics Calculated

The following 21 landscape metrics were computed, representing key aspects of landscape structure:

#### Fragmentation Metrics
- **np**: Number of Patches - total number of discrete habitat patches
- **pd**: Patch Density - number of patches per unit area
- **pr**: Patch Richness - number of different patch types

#### Shape Complexity Metrics  
- **circle_mn**: Mean Circle-related Metric - deviation from circular shape
- **frac_mn**: Mean Fractal Dimension Index - perimeter complexity
- **para_mn**: Mean Perimeter-Area Ratio - shape irregularity
- **shape_mn**: Mean Shape Index - overall shape complexity

#### Connectivity Metrics
- **ai**: Aggregation Index - degree of patch clumping
- **contag**: Contagion Index - overall landscape connectivity
- **contig_mn**: Mean Contiguity Index - spatial connectedness
- **enn_mn**: Mean Euclidean Nearest Neighbor Distance

#### Diversity Metrics
- **shdi**: Shannon's Diversity Index - landscape compositional diversity
- **shei**: Shannon's Evenness Index - landscape compositional evenness
- **sidi**: Simpson's Diversity Index - dominance-based diversity
- **siei**: Simpson's Evenness Index - Simpson-based evenness
- **msidi**: Modified Simpson's Diversity Index - alternative diversity measure
- **msiei**: Modified Simpson's Evenness Index - alternative evenness measure

#### Landscape Configuration
- **ed**: Edge Density - total edge length per unit area
- **iji**: Interspersion and Juxtaposition Index - patch intermixing
- **lsi**: Landscape Shape Index - boundary complexity
- **ta**: Total Area - total landscape area analyzed



## Processing Workflow

### 1. Land Cover Data Preparation
- **Script**: `scripts/Download and reclassification of LULC.ipynb`
- **Purpose**: Download CORINE Land Cover data and apply reclassification scheme
- **Input**: Google Earth Engine CORINE dataset
- **Output**: Reclassified land cover maps for each park

### 2. Fragstats Analysis
**Tool**: Fragstats software (external)
- **Input**: Reclassified CORINE land cover maps
- **Configuration**: Moving window analysis (1100m window size)
- **Output**: 21 landscape metrics per park

### 3. Post-Processing
- **Script**: `scripts/Reproject Fragsats Layers.ipynb`
- **Purpose**: Coordinate system transformation and file organization
- **Methods**: 
  - Rasterio-based reprojection
  - GDAL-based batch processing
  - Automated file organization
- **Target CRS**: EPSG:3035 (LAEA Europe)

## Study Areas

Landscape metrics are available for the following 8 Spanish National Parks:

| Park | Code | Region |
|------|------|--------|
| Aigüestortes i Estany de Sant Maurici | Aiguestortes | Catalonia |
| Ordesa y Monte Perdido | Ordesa | Aragon |
| Peneda-Gerês | Peneda | Galicia |
| Sierra de Guadarrama | Guadarrama | Madrid/Castilla y León |
| Picos de Europa | Picos | Asturias/Cantabria |
| Sierra de las Nieves | SierraNieves | Andalusia |
| Sierra Nevada | SierraNevada | Andalusia |
| Teide | Teide | Canary Islands |

## Technical Specifications

- **Spatial Resolution**: 100m (CORINE native resolution)
- **Analysis Window**: 1100m x 1100m moving window
- **Coordinate Systems**: 
  - Source: EPSG:4326 (WGS84)
  - Target: EPSG:3035 (LAEA Europe)
- **File Format**: GeoTIFF (.tif)
- **Resampling Method**: Nearest neighbor (categorical data preservation)

## Land Use Classification

The CORINE Land Cover dataset was reclassified to simplify landscape analysis while maintaining ecological relevance. See `LULC_CORINE_Codes.csv` for the complete reclassification scheme:

- **Artificial surfaces** → Consolidated to single class (100)
- **Agricultural areas** → Maintained original classification
- **Forest and natural areas** → Maintained original classification
- **Wetlands and water bodies** → Maintained original classification

## Applications

These landscape metrics support analysis of:
- **Habitat fragmentation** patterns across protected areas
- **Landscape connectivity** for species movement
- **Spatial heterogeneity** as a driver of cultural ecosystem services
- **Comparative landscape structure** analysis between parks
- **Scale-dependent** ecological processes

## Dependencies

- **Software**: Fragstats 4.3.833b (external software required)
- **Python Libraries**: `rasterio`, `gdal`, `geopandas`, `geemap`
- **Data Access**: Google Earth Engine account for CORINE data
- **Coordinate Systems**: PROJ library for transformations

## References

- McGarigal, K., & Marks, B.J. (1995). FRAGSTATS: spatial pattern analysis program for quantifying landscape structure. USDA Forest Service General Technical Report PNW-351.
- [CORINE Land Cover Technical Documentation](https://land.copernicus.eu/en/products/corine-land-cover)
- [Fragstats Software Documentation](https://www.fragstats.org/)

## Contact

For questions about landscape metrics calculation or data access:
- **Author**: Carlos Javier Navarro
- **Email**: carlosnavarro@ugr.es
- **Project**: EarthCul - Cultural Ecosystem Services Analysis