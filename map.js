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

// // Add the quantize scale for traffic flow
// const stationFlow = d3.scaleQuantize().domain([0, 1]).range([0, 0.5, 1]);

// map.on('load', async () => {
//   console.log("Map fully loaded");

//   const svg = d3.select(map.getCanvasContainer())
//     .append('svg')
//     .attr('width', window.innerWidth)
//     .attr('height', window.innerHeight);

//   await addBikeLanes();
//   const stations = await loadStationData();
//   const trips = await loadTripData();

//   let stationTraffic = computeStationTraffic(stations, trips);
//   renderStations(svg, stationTraffic);

//   setupTimeSlider(stations, trips, svg);
//   setupMapInteractions();
// });

// async function addBikeLanes() {
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

//   console.log("Bike lanes added");
// }

// async function loadStationData() {
//   try {
//     const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
//     let data = await d3.json(jsonurl);
//     console.log('Loaded Station Data:', data);
//     return data.data.stations;
//   } catch (error) {
//     console.error('Error loading station data:', error);
//     return [];
//   }
// }

// async function loadTripData() {
//   try {
//     const csvUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv';
//     let data = await d3.csv(csvUrl, trip => {
//       trip.started_at = new Date(trip.started_at);
//       trip.ended_at = new Date(trip.ended_at);
//       return trip;
//     });
//     console.log('Loaded Trip Data:', data);
//     return data;
//   } catch (error) {
//     console.error('Error loading trip data:', error);
//     return [];
//   }
// }

// function computeStationTraffic(stations, trips) {
//   const departures = d3.rollup(trips, v => v.length, d => d.start_station_id);
//   const arrivals = d3.rollup(trips, v => v.length, d => d.end_station_id);

//   return stations.map(station => ({
//     ...station,
//     arrivals: arrivals.get(station.short_name) ?? 0,
//     departures: departures.get(station.short_name) ?? 0,
//     totalTraffic: (arrivals.get(station.short_name) ?? 0) + (departures.get(station.short_name) ?? 0)
//   }));
// }

// function renderStations(svg, stations) {

//   const validStations = stations.filter(station => station.totalTraffic > 0);
//   const radiusScale = d3.scaleSqrt()
//     .domain([0, d3.max(stations, d => d.totalTraffic)])
//     .range([0, 25]);

//   const tooltip = d3.select("body").append("div")
//     .attr("id", "tooltip")
//     .style("position", "absolute")
//     .style("display", "none")
//     .style("background", "white")
//     .style("border", "1px solid black")
//     .style("padding", "5px");

//   const circles = svg.selectAll("circle")
//     .data(validStations)
//     .enter().append("circle")
//     .attr("r", d => radiusScale(d.totalTraffic))
//     .attr("fill", "steelblue")
//     .attr("fill-opacity", 0.6)
//     .attr("stroke", "white")
//     .attr("stroke-width", 1)
//     .style("pointer-events", "auto")
//     .style("--departure-ratio", d => stationFlow(d.departures / d.totalTraffic))
//     .on("mouseout", function() {
//       d3.select("#tooltip").style("display", "none");
//     })
//     .each(function(d) {
//       // Add <title> for browser tooltips
//       d3.select(this)
//         .append('title')
//         .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
//     });
// }

// function setupTimeSlider(stations, trips, svg) {
//   const timeSlider = document.getElementById('time-slider');
//   const selectedTime = document.getElementById('selected-time');
//   const anyTimeLabel = document.getElementById('any-time');

//   function updateTimeDisplay() {
//     let timeFilter = Number(timeSlider.value);
//     if (timeFilter === -1) {
//       selectedTime.textContent = '';
//       anyTimeLabel.style.display = 'block';
//     } else {
//       selectedTime.textContent = formatTime(timeFilter);
//       anyTimeLabel.style.display = 'none';
//     }
//     updateScatterPlot(stations, trips, timeFilter, svg);
//   }

//   timeSlider.addEventListener('input', updateTimeDisplay);
//   updateTimeDisplay();
// }

