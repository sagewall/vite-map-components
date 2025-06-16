import esriConfig from "@arcgis/core/config";
import Circle from "@arcgis/core/geometry/Circle";
import type Point from "@arcgis/core/geometry/Point";
import Graphic from "@arcgis/core/Graphic";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Map from "@arcgis/core/Map";
import * as places from "@arcgis/core/rest/places";
import FetchPlaceParameters from "@arcgis/core/rest/support/FetchPlaceParameters";
import PlacesQueryParameters from "@arcgis/core/rest/support/PlacesQueryParameters";
import "@arcgis/map-components/components/arcgis-map";
import "@arcgis/map-components/components/arcgis-placement";
import "@arcgis/map-components/components/arcgis-zoom";
import "@esri/calcite-components/components/calcite-block";
import "@esri/calcite-components/components/calcite-combobox";
import "@esri/calcite-components/components/calcite-combobox-item";
import "@esri/calcite-components/components/calcite-flow";
import "@esri/calcite-components/components/calcite-flow-item";
import "@esri/calcite-components/components/calcite-icon";
import "@esri/calcite-components/components/calcite-list";
import "@esri/calcite-components/components/calcite-notice";
import "@esri/calcite-components/components/calcite-panel";
import "@esri/calcite-components/components/calcite-shell";
import "@esri/calcite-components/components/calcite-shell-panel";
import "./style.css";

init();

