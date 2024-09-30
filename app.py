from flask import Flask, render_template, jsonify, request
import numpy as np
import matplotlib.pyplot as plt
from kmeans import KMeans
import io
import base64

app = Flask(__name__)

# Initialize with some default values
data = np.random.rand(100, 2)
kmeans_model = None
centroids = []
initialization_method = 'random'

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate_data', methods=['POST'])
def generate_data():
    global data
    data = np.random.rand(100, 2)
    return jsonify({"status": "success"})

@app.route('/step', methods=['POST'])
def step():
    global kmeans_model, data
    print("Current dataset:", data)  # Log the dataset
    if kmeans_model is None:
        kmeans_model = KMeans(n_clusters=3)  # Initialize if not done already
    method = request.json['method']  # Get the initialization method from the request
    labels = kmeans_model.fit(data, method=method)  # Fit model with the selected method
    return jsonify({"status": "step completed", "labels": labels.tolist(), "centroids": kmeans_model.centroids.tolist()})


@app.route('/initialize', methods=['POST'])
def initialize():
    global kmeans_model, centroids, initialization_method
    initialization_method = request.json['method']  # Get the selected method
    kmeans_model = KMeans(n_clusters=getSelectedK())  # Use the selected number of clusters
    centroids = kmeans_model._initialize_centroids(data, initialization_method)  # Initialize centroids
    return jsonify({"centroids": centroids.tolist()})



@app.route('/plot')
def plot():
    global data, centroids
    fig, ax = plt.subplots()
    ax.scatter(data[:, 0], data[:, 1], color='blue')

    if centroids is not None:
        ax.scatter(centroids[:, 0], centroids[:, 1], color='red', marker='x')
    
    output = io.BytesIO()
    plt.savefig(output, format='png')
    output.seek(0)
    plot_data = base64.b64encode(output.read()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{plot_data}"

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