// function updateScatterPlot(stations, trips, timeFilter, svg) {
//   const filteredTrips = timeFilter === -1 ? trips : trips.filter(trip => {
//     const startMinutes = trip.started_at.getHours() * 60 + trip.started_at.getMinutes();
//     return Math.abs(startMinutes - timeFilter) <= 60;
//   });

//   const updatedStations = computeStationTraffic(stations, filteredTrips);
//   const validStations = updatedStations.filter(station => station.totalTraffic > 0);

//   const radiusScale = d3.scaleSqrt()
//     .domain([0, d3.max(updatedStations, d => d.totalTraffic)])
//     .range([0, 25]);

//   const circles = svg.selectAll("circle")
//     .data(validStations, d => d.short_name)
//     .join(
//       enter => enter.append("circle")
//         .attr("r", d => radiusScale(d.totalTraffic))
//         .attr("fill", "steelblue")
//         .attr("fill-opacity", 0.6)
//         .attr("stroke", "white")
//         .attr("stroke-width", 1)
//         .style("--departure-ratio", d => stationFlow(d.departures / d.totalTraffic))
//         .on("mouseout", function() {
//           d3.select("#tooltip").style("display", "none");
//         })
//         .each(function(d) {
//           // Add <title> for browser tooltips
//           d3.select(this)
//             .append('title')
//             .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
//         }),
//       update => update.attr("r", d => radiusScale(d.totalTraffic))
//         .style("--departure-ratio", d => stationFlow(d.departures / d.totalTraffic))
//     );
// }

// function setupMapInteractions() {
//   map.on("move", updatePositions);
//   map.on("zoom", updatePositions);
//   map.on("resize", updatePositions);
//   map.on("moveend", updatePositions);

//   window.addEventListener("resize", () => {
//     d3.select("svg")
//       .attr("width", window.innerWidth)
//       .attr("height", window.innerHeight);
//     updatePositions();
//   });
// }

// function updatePositions() {
//   d3.selectAll("circle")
//     .attr("cx", d => map.project([d.lon, d.lat]).x)
//     .attr("cy", d => map.project([d.lon, d.lat]).y);
// }

// function formatTime(minutes) {
//   const date = new Date(0, 0, 0, 0, minutes);
//   return date.toLocaleString('en-US', { timeStyle: 'short' });
// }


import mapboxgl from 'https://cdn.jsdelivr.net/npm/mapbox-gl@2.15.0/+esm';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

mapboxgl.accessToken = 'pk.eyJ1IjoiYXJ5YW5rYW51cGFydGkiLCJhIjoiY203anppNjZpMGN6NTJ4cHNiNGMycTdhbiJ9.UKdefhjfy9fUaZ-2jK_2-g';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v12',
  center: [-71.09415, 42.36027],
  zoom: 12,
  minZoom: 5,
  maxZoom: 18
});

// Add the quantize scale for traffic flow
const stationFlow = d3.scaleQuantize().domain([0, 1]).range([0, 0.5, 1]);

// Global variables for trip data and buckets
let trips = [];
let departuresByMinute = Array.from({ length: 1440 }, () => []);
let arrivalsByMinute = Array.from({ length: 1440 }, () => []);

map.on('load', async () => {
  console.log("Map fully loaded");

  const svg = d3.select(map.getCanvasContainer())
    .append('svg')
    .attr('width', window.innerWidth)
    .attr('height', window.innerHeight);

  await addBikeLanes();
  const stations = await loadStationData();
  trips = await loadTripData();

  // Pre-sort trips into minute buckets
  trips.forEach(trip => {
    const startedMinutes = minutesSinceMidnight(trip.started_at);
    const endedMinutes = minutesSinceMidnight(trip.ended_at);
    departuresByMinute[startedMinutes].push(trip);
    arrivalsByMinute[endedMinutes].push(trip);
  });

  let stationTraffic = computeStationTraffic(stations);
  renderStations(svg, stationTraffic);

  setupTimeSlider(stations, svg);
  setupMapInteractions();
});

