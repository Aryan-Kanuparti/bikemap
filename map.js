
import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ5YW5rYW51cGFydGkiLCJhIjoiY203anppNjZpMGN6NTJ4cHNiNGMycTdhbiJ9.UKdefhjfy9fUaZ-2jK_2-g';

// Initialize the map
const map = new mapboxgl.Map({
  container: 'map', // ID of the div where the map will render
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027], // Boston's longitude, latitude
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

// Wait for the map to load
map.on('load', async () => {
  console.log("Map fully loaded");
    // **Ensure an SVG overlay inside the Mapbox container**
  // **Ensure an SVG overlay inside the Mapbox container**
//   const svg = d3.select(map.getCanvasContainer()).append('svg')
//       .attr('width', window.innerWidth)
//       .attr('height', window.innerHeight)
//       .style('position', 'absolute')
//       .style('top', 0)
//       .style('left', 0);
    const svg = d3.select(map.getCanvasContainer())
        .append('svg')
        .attr('width', window.innerWidth)
        .attr('height', window.innerHeight);

  // **STEP 2.1: Add Boston Bike Lanes**
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
  });

  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': '#32D400',  // Bright green
      'line-width': 5,
      'line-opacity': 0.6
    }
  });

  // **STEP 2.3: Add Cambridge Bike Lanes**
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://data.cambridgema.gov/resource/4i7y-a5as.geojson'
  });

  map.addLayer({
    id: 'bike-lanes-cambridge',
    type: 'line',
    source: 'cambridge_route',
    paint: {
      'line-color': '#32D400',  // Matching style to Boston
      'line-width': 5,
      'line-opacity': 0.6
    }
  });

  console.log("Boston and Cambridge bike lanes added!");

  // **STEP 3: Load Bike Station Data**
  let jsonData;
  try {
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    jsonData = await d3.json(jsonurl);
    console.log('Loaded JSON Data:', jsonData);
  } catch (error) {
    console.error('Error loading JSON:', error);
    return;
  }

  let stations = jsonData.data.stations;
  console.log('Stations Array:', stations);
  console.log('First station properties:', stations[0]); // Check property names
  // **Helper function to convert lat/lon to pixel coordinates**
//   function getCoords(station) {
//     const { longitude, latitude } = station; // Ensure correct property names
//     const point = new mapboxgl.LngLat(+longitude, +latitude);
//     const { x, y } = map.project(point);
//     return { cx: x, cy: y };
//   }
  function getCoords(station) {
    console.log("Station data:", station); // Debugging line
    if (!station.lat || !station.lon) {
        console.warn("Missing coordinates for station:", station);
        return { cx: 0, cy: 0 }; // Prevents NaN error
    }
    
    const point = new mapboxgl.LngLat(+station.lon, +station.lat); // Ensure correct field names
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
}


  // **Append circles for each station**
  const circles = svg.selectAll('circle')
      .data(stations)
      .enter()
      .append('circle')
      .attr('r', 5)               // Circle size
      .attr('fill', 'steelblue')  // Circle color
      .attr('stroke', 'white')    // Border color
      .attr('stroke-width', 1)    // Border thickness
      .attr('opacity', 0.8);

  // **Function to update marker positions**
  function updatePositions() {
    circles.attr('cx', d => getCoords(d).cx)
           .attr('cy', d => getCoords(d).cy);
  }

  // **Initial position update**
  updatePositions();

  // **Update positions when the map moves**
  map.on('move', updatePositions);
  map.on('zoom', updatePositions);
  map.on('resize', updatePositions);
  map.on('moveend', updatePositions);
});
