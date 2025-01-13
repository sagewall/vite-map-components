import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import Layer from "@arcgis/core/layers/Layer";
import PortalItem from "@arcgis/core/portal/PortalItem";
import "@arcgis/map-components/dist/components/arcgis-expand";
import "@arcgis/map-components/dist/components/arcgis-feature-table";
import "@arcgis/map-components/dist/components/arcgis-legend";
import "@arcgis/map-components/dist/components/arcgis-map";
import "@arcgis/map-components/dist/components/arcgis-table-list";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import "@esri/calcite-components/dist/components/calcite-shell";
import "./style.css";

setAssetPath(
  "https://cdn.jsdelivr.net/npm/@esri/calcite-components@3.0.0-next.89/dist/calcite/assets"
);

const arcgisFeatureTable = document.querySelector("arcgis-feature-table");
const arcgisMap = document.querySelector("arcgis-map");
const arcgisTableList = document.querySelector("arcgis-table-list");

if (arcgisMap.ready) {
  addTable();
} else {
  arcgisMap.addEventListener("arcgisViewReadyChange", addTable);
}

if (arcgisTableList) {
  if (arcgisTableList.state === "ready") {
    handleTableListReady();
  } else {
    arcgisTableList.addEventListener("arcgisReady", handleTableListReady);
  }
}

function handleTableListReady() {
  reactiveUtils.watch(
    () =>
      arcgisFeatureTable ? arcgisTableList.selectedItems.at(0)?.layer : null,
    async (layer) => {
      if (!layer) {
        return;
      }
      await layer.load();
      // is the selected item still the same after the layer is loaded
      if (layer === arcgisTableList.selectedItems.at(0)?.layer) {
        arcgisFeatureTable.layer = layer;
      }
    }
  );
}

async function addTable() {
  const table = await Layer.fromPortalItem({
    portalItem: new PortalItem({
      id: "6aa49be79248400ebd28f1d0c6af3f9f",
    }),
  });
  await table.load();

  if (table.isTable) {
    table.title = "Table from portal item";
    arcgisMap.map.tables.add(table);
  }
}