async function addBikeLanes() {
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

  console.log("Bike lanes added");
}

async function loadStationData() {
  try {
    const jsonurl = 'https://dsc106.com/labs/lab07/data/bluebikes-stations.json';
    let data = await d3.json(jsonurl);
    console.log('Loaded Station Data:', data);
    return data.data.stations;
  } catch (error) {
    console.error('Error loading station data:', error);
    return [];
  }
}

async function loadTripData() {
  try {
    const csvUrl = 'https://dsc106.com/labs/lab07/data/bluebikes-traffic-2024-03.csv';
    let data = await d3.csv(csvUrl, trip => {
      trip.started_at = new Date(trip.started_at);
      trip.ended_at = new Date(trip.ended_at);
      return trip;
    });
    console.log('Loaded Trip Data:', data);
    return data;
  } catch (error) {
    console.error('Error loading trip data:', error);
    return [];
  }
}

function computeStationTraffic(stations, timeFilter = -1) {
  const departures = d3.rollup(
    filterByMinute(departuresByMinute, timeFilter),
    v => v.length,
    d => d.start_station_id
  );

  const arrivals = d3.rollup(
    filterByMinute(arrivalsByMinute, timeFilter),
    v => v.length,
    d => d.end_station_id
  );

  return stations.map(station => ({
    ...station,
    arrivals: arrivals.get(station.short_name) ?? 0,
    departures: departures.get(station.short_name) ?? 0,
    totalTraffic: (arrivals.get(station.short_name) ?? 0) + (departures.get(station.short_name) ?? 0)
  }));
}

function filterByMinute(tripsByMinute, minute) {
  if (minute === -1) {
    return tripsByMinute.flat(); // No filtering, return all trips
  }

  // Normalize both min and max minutes to the valid range [0, 1439]
  let minMinute = (minute - 60 + 1440) % 1440;
  let maxMinute = (minute + 60) % 1440;

  // Handle time filtering across midnight
  if (minMinute > maxMinute) {
    let beforeMidnight = tripsByMinute.slice(minMinute);
    let afterMidnight = tripsByMinute.slice(0, maxMinute);
    return beforeMidnight.concat(afterMidnight).flat();
  } else {
    return tripsByMinute.slice(minMinute, maxMinute).flat();
  }
}

function renderStations(svg, stations) {
  const validStations = stations.filter(station => station.totalTraffic > 0);
  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(stations, d => d.totalTraffic)])
    .range([0, 25]);

  const tooltip = d3.select("body").append("div")
    .attr("id", "tooltip")
    .style("position", "absolute")
    .style("display", "none")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px");

  const circles = svg.selectAll("circle")
    .data(validStations, d => d.short_name)
    .enter().append("circle")
    .attr("r", d => radiusScale(d.totalTraffic))
    .attr("fill", "steelblue")
    .attr("fill-opacity", 0.6)
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .style("pointer-events", "auto")
    .style("--departure-ratio", d => stationFlow(d.departures / d.totalTraffic))
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
      d3.select(this)
        .append('title')
        .text(`${d.totalTraffic} trips (${d.departures} departures, ${d.arrivals} arrivals)`);
    });
}

function setupTimeSlider(stations, svg) {
  const timeSlider = document.getElementById('time-slider');
  const selectedTime = document.getElementById('selected-time');
  const anyTimeLabel = document.getElementById('any-time');

  function updateTimeDisplay() {
    let timeFilter = Number(timeSlider.value);
    if (timeFilter === -1) {
      selectedTime.textContent = '';
      anyTimeLabel.style.display = 'block';
    } else {
      selectedTime.textContent = formatTime(timeFilter);
      anyTimeLabel.style.display = 'none';
    }
    updateScatterPlot(stations, timeFilter, svg);
  }

  timeSlider.addEventListener('input', updateTimeDisplay);
  updateTimeDisplay();
}

function updateScatterPlot(stations, timeFilter, svg) {
  const updatedStations = computeStationTraffic(stations