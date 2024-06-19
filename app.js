Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYjBlYmYyNC1kNWRhLTRiNTUtOGNlYi02NGY1YWVhNjI2MjIiLCJpZCI6MTEwNzEsImlhdCI6MTYxOTcwNjI0M30.tlpaagcH93SjaHIn7eEVpanGSiH2yDylbGJZr2gsXnY';

//////////////////////////////////////////////////////////////////////////
// Creating the Viewer
//////////////////////////////////////////////////////////////////////////

 var viewer = new Cesium.Viewer('cesiumContainer', {
     scene3DOnly: true,
     selectionIndicator: false,
     timeline: false,
     animation: false,
     shadow: false,
     // // Set default basemap
     imageryProvider : Cesium.ArcGisMapServerImageryProvider({
     url : 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
     }),
     baseLayerPicker: true		 
 }); 

//////////////////////////////////////////////////////////////////////////
// Load 3D Tileset
//////////////////////////////////////////////////////////////////////////

var tileset = viewer.scene.primitives.add(
new Cesium.Cesium3DTileset({
 //url: Cesium.IonResource.fromAssetId(481524)
url: 'tileset/tileset.json'	
})
);
viewer.zoomTo(tileset);

//////////////////////////////////////////////////////////////////////////
// Style 3D Tileset
//////////////////////////////////////////////////////////////////////////

var defaultstyle = new Cesium.Cesium3DTileStyle({
     color : "color('WHITE')",
      show: true
 });
 
var energydemandstyle = new Cesium.Cesium3DTileStyle({
     color : {
        conditions : [
                
                ['Number(${Specific_s})>= 0' && 'Number(${Specific_s})< 60', 'color("#33ACFF")'],
                ['Number(${Specific_s})>= 60' && 'Number(${Specific_s})< 120', 'color("#2AFF00")'],
                ['Number(${Specific_s})>= 120' && 'Number(${Specific_s})< 170', 'color("#FFFF00")'],
                ['Number(${Specific_s})>= 170' && 'Number(${Specific_s})< 230', 'color("#FFA200")'],
                ['true', 'color("#FF0000")']
                
         ]
     },
     show: true
 });
 
var colorstyle1 = document.getElementById('3dbuildings');
var colorstyle2 = document.getElementById('heatdemand');
 
function set3DColorStyle() {
    if (colorstyle1.checked) {tileset.style = defaultstyle;
        document.getElementById("legend").style.display = "none";
          } 
    else if (colorstyle2.checked) {tileset.style = energydemandstyle;
        document.getElementById("legend").style.display = "block";
            }
    }
 
 colorstyle1.addEventListener('change', set3DColorStyle);
 colorstyle2.addEventListener('change', set3DColorStyle);	

//////////////////////////////////////////////////////////////////////////
// Selecting geometries in 3D Tileset
//////////////////////////////////////////////////////////////////////////

