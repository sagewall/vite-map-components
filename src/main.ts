import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type ListItem from "@arcgis/core/widgets/LayerList/ListItem";
import "@arcgis/map-components/dist/components/arcgis-layer-list";
import "@arcgis/map-components/dist/components/arcgis-legend";
import "@arcgis/map-components/dist/components/arcgis-map";
import { setAssetPath } from "@esri/calcite-components/dist/components";
import "@esri/calcite-components/dist/components/calcite-action";
import "@esri/calcite-components/dist/components/calcite-action-bar";
import "@esri/calcite-components/dist/components/calcite-block";
import "@esri/calcite-components/dist/components/calcite-button";
import "@esri/calcite-components/dist/components/calcite-navigation";
import "@esri/calcite-components/dist/components/calcite-navigation-logo";
import "@esri/calcite-components/dist/components/calcite-shell";
import "@esri/calcite-components/dist/components/calcite-shell-panel";
import "./style.css";

setAssetPath("https://js.arcgis.com/calcite-components/2.13.2/assets");

const arcgisLayerList = document.querySelector("arcgis-layer-list");
const arcgisMap = document.querySelector("arcgis-map");
const navigationLogo = document.querySelector("calcite-navigation-logo");
const shellPanel = document.querySelector("#shell-panel");

if (shellPanel) {
  shellPanel.querySelectorAll("calcite-action").forEach((action) => {
    action.addEventListener("click", (event) => {
      const target = event.target as HTMLCalciteActionElement;
      shellPanel.querySelectorAll("calcite-block").forEach((block) => {
        if (block.id.split("-")[0] === target.id.split("-")[0]) {
          block.open = true;
          block.hidden = false;
        } else {
          block.open = false;
          block.hidden = true;
        }
      });

      shellPanel.querySelectorAll("calcite-action").forEach((action) => {
        if (action.id === target.id) {
          action.active = true;
        } else {
          action.active = false;
        }
      });
    });
  });
}

if (arcgisMap && navigationLogo) {
  arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
    const { map } = event.target;
    const { portalItem } = map;
    navigationLogo.heading = portalItem.title;
    navigationLogo.description = portalItem.snippet;
    navigationLogo.thumbnail = portalItem.thumbnailUrl;
    navigationLogo.href = portalItem.itemPageUrl;
    navigationLogo.label = "Thumbnail of map";
  });
}

if (arcgisLayerList) {
  arcgisLayerList.addEventListener("arcgisReady", () => {
    arcgisLayerList.selectedItems.on(
      "change",
      (event: {
        added: Array<ListItem>;
        moved: Array<ListItem>;
        removed: Array<ListItem>;
      }) => {
        arcgisLayerList.selectedItems.forEach((item: ListItem) => {
          console.log(item.layer.title);
        });
        event.added.forEach((item: ListItem) => {
          if (item.layer.type === "feature") {
            (item.layer as FeatureLayer).effect = "opacity(0.5)";
          }
        });
        event.removed.forEach((item: ListItem) => {
          if (item.layer.type === "feature") {
            (item.layer as FeatureLayer).effect = "none";
          }
        });
      }
    );
    arcgisLayerList.listItemCreatedFunction = (event) => {
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
    };
  });

  arcgisLayerList.addEventListener("arcgisTriggerAction", (event) => {
    const { action, item } = event.detail;

    if (action.id === "information") {
      if ("url" in item.layer) {
        const url = item.layer.url as string | URL;
        window.open(url);
      }
    }
  });
}
