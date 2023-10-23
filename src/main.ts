import "@arcgis/core/assets/esri/themes/light/main.css";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "./style.css";

import { defineCustomElements as defineMapElements } from "@arcgis/map-components/dist/loader";
import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/1.9.2/assets",
});
defineMapElements();

const arcgisLayerList = document.querySelector("arcgis-layer-list");
const arcgisMap = document.querySelector("arcgis-map");

const shellPanel = document.querySelector(
  "#shell-panel"
) as HTMLCalciteShellPanelElement;

shellPanel.querySelectorAll("calcite-action").forEach((action) => {
  action.addEventListener("click", (event) => {
    const target = event.target as HTMLCalciteActionElement;
    shellPanel.querySelectorAll("calcite-block").forEach((block) => {
      block.id.split("-")[0] === target.id.split("-")[0]
        ? (block.open = true)
        : (block.open = false);
    });

    shellPanel.querySelectorAll("calcite-action").forEach((action) => {
      action.id === target.id
        ? (action.active = true)
        : (action.active = false);
    });
  });
});

arcgisLayerList?.addEventListener("widgetReady", () => {
  handleLayerListReady();
});

arcgisMap?.addEventListener("viewReady", async () => {
  handleViewReady();
});

function handleLayerListReady() {
  const layerList = arcgisLayerList!.widget;
  layerList.listItemCreatedFunction = listItemCreatedFuntion;
}

async function handleViewReady() {
  const mapView = arcgisMap!.view;
  await mapView.when();

  const hazardAreasFeatureLayer = mapView.map.layers.find(
    (layer) => layer.title === "Hazard Areas"
  ) as FeatureLayer;

  const result = await hazardAreasFeatureLayer.queryFeatures();
  mapView.goTo(result.features);
}

function listItemCreatedFuntion(event: any) {
  const item = event.item;
  if (item.layer.type != "group") {
    item.panel = {
      content: "legend",
    };
  }
}