async function init() {
  // @@Start(vars)
  esriConfig.apiKey =
    "AAPTxy8BH1VEsoebNVZXo8HurNqKfBKYYrXsMGl1XtWYqqgyG2cx_wB8FCF6sTCDWt2LsSszFfYC8YLK3JIlkb3swTYEx69XuLVnDJHGxwXUPdVw16tNQEtvlyNRGrPxkA8Z9bmgb2zz839BD4HecYskJ4yik8nDhZWr4qTOuW5CuxjNo6n8zi_smIjy8jy5OJOIw8Mks_GvBOhD8V8rzfif359Z3DKosYwm60W7X0SiNu8.AT1_lA1i1yeJ";
  const viewElement = document.querySelector(
    "arcgis-map"
  )! as HTMLArcgisMapElement;

  let flowItem: HTMLCalciteFlowItemElement; // Info panel for place information
  let clickPoint: Point; // Clicked point on the map
  let activeCategory = "4d4b7105d754a06377d81259"; // Landmarks and Outdoors category

  // GraphicsLayer for places features
  const placesLayer = new GraphicsLayer({
    id: "placesLayer",
  });
  // GraphicsLayer for map buffer
  const bufferLayer = new GraphicsLayer({
    id: "bufferLayer",
  });

  // Info panel interactions
  const categoryCombobox = document.getElementById(
    "category-combobox"
  )! as HTMLCalciteComboboxElement;
  const resultsList = document.getElementById(
    "results"
  )! as HTMLCalcitePanelElement;
  const flow = document.getElementById("flow")! as HTMLCalciteFlowElement;
  // @@End(vars) @@Start(map)
  viewElement.map = new Map({
    basemap: "arcgis/navigation",
    layers: [placesLayer, bufferLayer],
  });
  // @@End(map) @@Start(clearGraphics)
  // Clear graphics and results from the previous place search
  function clearGraphics() {
    bufferLayer.removeAll(); // Remove graphics from GraphicsLayer of previous buffer
    placesLayer.removeAll(); // Remove graphics from GraphicsLayer of previous places search
    resultsList.innerHTML = "";
    if (flowItem) flowItem.remove();
  }
  // @@End(clearGraphics) @@Start(onClick)
  // View on-click event to capture places search location
  viewElement.addEventListener("arcgisViewClick", (event) => {
    clearGraphics();
    clickPoint = event.detail.mapPoint;
    // Pass point to the showPlaces() function
    clickPoint && showPlaces(clickPoint);
  });
  // @@End(onClick) @@Start(addEventListener)
  // Event listener for category changes
  categoryCombobox.addEventListener("calciteComboboxChange", () => {
    activeCategory = categoryCombobox.value as string;
    clearGraphics();
    // Pass point to the showPlaces() function with new category value
    clickPoint && showPlaces(clickPoint);
  });
  // @@End(addEventListener) @@Start(showPlaces)
  // Display map click search area and pass to places service
  async function showPlaces(placePoint: Point) {
    // Buffer graphic represents click location and search radius
    const circleGeometry = new Circle({
      center: placePoint,
      geodesic: true,
      numberOfPoints: 100,
      radius: 500, // set radius to 500 meters
      radiusUnit: "meters",
    });
    const circleGraphic = new Graphic({
      geometry: circleGeometry,
      symbol: {
        type: "simple-fill", // autocasts as SimpleFillSymbol
        style: "solid",
        color: [3, 140, 255, 0.1],
        outline: {
          width: 1,
          color: [3, 140, 255],
        },
      },
    });
    // Add buffer graphic to the view
    bufferLayer.graphics.add(circleGraphic);
    // Parameters for queryPlacesNearPoint()
    const placesQueryParameters = new PlacesQueryParameters({
      categoryIds: [activeCategory],
      radius: 500, // set radius to 500 meters
      point: placePoint,
      icon: "png",
    });
    // The results variable represents the PlacesQueryResult
    const results = await places.queryPlacesNearPoint(placesQueryParameters);
    // Pass the PlacesQueryResult to the tabulatePlaces() function
    tabulatePlaces(results);
  }
  // @@End(showPlaces) @@Start(tabulatePlaces)
  // Investigate the individual PlaceResults from the array of results
  // from the PlacesQueryResult and process them
  function tabulatePlaces(results: __esri.PlacesQueryResult) {
    results.results.forEach((placeResult) => {
      // Pass each result to the addResult() function
      addResult(placeResult);
    });
  }
  // @@End(tabulatePlaces) @@Start(addResult)
  // Visualize the places on the map based on category
  // and list them on the info panel with more details
  async function addResult(place: __esri.PlaceResult) {
    const placeGraphic = new Graphic({
      geometry: place.location,
      symbol: {
        type: "picture-marker",
        url: place.icon.url,
        width: 15,
        height: 15,
      },
    });
    // Add each graphic to the GraphicsLayer
    placesLayer.graphics.add(placeGraphic);
    const infoDiv = document.createElement("calcite-list-item");
    infoDiv.label = place.name;
    infoDiv.description = `
  ${place.categories[0].label} -
  ${Number((place.distance! / 1000).toFixed(1))} km`;
    // If a place in the info panel is clicked
    // then open the feature's popup
    infoDiv.addEventListener("click", async () => {
      viewElement.openPopup({
        location: place.location,
        title: place.name,
      });
      // Move the view to center on the selected place feature
      viewElement.goTo(placeGraphic);
      // Fetch more details about each place based
      // on the place ID with all possible fields
      const fetchPlaceParameters = new FetchPlaceParameters({
        placeId: place.placeId,
        requestedFields: ["all"],
      });
      // Pass the FetchPlaceParameters and the location of the
      // selected place feature to the getDetails() function
      getDetails(fetchPlaceParameters);
    });
    resultsList.appendChild(infoDiv);
  }
  // @@End(addResult) @@Start(getDetails)
  // Get place details and display in the info panel
  async function getDetails(fetchPlaceParameters: FetchPlaceParameters) {
    // Get place details
    const result = await places.fetchPlace(fetchPlaceParameters);
    const placeDetails = result.placeDetails;
    // Set-up panel on the info for more place information
    flowItem = document.createElement(
      "calcite-flow-item"
    ) as HTMLCalciteFlowItemElement;
    flow.append(flowItem);
    flowItem.heading = placeDetails.name;
    flowItem.description = placeDetails.categories[0].label;
    const flowItems = flow.querySelectorAll("calcite-flow-item");
    // remove selection from other flow items
    flowItems.forEach((item) => (item.selected = false));
    // set current flow item to selected
    flowItem.selected = true;
    // Pass attributes from each place to the setAttribute() function
    setAttribute("Address", "map-pin", placeDetails.address.streetAddress);
    setAttribute("Phone", "mobile", placeDetails.contactInfo.telephone);
    setAttribute("Email", "email-address", placeDetails.contactInfo.email);
    setAttribute(
      "Facebook",
      "speech-bubble-social",
      placeDetails.socialMedia.facebookId
        ? `www.facebook.com/${placeDetails.socialMedia.facebookId}`
        : null
    );
    setAttribute(
      "X",
      "speech-bubbles",
      placeDetails.socialMedia.twitter
        ? `www.x.com/${placeDetails.socialMedia.twitter}`
        : null
    );
    setAttribute(
      "Instagram",
      "camera",
      placeDetails.socialMedia.instagram
        ? `www.instagram.com/${placeDetails.socialMedia.instagram}`
        : null
    );
    // If another place is clicked in the info panel, then close
    // the popup and remove the infoPanel
    flowItem.addEventListener("calciteFlowItemBack", async () => {
      viewElement.closePopup();
      flowItem.remove();
    });
  }
  // @@End(getDetails) @@Start(setAttribute)
  // Take each place attribute and display on info panel
  function setAttribute(
    heading: string | null,
    icon: string | null,
    validValue: string | null
  ) {
    if (heading && icon && validValue) {
      const element = document.createElement("calcite-block");
      element.heading = heading;
      element.description = validValue;
      const attributeIcon = document.createElement("calcite-icon");
      attributeIcon.icon = icon;
      attributeIcon.slot = "icon";
      attributeIcon.scale = "m";
      element.appendChild(attributeIcon);
      flowItem.appendChild(element);
    }
  }
}
// @@End(setAttribute)
