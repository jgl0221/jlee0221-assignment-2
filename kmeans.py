import numpy as np
import random

class KMeans:
    def __init__(self, n_clusters, max_iter=100):
        self.n_clusters = n_clusters
        self.max_iter = max_iter
        self.centroids = None

    def _initialize_centroids(self, data, method):
        if method == 'random':
            return data[random.sample(range(len(data)), self.n_clusters)]
        elif method == 'kmeans++':
            centroids = [data[np.random.randint(len(data))]]
            for _ in range(1, self.n_clusters):
                distances = np.min([np.linalg.norm(x - c) for c in centroids], axis=0)
                prob = distances / np.sum(distances)
                centroids.append(data[np.random.choice(range(len(data)), p=prob)])
            return np.array(centroids)
        elif method == 'farthest_first':
            centroids = [data[np.random.randint(len(data))]]
            for _ in range(1, self.n_clusters):
                dist = np.max([np.linalg.norm(x - c) for c in centroids], axis=0)
                farthest = data[np.argmax(dist)]
                centroids.append(farthest)
            return np.array(centroids)
        elif method == 'manual':
            return []  # Handle manually in the front-end

    def fit(self, data, method='random'):
        self.centroids = self._initialize_centroids(data, method)
        for _ in range(self.max_iter):
            labels = self._assign_clusters(data)
            new_centroids = np.array([data[labels == i].mean(axis=0) if np.any(labels == i) else self.centroids[i] for i in range(self.n_clusters)])

            if np.all(self.centroids == new_centroids):
                break
            self.centroids = new_centroids

        return labels

    def _assign_clusters(self, data):
        distances = np.array([np.linalg.norm(data - centroid, axis=1) for centroid in self.centroids])
        return np.argmin(distances, axis=0)
