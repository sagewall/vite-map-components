import type FeatureLayer from "@arcgis/core/layers/FeatureLayer";
import type WebMap from "@arcgis/core/WebMap";
import type ListItem from "@arcgis/core/widgets/LayerList/ListItem";
import "@arcgis/map-components/components/arcgis-basemap-layer-list";
import "@arcgis/map-components/components/arcgis-layer-list";
import "@arcgis/map-components/components/arcgis-legend";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-table-list";
import "@esri/calcite-components/components/calcite-action";
import "@esri/calcite-components/components/calcite-action-bar";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-button";
import "@esri/calcite-components/components/calcite-menu";
import "@esri/calcite-components/components/calcite-menu-item";
import "@esri/calcite-components/components/calcite-navigation";
import "@esri/calcite-components/components/calcite-navigation-logo";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "./style.css";

// App shell

const appShell = document.createElement("calcite-shell");
appShell.contentBehind = true;

// Navigation

const appNavigation = document.createElement("calcite-navigation");
appNavigation.slot = "header";

const appNavigationLogo = document.createElement("calcite-navigation-logo");
appNavigationLogo.slot = "logo";
appNavigation.appendChild(appNavigationLogo);

const appMenu = document.createElement("calcite-menu");
appMenu.slot = "content-end";

const homeMenuItem = document.createElement("calcite-menu-item");
homeMenuItem.iconStart = "home";
homeMenuItem.label = "Home";
homeMenuItem.text = "Home";

homeMenuItem.addEventListener("calciteMenuItemSelect", () => {
  window.location.href = "/index.html";
});

appMenu.appendChild(homeMenuItem);

const statsMenuItem = document.createElement("calcite-menu-item");
statsMenuItem.iconStart = "license";
statsMenuItem.label = "Stats";
statsMenuItem.text = "Stats";

statsMenuItem.addEventListener("calciteMenuItemSelect", () => {
  window.location.href = "/stats.html";
});

appMenu.appendChild(statsMenuItem);

const bundleStatsMenuItem = document.createElement("calcite-menu-item");
bundleStatsMenuItem.iconStart = "clustering";
bundleStatsMenuItem.label = "Bundle Stats";
bundleStatsMenuItem.text = "Bundle Stats";

bundleStatsMenuItem.addEventListener("calciteMenuItemSelect", () => {
  window.location.href = "/bundle-stats.html";
});

appMenu.appendChild(bundleStatsMenuItem);

appNavigation.appendChild(appMenu);
appShell.appendChild(appNavigation);

// ArcGIS Map

const arcgisMap = document.createElement("arcgis-map");
arcgisMap.itemId = "ef2644781da844648e8bb30ab52a02bc";

arcgisMap.addEventListener("arcgisViewReadyChange", (event) => {
  const { map } = event.target;
  const { portalItem } = map as WebMap;
  appNavigationLogo.heading = portalItem?.title ?? "";
  appNavigationLogo.description = portalItem?.snippet ?? "";
  appNavigationLogo.thumbnail = portalItem?.thumbnailUrl ?? "";
  appNavigationLogo.href = portalItem?.itemPageUrl ?? "";
  appNavigationLogo.label = "Thumbnail of map";
});

appShell.appendChild(arcgisMap);

// Components Panel

const componentsPanel = document.createElement("calcite-panel");

// LayerList

const layerListBlock = document.createElement("calcite-block");
layerListBlock.heading = "LayerList";
layerListBlock.label = "LayerList";
layerListBlock.open = true;

const arcgisLayerList = document.createElement("arcgis-layer-list");
arcgisLayerList.dragEnabled = true;
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
arcgisLayerList.minFilterItems = 1;
arcgisLayerList.referenceElement = arcgisMap;
arcgisLayerList.selectionMode = "multiple";
arcgisLayerList.showFilter = true;
arcgisLayerList.visibilityAppearance = "checkbox";

arcgisLayerList.addEventListener("arcgisReady", () => {
  arcgisLayerList.selectedItems.on(
    "change",
    (event: {
      added: Array<ListItem>;
      moved: Array<ListItem>;
      removed: Array<ListItem>;
    }) => {
      arcgisLayerList.selectedItems.forEach((item: ListItem) => {
        console.log(item.layer?.title);
      });
      event.added.forEach((item: ListItem) => {
        if (item.layer?.type === "feature") {
          (item.layer as FeatureLayer).effect = "opacity(0.5)";
        }
      });
      event.removed.forEach((item: ListItem) => {
        if (item.layer?.type === "feature") {
          (item.layer as FeatureLayer).effect = "none";
        }
      });
    }
  );
});

