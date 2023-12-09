import type WebMap from "@arcgis/core/WebMap";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type LayerList from "@arcgis/core/widgets/LayerList";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "./style.css";

import {
  ArcgisLayerListCustomEvent,
  ArcgisMapCustomEvent,
  defineCustomElements as defineMapElements,
} from "@arcgis/map-components/dist/loader";
import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.0.0/assets",
});
defineMapElements();

const arcgisLayerList = document.querySelector("arcgis-layer-list");
const arcgisMap = document.querySelector("arcgis-map");
const navigationLogo = document.querySelector("calcite-navigation-logo");

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

arcgisLayerList?.addEventListener("widgetReady", (event) => {
  handleLayerListReady(event);
});

arcgisMap?.addEventListener("viewReady", async (event) => {
  handleViewReady(event);
});

function handleLayerListReady(
  event: ArcgisLayerListCustomEvent<{
    widget: LayerList;
  }>
) {
  const layerList = event.target.widget;
  layerList.listItemCreatedFunction = listItemCreatedFuntion;
  layerList.visibleElements.collapseButton = true;
  layerList.visibleElements.closeButton = true;
  layerList.visibleElements.filter = true;
  layerList.visibleElements.heading = true;
  layerList.filterPlaceholder = "Filter layers";
}

async function handleViewReady(
  event: ArcgisMapCustomEvent<{
    view: __esri.MapView;
  }>
) {
  const mapView = event.target.view;

  const map = mapView.map as WebMap;
  const { portalItem } = map;

  navigationLogo!.heading = portalItem.title;
  navigationLogo!.description = portalItem.snippet;
  navigationLogo!.thumbnail = portalItem.thumbnailUrl;
  navigationLogo!.href = portalItem.itemPageUrl;
  navigationLogo!.label = "Thumbnail of map";

  const hazardAreasFeatureLayer = map.layers.find(
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
