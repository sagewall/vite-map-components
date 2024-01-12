import type WebMap from "@arcgis/core/WebMap";
import * as reactiveUtils from "@arcgis/core/core/reactiveUtils";
import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import "@esri/calcite-components/dist/calcite/calcite.css";
import "./style.css";

import {
  ArcgisMapCustomEvent,
  defineCustomElements as defineMapElements,
} from "@arcgis/map-components/dist/loader";
import { defineCustomElements as defineCalciteElements } from "@esri/calcite-components/dist/loader";

defineCalciteElements(window, {
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.1.0/assets",
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

if (arcgisMap) {
  arcgisMap.addEventListener("arcgisViewChange", (event) => {
    console.log("extent", event.target.extent);
  });

  arcgisMap.addEventListener("arcgisViewReadyChange", async (event) => {
    handleViewReady(event);
  });
}

if (arcgisLayerList) {
  arcgisLayerList.listItemCreatedFunction = listItemCreatedFuntion;
  arcgisLayerList.multipleSelectionEnabled = true;
  arcgisLayerList.selectionEnabled = true;

  arcgisLayerList.visibleElements = {
    ...arcgisLayerList.visibleElements,
    ...{
      collapseButton: true,
      closeButton: true,
      filter: true,
      heading: true,
    },
  };

  arcgisLayerList.addEventListener("widgetReady", async (event) => {
    const { widget } = event.detail;
    console.log("widget.selectedItems: ", widget.selectedItems);
    console.log("component.selectedItems: ", arcgisLayerList.selectedItems); // this is undefined
    reactiveUtils.watch(
      () => widget.selectedItems.map((selectedItem) => selectedItem),
      (selectedItems) => {
        console.log("LayerList Number of selected items", selectedItems.length);
        console.log("Component selected items", arcgisLayerList.selectedItems); // this is undefined.  Is it really a property
        selectedItems.forEach((selectedItem) =>
          console.log(selectedItem.layer.title)
        );
      }
    );
  });

  arcgisLayerList.addEventListener("triggerActionEvent", async (event) => {
    console.log(event);
    const { action, item } = event.detail;
    const layer = item.layer as FeatureLayer; // I know it's sloppy, but I'm lazy
    await layer.load();
    if (action.id === "information") {
      window.open(layer.url);
    }
  });
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
  const { item } = event;
  if (item.layer.type != "group") {
    item.panel = {
      content: "legend",
    };
  }

  item.actionsSections = [
    [
      {
        title: "Information",
        icon: "information",
        id: "information",
      },
    ],
  ];
}