arcgisLayerList.addEventListener("arcgisTriggerAction", (event) => {
  const { action, item } = event.detail;

  if (action.id === "information") {
    if (item.layer && "url" in item.layer) {
      const url = item.layer.url as string | URL;
      window.open(url);
    }
  }
});

layerListBlock.appendChild(arcgisLayerList);
componentsPanel.appendChild(layerListBlock);

// BasemapLayerList

const basemapLayerListBlock = document.createElement("calcite-block");
basemapLayerListBlock.heading = "BasemapLayerList";
basemapLayerListBlock.hidden = true;
basemapLayerListBlock.label = "BasemapLayerList";

const arcgisBasemapLayerList = document.createElement(
  "arcgis-basemap-layer-list"
);
arcgisBasemapLayerList.dragEnabled = true;
arcgisBasemapLayerList.minFilterItems = 1;
arcgisBasemapLayerList.referenceElement = arcgisMap;
arcgisBasemapLayerList.selectionMode = "multiple";
arcgisBasemapLayerList.visibilityAppearance = "checkbox";

basemapLayerListBlock.appendChild(arcgisBasemapLayerList);
componentsPanel.appendChild(basemapLayerListBlock);

// TableList

const tableListBlock = document.createElement("calcite-block");
tableListBlock.heading = "TableList";
tableListBlock.hidden = true;
tableListBlock.label = "TableList";

const arcgisTableList = document.createElement("arcgis-table-list");
arcgisTableList.dragEnabled = true;
arcgisTableList.minFilterItems = 1;
arcgisTableList.referenceElement = arcgisMap;
arcgisTableList.selectionMode = "multiple";

tableListBlock.appendChild(arcgisTableList);
componentsPanel.appendChild(tableListBlock);

// Legend

const legendBlock = document.createElement("calcite-block");
legendBlock.heading = "Legend";
legendBlock.hidden = true;
legendBlock.label = "Legend";

const arcgisLegend = document.createElement("arcgis-legend");
arcgisLegend.referenceElement = arcgisMap;

legendBlock.appendChild(arcgisLegend);
componentsPanel.appendChild(legendBlock);

// Components Shell Panel

const componentsShellPanel = document.createElement("calcite-shell-panel");
componentsShellPanel.displayMode = "float";
componentsShellPanel.position = "start";
componentsShellPanel.slot = "panel-start";

// Action Bar

const componentsActionBar = document.createElement("calcite-action-bar");
componentsActionBar.slot = "action-bar";

// LayerList action

const layerListAction = document.createElement("calcite-action");
layerListAction.active = true;
layerListAction.icon = "layers";
layerListAction.label = "LayerList";
layerListAction.text = "LayerList";

layerListAction.addEventListener("click", () => {
  handleActionClick(layerListAction, layerListBlock);
});

componentsActionBar.appendChild(layerListAction);

const basemapLayerListAction = document.createElement("calcite-action");
basemapLayerListAction.icon = "basemap";
basemapLayerListAction.label = "BasemapLayerList";
basemapLayerListAction.text = "BasemapLayerList";

basemapLayerListAction.addEventListener("click", () => {
  handleActionClick(basemapLayerListAction, basemapLayerListBlock);
});

componentsActionBar.appendChild(basemapLayerListAction);

// TableList action

const tableListAction = document.createElement("calcite-action");
tableListAction.icon = "tables";
tableListAction.label = "TableList";
tableListAction.text = "TableList";

tableListAction.addEventListener("click", () => {
  handleActionClick(tableListAction, tableListBlock);
});

componentsActionBar.appendChild(tableListAction);

// Legend action

const legendAction = document.createElement("calcite-action");
legendAction.icon = "legend";
legendAction.label = "Legend";
legendAction.text = "Legend";

legendAction.addEventListener("click", () => {
  handleActionClick(legendAction, legendBlock);
});

componentsActionBar.appendChild(legendAction);
componentsShellPanel.appendChild(componentsActionBar);
componentsShellPanel.appendChild(componentsPanel);
appShell.appendChild(componentsShellPanel);
document.querySelector("#app")?.appendChild(appShell);

function handleActionClick(
  action: HTMLCalciteActionElement,
  block: HTMLCalciteBlockElement
) {
  const componentActions = [
    layerListAction,
    basemapLayerListAction,
    tableListAction,
    legendAction,
  ];
  const componentBlocks = [
    layerListBlock,
    basemapLayerListBlock,
    tableListBlock,
    legendBlock,
  ];

  action.active = true;
  componentActions.forEach((componentAction) => {
    if (componentAction !== action) {
      componentAction.active = false;
    }
  });

  block.open = true;
  block.hidden = false;
  componentBlocks.forEach((componentBlock) => {
    if (componentBlock !== block) {
      componentBlock.open = false;
      componentBlock.hidden = true;
    }
  });
}