//Selecting a Building
var Pickers_3DTile_Activated = true;
// Information about the currently highlighted feature
function active3DTilePicker() {
    var highlighted = {
        feature: undefined,
        originalColor: new Cesium.Color()
    };
    // Information about the currently selected feature
    var selected = {
        feature: undefined,
        originalColor: new Cesium.Color()
    };

    // An entity object which will hold info about the currently selected feature for infobox display
    var selectedEntity = new Cesium.Entity();

    // Get default left click handler for when a feature is not picked on left click
    var clickHandler = viewer.screenSpaceEventHandler.getInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
    // Color a feature GREY on hover.
    viewer.screenSpaceEventHandler.setInputAction(function onMouseMove(movement) {
        if (Pickers_3DTile_Activated) {
            // If a feature was previously highlighted, undo the highlight
            if (Cesium.defined(highlighted.feature)) {
                highlighted.feature.color = highlighted.originalColor;
                highlighted.feature = undefined;
            }
            // Pick a new feature
            var picked3DtileFeature = viewer.scene.pick(movement.endPosition);
            if (!Cesium.defined(picked3DtileFeature)) {
                
                return;
            }					
            // Highlight the feature if it's not already selected.
            if (picked3DtileFeature !== selected.feature) {
                highlighted.feature = picked3DtileFeature;
                Cesium.Color.clone(picked3DtileFeature.color, highlighted.originalColor);
                picked3DtileFeature.color = Cesium.Color.GREY;
            }
        }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    // Color a feature AQUA on selection and show info in the InfoBox.
    viewer.screenSpaceEventHandler.setInputAction(function onLeftClick(movement) {
        if (Pickers_3DTile_Activated) {
            // If a feature was previously selected, undo the highlight
            if (Cesium.defined(selected.feature)) {
                selected.feature.color = selected.originalColor;
                selected.feature = undefined;
                var options = null;
            }
            // Pick a new feature
            var picked3DtileFeature = viewer.scene.pick(movement.position);
            if (!Cesium.defined(picked3DtileFeature)) {
                clickHandler(movement);
                return;
            }
            // Select the feature if it's not already selected
            if (selected.feature === picked3DtileFeature) {
                return;
            }
            selected.feature = picked3DtileFeature;
            // Save the selected feature's original color
            if (picked3DtileFeature === highlighted.feature) {
                Cesium.Color.clone(highlighted.originalColor, selected.originalColor);
                highlighted.feature = undefined;
            } else {
                Cesium.Color.clone(picked3DtileFeature.color, selected.originalColor);
            }
            // Highlight newly selected feature
            picked3DtileFeature.color = Cesium.Color.AQUA;
            // Set feature infobox description
            var featureName = "Building Attributes";
            selectedEntity.name = featureName;
            selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
            viewer.selectedEntity = selectedEntity;
            selectedEntity.description =
                '<table class="cesium-infoBox-defaultTable"><tbody>' +
                '<tr><th>gml ID</th><td>' + picked3DtileFeature.getProperty('gml_id') + '</td></tr>' +
                '<tr><th>gml parent ID</th><td>' + picked3DtileFeature.getProperty('gml_parent_id') + '</td></tr>' +
                '<tr><th>Sp. Heating Demand</th><td>' + picked3DtileFeature.getProperty('Specific_s') + ' ' + 'kWh/mÂ²Â·a' + '</td></tr>' +
                '</tbody></table>';   
    }
    }, 
    
    Cesium.ScreenSpaceEventType.LEFT_CLICK);
}
active3DTilePicker();
    
 // Chart.js code
 
 // Fetch GeoJSON data - please install CORS plugin otherwise this will not work
   fetch('https://ugl.hft-stuttgart.de/leaflet-stoeckach-heatdemand/building_data.json')
  .then(response => response.json())
  .then(data => {
    // Define array, extract and store the "Year_of_co" and "BuildingTy" values
     // Array is a special variable which can store valies. It is a common practice to store array using "const"	keyword but donot understant it as a constant value. 
    // Here const means array buildingYoc cannot be re-declared elsewhere
    const buildingYoc = data.features.map(function(feature) {
    return feature.properties.Year_of_co;
    });

    const primaryUsage = data.features.map(function(feature) {
    return feature.properties.PrimaryUsa;
    });

    // console.log(primaryUsage)

    // Count the occurrences of each year of construction and store it in array yocCounts
    const yocCounts = {};
    buildingYoc.forEach(function(Year_of_co) {
    if (yocCounts[Year_of_co]) {
        yocCounts[Year_of_co]++;
        } else {
        yocCounts[Year_of_co] = 1;
        }
    });
    
    // Count the occurrences of each building type and store it in array bldgtypeCounts		
    const bldgUsageCounts = {};
    primaryUsage.forEach(function(PrimaryUsa) {
    if (bldgUsageCounts[PrimaryUsa]) {
        bldgUsageCounts[PrimaryUsa]++;
        } else {
            bldgUsageCounts[PrimaryUsa] = 1;
        }
    });

    // Prepare the chart for year of construction and building type	data
    const yocLabels = Object.keys(yocCounts);
    const yocData = Object.values(yocCounts);
    
    const bldgUsageLabels = Object.keys(bldgUsageCounts);
    const bldgUsageData = Object.values(bldgUsageCounts);

    // Create the building year of construction distribution chart using Chart.js
    // Get the canvas context
var ctx1 = document.getElementById('myChart1').getContext('2d');

// Function to dynamically assign colors based on data values
function getColor(value) {
    // Colors based on ranges
    if (value >= 0 && value < 20) {
        return 'rgba(255, 206, 86, 0.5)'; // Yellow
    } else if (value >= 20 && value < 40) {
        return 'rgba(54, 162, 235, 0.8)'; // Blue
    } else {
        return 'rgba(75, 192, 192, 1)'; // Deep green
    }
}

// Create a new Chart instance
var yocChart = new Chart(ctx1, {
    type: 'bar', // Change chart type to bar
    data: {
        labels: yocLabels, // Array of labels (years of construction)
        datasets: [{
            label: 'No. of buildings', // Label for the dataset
            data: yocData, // Array of data (number of buildings)
            backgroundColor: yocData.map(value => getColor(value)), // Dynamically assign colors
            borderColor: 'rgba(54, 162, 235, 1)', // Border color of the bars
            borderWidth: 1 // Width of the border around bars
        }]
    },
    options: {
        responsive: true, // Make the chart responsive
        plugins: {
            legend: {
                position: 'bottom', // Position the legend at the bottom
            },
            title: {
                display: true, // Display the chart title
                text: 'Building Distribution According to its Year of Construction' // Text of the chart title
            }
        },
        scales: {
            y: {
                beginAtZero: true, // Ensure y-axis starts at zero
                stepSize: 15 // Interval between y-axis ticks
            },
            x: {
                title: {
                    display: true,
                    text: 'Year of Construction' // Label for the x-axis
                }
            }
        }
    }
});


    // Create the building type distribution chart using Chart.js
    var ctx2 = document.getElementById('myChart2').getContext('2d');
    var bldgTypeChart = new Chart(ctx2, {
        type: 'pie',
        data: {
        labels: bldgUsageLabels,
        datasets: [{
        data: bldgUsageData,
        backgroundColor: [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 206, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                        ],
                    }]
            },
        options: {
            responsive: true,
            plugins: {
            legend: {
            position: 'bottom',
            },
            title: {
                display: true,
                text: 'Utilization of Building'
                }
                },
            }
            });
        })