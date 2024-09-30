let dataset = []; // Store the generated dataset
let centroids = []; // Store the centroids
let clusters = []; // Store cluster assignments
let isRunning = false; // To prevent multiple button clicks
let currentStep = 0; // To track the current step in the KMeans process
let kmeansModel = null; // Store the KMeans model

// Function to generate new dataset
document.getElementById('generateDataset').onclick = function() {
    if (isRunning) return; // Prevent new dataset generation while KMeans is running
    dataset = generateRandomDataset(); // Generate the dataset
    plotData(); // Function to visualize the data points
    clearClusters(); // Clear any existing clusters
};

// Function to step through KMeans
document.getElementById('stepThrough').onclick = function() {
    if (isRunning) return; // Prevent multiple clicks
    isRunning = true;
    stepKMeans(); // Implement this function
};

// Function to run KMeans to convergence
document.getElementById('runToConvergence').onclick = function() {
    if (isRunning) return; // Prevent multiple clicks
    isRunning = true;
    runKMeansToConvergence(); // Implement this function
};

// Function to reset algorithm
document.getElementById('resetAlgorithm').onclick = function() {
    resetKMeans(); // Reset algorithm
    dataset = generateRandomDataset(); // Generate a new dataset
    plotData(); // Plot the new dataset
};

// Function to get the selected number of clusters (k)
function getSelectedK() {
    return parseInt(document.getElementById('numClusters').value);
}

// Function to get the selected initialization method
function getSelectedMethod() {
    return document.getElementById('initMethod').value;
}

// Implement your dataset generation function
function generateRandomDataset() {
    const numPoints = 100; // Set number of points
    const data = [];
    for (let i = 0; i < numPoints; i++) {
        data.push([Math.random(), Math.random()]); // Random points between 0 and 1
    }
    return data;
}

function plotData() {
    // Clear existing plot
    d3.select("#plot").selectAll("*").remove();

    const svg = d3.select("#plot").append("svg")
        .attr("width", 500)
        .attr("height", 500);

    // Plot data points
    svg.selectAll("circle.data-point")
        .data(dataset)
        .enter().append("circle")
        .attr("class", "data-point")
        .attr("cx", d => d[0] * 500) // Scale to fit within the SVG
        .attr("cy", d => d[1] * 500) // Scale to fit within the SVG
        .attr("r", 5)
        .style("fill", "blue");

    // Plot centroids
    if (centroids.length > 0) {
        svg.selectAll("circle.centroid")
            .data(centroids)
            .enter().append("circle")
            .attr("class", "centroid")
            .attr("cx", d => d[0] * 500) // Scale to fit within the SVG
            .attr("cy", d => d[1] * 500) // Scale to fit within the SVG
            .attr("r", 7)
            .style("fill", "red");
    }
}


// Function to clear existing clusters
function clearClusters() {
    clusters = [];
    centroids = [];
    // Clear the visualization of clusters in your plot
}

function stepKMeans() {
    // Get the selected initialization method
    const method = getSelectedMethod();

    console.log("Sending step request with method:", method); // Log the method

    fetch('/step', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method: method })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Step response data:", data); // Log the response
        if (data.status === "step completed") {
            clusters = data.labels; // Get the labels returned from the server
            centroids = data.centroids; // Get the centroids returned from the server
            plotData(); // Re-plot the data points and centroids
        }
        isRunning = false; // Allow for new button clicks
    })
    .catch(err => {
        console.error('Error during step:', err);
        isRunning = false; // Reset running state on error
    });
}



function runKMeansToConvergence() {
    const method = getSelectedMethod();
    
    fetch('/initialize', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ method: method })
    })
    .then(response => response.json())
    .then(data => {
        centroids = data.centroids; // Initialize centroids
        
        // Run until convergence
        let iterations = 0;
        const maxIterations = 100; // Set a limit for iterations

        const runStep = () => {
            fetch('/step', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ method: method })
            })
            .then(response => response.json())
            .then(data => {
                clusters = data.labels; // Get the labels returned from the server
                centroids = data.centroids; // Get the centroids returned from the server
                plotData(); // Re-plot the data points and centroids
                
                if (data.status === "step completed") {
                    if (iterations < maxIterations) {
                        iterations++;
                        runStep(); // Continue to next step
                    } else {
                        isRunning = false; // Finished running to convergence
                    }
                }
            })
            .catch(err => {
                console.error('Error during run to convergence:', err);
                isRunning = false; // Reset running state on error
            });
        };

        runStep(); // Start the loop
    })
    .catch(err => {
        console.error('Error initializing:', err);
    });
}

function resetKMeans() {
    dataset = [];
    clusters = [];
    centroids = [];
    currentStep = 0;
    isRunning = false;
    d3.select("#plot").selectAll("*").remove(); // Clear the visualization
}
