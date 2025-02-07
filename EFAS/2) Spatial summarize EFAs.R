library(raster)
library(terra)
library(dplyr)
library(vegan)
library(SegOptim)

setwd("C:/Users/carlo/Desktop/EFAs")



## Define paths to data files and folders ---------------------------------------


gridFilePath <- getwd()

# Not needed here... only the raster grid
# gridFileName <- "Aiguestortes_grid_25830"



# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- "Teide"

# Provide a raster grid, check the path and name
rstGridFilePath <- paste0("C:/Users/carlo/Desktop/EFAs/grid/", parque, "/Grid_new.tif")
crs_info <- raster::crs(rast(rstGridFilePath))
print(crs_info)

## Load data -------------------------------------------------------------------- 

#, "/res2"

# Sentinel 2 multi-temporal mosaics
mosaicFiles <- list.files(paste0( parque, "/reprojected"), pattern = ".tif$", full.names = TRUE)
rstMosaic <- stack(mosaicFiles)
names(rstMosaic)



# Resample the raster grid to the same resolution, extent and CRS as
# the input Sentinel-2 layers otherwise it wont work

z <- resample(rast(rstGridFilePath), rast(mosaicFiles), method="near")

# Force/set the resampled raster as an integer raster
# z <- as.int(z)


# Check the resampled raster:
# The integer values will be used as regions to calculate zonal statistics
# In the data only 5 regions exist: [1, 4, 5, 6 and 7]... Is that correct?? 
# It will work but check if this option is adequate
#
# In the Vaz et al paper we used a 1x1km regular grid to capture finer details

plot(z)


# writeRaster(z, "C:/Users/carlo/Desktop/Diversity/resamp/Grid_25830_resampled.tif")
## Loop through different seasonal mosaics -------------------------------------
## Calculate mean and std for Sentinel-2 spectral bands 2,3,4 (B,G,R)

nFiles <- length(mosaicFiles)

pb <- txtProgressBar(0, nFiles, style=3)


## [[WARNING]]
## Functions in the loop are fast but will use ~8.5 Gb of RAM, so make sure you have enough 
## memory in your machine


# Loop through all Sentinel-2 raster mosaic files
for(i in 1:nFiles){

  # This uses only the blue, green and blue bands of Sentinel-2, RGB
  # for each sesonal Sentinel-2 mosaic
  rstMosaic <- (rast(mosaicFiles[i]))[[1:3]]

  if(i==1){

    # Calculate the average and std-deviation
    rstMosaicStats <- calculateSegmentStats(rstMosaic, z,
                                            funs = c("median", "sd"), na.rm = TRUE)

  }else{

    # Create a temporary data frame to append to the previous ones
    rstMosaicStats_TMP <- calculateSegmentStats(rstMosaic, z,
                                                funs = c("median", "sd"), na.rm = TRUE)

    # Aggregate the data across each seasonal mosaic
    rstMosaicStats <- merge(rstMosaicStats,rstMosaicStats_TMP,by="SID")
  }
  setTxtProgressBar(pb,i)
}

# ?? rstMosaicStats[-2689,] ??
# Better to use a filter to remove wrong values if this is what this line is
# trying to do ..
# Use dplyr code to filter, example: rstMosaicStats %>% filter(SID != NA)

# rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))
rstMosaicStats = as.data.frame(rstMosaicStats)
length(unique(rstMosaicStats$SID))

# rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))

# ## Excluir NA despues de aplicarle el view identifico la columna 
# rstMosaicStats = rstMosaicStats[1:166477, ]

#######################
####Export like Tiff###
#######################

library(terra)

base <- rast(rstGridFilePath)

raster_base <- base

# # Asumiendo que 'z' es tu raster base y 'rstClustStats.DivInd' es tu dataframe
# # Asegúrate de que 'z' tiene valores únicos que corresponden a los IDs en 'rstClustStats.DivInd'
# 
# # Primero, crea un raster para cada columna de interés en rstClustStats.DivInd
# columnas <- names(rstMosaicStats)[2:25] # Ajusta el índice según tus columnas de interés
# columnas <- names(rstMosaicStats)[2:ncol(rstMosaicStats)] # Ajusta el índice según tus columnas de interés

test<-basename(mosaicFiles)

# Crear las combinaciones y unirlas en una sola cadena

result <- sub("_2018.*", "", test)

# Paso 2: Agregar _median y _sd a cada nombre modificado
result <- paste0(rep(result, each = 2), c("_median", "_sd"))

result <- sub("SR_SENTINEL_", "", result)

# Reemplazar doble guión bajo con un solo guión bajo
result <- gsub("__", "_", result)
new_colnames <- c("SID", result)


# Asignar los nuevos nombres a las columnas del data frame
colnames(rstMosaicStats) <- new_colnames

columnas <- names(rstMosaicStats)[2:113]

rstMosaicStats <- rstMosaicStats %>% filter(!is.na(SID))

for(col in columnas){
  # Crea un raster vacío con la misma extensión y resolución que 'z'
  rast_temp <- rast(raster_base)

  # Usa los valores de SID como índices para asignar los valores de la columna actual al raster
  vals <- rstMosaicStats[[col]]
  ids <- match(rstMosaicStats$SID, values(raster_base))
  rast_temp[ids] <- vals

  # Guarda el raster resultante
  writeRaster(rast_temp, paste0("C:/Users/carlo/Desktop/EFAs/results/",parque,"/", col, "_raster.tif"), overwrite=TRUE)
}


#### Si quiero renombrar las bandas con el nombre de la capa 
library(terra)
library(fs)

# Establecer el directorio de trabajo a la carpeta donde están los archivos .tif


# Obtener la lista de todos los archivos .tif en la carpeta
tif_files <- mosaicFiles
  # dir_ls(glob = "*.tif")

for (tif_file in tif_files) {
  # Cargar la imagen como un objeto raster
  raster_obj <- rast(tif_file)
  
  # Obtener el nombre base del archivo (sin extensión)
  base_name <- path_ext_remove(path_file(tif_file))
  
  # Renombrar las bandas utilizando el nombre del archivo
  names(raster_obj) <- paste0(base_name, seq_along(names(raster_obj)))
  
  # Crear un nombre temporal para el archivo
  temp_file <- tempfile(fileext = ".tif")
  
  # Guardar el archivo temporalmente con las bandas renombradas
  writeRaster(raster_obj, temp_file, overwrite = TRUE)
  
  # Reemplazar el archivo original con el archivo temporal
  file_copy(temp_file, tif_file, overwrite = TRUE)
  
  # Eliminar el archivo temporal
  file_delete(temp_file)
}



