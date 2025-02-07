
library(raster)


# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- 'Aiguestortes'
base <- 'H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers'

# base <- 'H:\\Mi unidad\\2023\\EarthCul\\Teledeteccion_variables\\Alineados\\Clip2'

carpeta <- file.path(base, "Variables Modelos", parque)
# carpeta <- file.path(base, parque)


lista_tiff <- list.files(path = carpeta, pattern = "\\.tif$", recursive = TRUE, full.names = TRUE)
lista_tiff <- lista_tiff[!grepl("/Climate/|/ClimateProj/", lista_tiff)]

# Leer el shapefile del polígono
AOI <- shapefile("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\BaseLayers\\Guadarrama\\AOI_3035.shp")

# Crear un vector para almacenar los resultados
resultados <- c()


# Loop sobre cada archivo TIF
for (archivo_tiff in lista_tiff) {
  raster_layer <- raster(archivo_tiff)
  
  # Verificar si el valor está presente
  if (2147483648 %in% values(raster_layer)) {
    resultados <- c(resultados, archivo_tiff)
  }
}

print(resultados)

# # Iterar sobre cada archivo y verificar si contiene valores NA o valores específicos de ausencia de datos dentro del polígono
# for (archivo in lista_tiff) {
#   # Leer el archivo TIFF
#   img <- raster::raster(archivo)
#   
#   # Extraer los valores dentro del polígono
#   valores_en_poligono <- unlist(extract(img, AOI))
#   
#   # Verificar si hay valores NA o valores específicos de ausencia de datos dentro del polígono
#   if (any(is.na(valores_en_poligono)) | any(valores_en_poligono == -999) | any(valores_en_poligono == -9999) | any(valores_en_poligono == 2147483648)) {
#     resultados <- c(resultados, "SI")
#   } else {
#     resultados <- c(resultados, "NO")
#   }
# }
# 
# # Crear un data frame con los resultados
# tabla_resultados <- data.frame(Archivo = lista_tiff, Contiene_NA = resultados)

### Vecino más cercano hydrologic soil group
library(tidyverse)
library(sf)
library(terra)


# Aiguestortes
# Ordesa
# Peneda
# Guadarrama
# Picos
# SierraNieves
# SierraNevada
# Teide

parque <- "Teide"

aoi <- st_read(paste0("H:\\.shortcut-targets-by-id\\1M44eQfgiKNtbHWnOemX3695BodORG2B6\\LW_SEM\\WP4\\EarthCul\\Variables_layers\\BaseLayers\\", parque, "/AOI_3035.shp"))


var <- paste0("H:/.shortcut-targets-by-id/1QgLrOV2y4-9patljjtk1HvbncjvWUAOz/EarthCul/Variables_layers/Variables Modelos/",parque, "/Teledeteccion/hydrologic_soil_group.tif")



r <- rast(var) %>%
  crop(ext(aoi)) %>%
  project("EPSG:3035")

NAs <- as.numeric(terra::extract(is.na(r), aoi, sum)[, 2])


while (NAs > 0) {
  r <- focal(r, 3, "modal", na.policy = "only", na.rm = TRUE)
  
  x <- r %>%
    crop(aoi, mask = T)
  
  # Identifies NAs by raster
  NAs <- as.numeric(terra::extract(is.na(r), aoi, sum)[, 2])
  
  writeRaster(x, paste0('C:/Users/carlo/Desktop/borrar/zz/',parque,'/hydrologic_soil_group.tif'), overwrite = T)
  
}

