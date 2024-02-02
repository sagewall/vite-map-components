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
  resourcesUrl: "https://js.arcgis.com/calcite-components/2.3.0/assets",
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

if (arcgisLayerList) {
  arcgisLayerList.listItemCreatedFunction = listItemCreatedFunction;
  arcgisLayerList.selectionMode = "single";
  arcgisLayerList.dragEnabled = true;

  // arcgisLayerList.visibleElements = {
  //   ...arcgisLayerList.visibleElements,
  //   ...{
  //     collapseButton: true,
  //     closeButton: true,
  //     filter: true,
  //     heading: true,
  //   },
  // };

  arcgisLayerList.addEventListener("arcgisLayerListReady", async (event) => {
    const layerListComponent = event.target as HTMLArcgisLayerListElement;
    console.log("arcgisLayerListReady", layerListComponent);
    // selected items does't seem to be reactive
    console.log("component.selectedItems: ", layerListComponent.selectedItems);
    // reactiveUtils.watch(
    //   () =>
    //     layerListComponent.selectedItems.map((selectedItem) => selectedItem),
    //   (selectedItems) => {
    //     console.log("LayerList Number of selected items", selectedItems.length);
    //     selectedItems.forEach((selectedItem) =>
    //       console.log(selectedItem.layer.title)
    //     );
    //   }
    // );
  });

  arcgisLayerList.addEventListener("layerListTriggerAction", async (event) => {
    console.log(event);
    const { action, item } = event.detail;
    const layer = item.layer as FeatureLayer; // I know it's sloppy, but I'm lazy
    await layer.load();
    if (action.id === "information") {
      window.open(layer.url);
    }
  });
}

arcgisMap?.addEventListener("arcgisViewReadyChange", async (event) => {
  handleViewReady(event);
});

// Strange when I add this the widgets fail to load properly
// arcgisMap?.addEventListener("arcgisViewChange", (event) => {
//   console.log("extent", event.target.extent);
// });

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

function listItemCreatedFunction(event: any) {
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

// // Options for the observer (which mutations to observe)
// const config = { attributes: true, childList: true, subtree: true };

// // Callback function to execute when mutations are observed
// const callback = (mutationList: any, observer) => {
//   for (const mutation of mutationList) {
//     if (mutation.type === "childList") {
//       console.log("A child node has been added or removed.");
//     } else if (mutation.type === "attributes") {
//       console.log(`The ${mutation.attributeName} attribute was modified.`);
//     }
//   }
// };

// // Create an observer instance linked to the callback function
// const observer = new MutationObserver(callback);

// // Start observing the target node for configured mutations
// observer.observe(arcgisLayerList as HTMLArcgisLayerListElement, config);
