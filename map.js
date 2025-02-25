
// import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ5YW5rYW51cGFydGkiLCJhIjoiY203anppNjZpMGN6NTJ4cHNiNGMycTdhbiJ9.UKdefhjfy9fUaZ-2jK_2-g';

// const map = new mapboxgl.Map({
//   container: 'map',
//   style: 'mapbox://styles/mapbox/streets-v12',
//   center: [-71.09415, 42.36027],
//   zoom: 12,
//   minZoom: 5,
//   maxZoom: 18
// });

// map.on('load', async () => {
//   console.log("Map fully loaded");

//   const svg = d3.select(map.getCanvasContainer())
//       .append('svg')
//       .attr('width', window.innerWidth)
//       .attr('height', window.innerHeight);

//   map.addSource('boston_route', {
//     type: 'geojson',
//     data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
//   });

//   map.addLayer({
//     id: 'bike-lanes-boston',
//     type: 'line',
//     source: 'boston_route',
//     paint: {
//       'line-color': '#32D400',
//       'line-width': 5,
//       'line-opacity': 0.6
//     }
//   });

//   map.addSource('cambridge_route', {
//     type: 'geojson',
//     data: 'https://data.cambridgema.gov/resource/4i7y-a5as.geojson'
//   });

//   map.addLayer({
//     id: 'bike-lanes-cambridge',
//     type: 'line',
//     source: 'cambridge_route',
//     paint: {
//       'line-color': '#32D400',
//       'line-width': 5,
//       'line-opacity': 0.6
//     }
//   });

//   console.log("Boston and Cambridge bike lanes added!");

//   let jsonData;
//   try {
//     jsonData = await d3.json('https://dsc106.com/labs/lab07/data/bluebikes-stations.json');
//   } catch (error) {
//     console.error('Error loading station data:', error);
//     return;
//   }

//   let stations = jsonData.data.stations;

//   const trips = await d3.csv("https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv");

//   const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
//   const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);

//   stations = stations.map(station => {
//     let id = station.short_name;
//     station.arrivals = arrivals.get(id) ?? 0;
//     station.departures = departures.get(id) ?? 0;
//     station.totalTraffic = station.arrivals + station.departures;
//     return station;
//   });

//   const radiusScale = d3.scaleSqrt()
//     .domain([0, d3.max(stations, d => d.totalTraffic)])
//     .range([0, 25]);

//   function getCoords(station) {
//     if (!station.lat || !station.lon) return { cx: 0, cy: 0 };
//     const point = new mapboxgl.LngLat(+station.lon, +station.lat);
//     const { x, y } = map.project(point);
//     return { cx: x, cy: y };
//   }

//   const circles = svg.selectAll('circle')
//       .data(stations)
//       .enter()
//       .append('circle')
//       .attr('fill', 'steelblue')
//       .attr('fill-opacity', 0.6)
//       .attr('stroke', 'white')
//       .attr('stroke-width', 1)
//       .style('pointer-events', 'auto')
//       .each(function(d) {
//         d3.select(this).append('title')
//           .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
//       });

//   function updatePositions() {
//     circles.attr('cx', d => getCoords(d).cx)
//            .attr('cy', d => getCoords(d).cy)
//            .attr('r', d => radiusScale(d.totalTraffic));
//   }

//   updatePositions();
//   map.on('move', updatePositions);
//   map.on('zoom', updatePositions);
//   map.on('resize', updatePositions);
//   map.on('moveend', updatePositions);

//   window.addEventListener('resize', () => {
//     svg.attr('width', window.innerWidth)
//        .attr('height', window.innerHeight);
//     updatePositions();
//   });

//   console.log("Bike station visualization updated with traffic data.");
// });

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

  // Append an SVG overlay for D3
  const svg = d3.select(map.getCanvasContainer())
      .append('svg')
      .attr('width', window.innerWidth)
      .attr('height', window.innerHeight);

  // Add Boston Bike Lanes
  map.addSource('boston_route', {
    type: 'geojson',
    data: 'https://bostonopendata-boston.opendata.arcgis.com/datasets/boston::existing-bike-network-2022.geojson'
  });

  map.addLayer({
    id: 'bike-lanes-boston',
    type: 'line',
    source: 'boston_route',
    paint: {
      'line-color': '#32D400',
      'line-width': 5,
      'line-opacity': 0.6
    }
  });

  // Add Cambridge Bike Lanes
  map.addSource('cambridge_route', {
    type: 'geojson',
    data: 'https://data.cambridgema.gov/resource/4i7y-a5as.geojson'
  });

  map.addLayer({
    id: 'bike-lanes-cambridge',
    type: 'line',
    source: 'cambridge_route',
    paint: {
      'line-color': '#32D400',
      'line-width': 5,
      'line-opacity': 0.6
    }
  });

  console.log("Boston and Cambridge bike lanes added!");

  // Load Bike Station Data
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

  // Load and parse the traffic data
  const trips = await d3.csv("https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv");
  const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
  const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);

  stations = stations.map((station) => {
    let id = station.short_name;
    station.arrivals = arrivals.get(id) ?? 0;
    station.departures = departures.get(id) ?? 0;
    station.totalTraffic = station.arrivals + station.departures;
    return station;
  });

  // Create a square root scale for circle sizing
  const radiusScale = d3.scaleSqrt()
      .domain([0, d3.max(stations, d => d.totalTraffic)])
      .range([0, 25]);

  function getCoords(station) {
    if (!station.lat || !station.lon) {
        console.warn("Missing coordinates for station:", station);
        return { cx: 0, cy: 0 };
    }
    const point = new mapboxgl.LngLat(+station.lon, +station.lat);
    const { x, y } = map.project(point);
    return { cx: x, cy: y };
  }

  // Add circles for each station
  const circles = svg.selectAll("circle")
      .data(stations)
      .enter()
      .append("circle")
      .attr("r", d => radiusScale(d.totalTraffic))
      .attr("fill", "steelblue")
      .attr("fill-opacity", 0.6)
      .attr("stroke", "white")
      .attr("stroke-width", 1)
      .style("pointer-events", "auto")
      .on("mouseover", function(event, d) {
        d3.select("#tooltip")
          .style("left", event.pageX + "px")
          .style("top", event.pageY - 28 + "px")
          .style("display", "block")
          .style("position", "absolute") 
          .html(`${d.totalTraffic} trips<br>Departures: ${d.departures}<br>Arrivals: ${d.arrivals}`);
    })
    .on("mouseout", function() {
        d3.select("#tooltip").style("display", "none");
    })
    .each(function(d) {
        // Add <title> for browser tooltips
        d3.select(this)
          .append('title')
          .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
    });

  function updatePositions() {
    circles.attr("cx", d => getCoords(d).cx)
           .attr("cy", d => getCoords(d).cy);
  }

  updatePositions();
  map.on("move", updatePositions);
  map.on("zoom", updatePositions);
  map.on("resize", updatePositions);
  map.on("moveend", updatePositions);

  window.addEventListener("resize", () => {
    svg.attr("width", window.innerWidth)
       .attr("height", window.innerHeight);
    updatePositions();
  });

  console.log("Step 4: Window resize event listener added.");
});



