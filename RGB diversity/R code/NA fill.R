################################################################################
# Author: Carlos Javier Navarro (carlosnavarro@go.ugr.es)
# Date: 2024-11-30
#
# Description:
# This script performs cleaning and processing of an iSDI (inverse Simpson 
# Diversity Index) raster layer. It replaces infinite values with NA, fills 
# missing values using the mean of neighboring pixels, clips the raster to 
# the protected area of interest, and exports the cleaned raster.
#
# Functionality:
# - Loads an iSDI raster generated from Sentinel-2 unsupervised classification
# - Identifies and replaces infinite values with NA
# - Applies a focal filter (9x9 window) to fill NA values with local means
# - Clips the raster to a given AOI shapefile (in EPSG:3035)
# - Exports the cleaned raster to local directories and external storage
#
# Input:
# - iSDI raster file: <park>/RGB diversity/iSDI_raster.tif
# - AOI shapefile: <park>/BaseLayers/AOI_3035.shp
#
# Output:
# - Cleaned and clipped raster file: iSDI_raster.tif
# - Saved both in original path and in portable location for modeling
#
# Requirements:
# - R package: terra
# - Raster must be in a projected CRS matching the AOI shapefile
#
# Notes:
# - The focal mean is applied only to NA cells
# - Uses a 9x9 pixel window for interpolation (adjustable)
# - Designed for use in diversity-environment modeling pipelines
################################################################################


# Load necessary libraries
library(terra)

# Park list
# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

park <- "Peneda"


# Leer el raster
r <- rast( paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\Variables Modelos\\", park,"\\RGB diversity\\iSDI_raster.tif"))



# Verify the range of values in the raster
range(r)

# Plot the raster to visualize it
plot(r)

# Obtain the name of the raster band
raster_band_name <- names(r)

# Replace infinite values with NA
r[r == Inf] <- NA
r[r == -Inf] <- NA

# Create a mask for NA values (this will identify only NA values)
mask_na <- is.na(r)

# Fill only NA values with the mean of neighboring values
r_filled <- focal(r, w = matrix(1, 9, 9), fun = mean, na.rm = TRUE)

# Apply the mask to keep non-NA values
r_filled[!mask_na] <- r[!mask_na]

# Ensure the band name is preserved
names(r_filled) <- raster_band_name

plot(r_filled)

# Ensure the band name is preserved
names(r_filled) <- raster_band_name

range(r_filled)


# Clip using a polygon
# Read the polygon
pol <- vect(paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\BaseLayers\\", park,"\\AOI_3035.shp"))

# Clip the raster
r_filled <- crop(r_filled, pol)

# Apply the mask to clip according to the polygon
# r_filled <- mask(r_filled, pol)

# Save the modified raster if necessary
writeRaster(r_filled,paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\Variables Modelos\\", park,"\\RGB diversity\\iSDI_raster.tif"), overwrite=TRUE)


# Save  creating folders if they do not exist
writeRaster(r_filled,paste0("C:/Users/carlo/Downloads/parques/", park,"/iSDI_raster.tif"), overwrite=TRUE)


