import esriConfig from "@arcgis/core/config";
import CatalogLayer from "@arcgis/core/layers/CatalogLayer";
import ListItem from "@arcgis/core/widgets/LayerList/ListItem";
import TableListItem from "@arcgis/core/widgets/TableList/ListItem";
import "@arcgis/map-components/dist/components/arcgis-basemap-layer-list";
import "@arcgis/map-components/dist/components/arcgis-catalog-layer-list";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-placement";
import "@arcgis/map-components/dist/components/arcgis-table-list";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import "@esri/calcite-components/dist/components/calcite-input-text";
import "@esri/calcite-components/dist/components/calcite-label";
import "./style.css";

setAssetPath(
  "https://cdn.jsdelivr.net/npm/@esri/calcite-components@3.0.0-next.89/dist/calcite/assets"
);

esriConfig.portalUrl = "https://devtesting.mapsdevext.arcgis.com/";

const arcgisBasemapLayerList = document.querySelector(
  "arcgis-basemap-layer-list"
) as HTMLArcgisBasemapLayerListElement;
const arcgisCatalogLayerList = document.querySelector(
  "arcgis-catalog-layer-list"
) as HTMLArcgisCatalogLayerListElement;
const arcgisLayerList = document.querySelector(
  "arcgis-layer-list"
) as HTMLArcgisLayerListElement;
const arcgisTableList = document.querySelector(
  "arcgis-table-list"
) as HTMLArcgisTableListElement;
const filterInput = document.querySelector(
  "#filter-input"
) as HTMLCalciteInputTextElement;

const arcgisMap = document.querySelector("arcgis-map");

if (arcgisMap?.ready) {
  init();
} else {
  arcgisMap?.addEventListener("arcgisViewReadyChange", () => {
    init();
  });
}

async function init() {
  const catalogLayer = arcgisMap?.map.layers.find(
    (layer) => layer.title === "Sanborn maps catalog"
  );
  arcgisCatalogLayerList.catalogLayer = catalogLayer as CatalogLayer;

  filterInput.addEventListener(
    "calciteInputTextInput",
    (event: { target: HTMLCalciteInputTextElement }) => {
      console.log("filtering for", event.target?.value);
      const filterPredicate = (item: ListItem | TableListItem) =>
        item.title.toLowerCase().includes(event.target.value.toLowerCase());

      arcgisBasemapLayerList.baseFilterPredicate = filterPredicate;
      arcgisBasemapLayerList.referenceFilterPredicate = filterPredicate;
      arcgisCatalogLayerList.filterPredicate = filterPredicate;
      arcgisLayerList.filterPredicate = filterPredicate;
      arcgisTableList.filterPredicate = filterPredicate;
    }
  );
}
