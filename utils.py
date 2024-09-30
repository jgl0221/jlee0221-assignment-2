import numpy as np

def init_random(X, k):
    return X[np.random.choice(X.shape[0], k, replace=False)]

def init_farthest_first(X, k):
    centroids = [X[np.random.choice(X.shape[0])]]  # First random point
    for _ in range(1, k):
        distances = np.min(np.linalg.norm(X[:, np.newaxis] - centroids, axis=2), axis=1)
        next_centroid = X[np.argmax(distances)]
        centroids.append(next_centroid)
    return np.array(centroids)

def init_kmeans_plus_plus(X, k):
    centroids = [X[np.random.choice(X.shape[0])]]
    for _ in range(1, k):
        distances = np.min(np.linalg.norm(X[:, np.newaxis] - centroids, axis=2), axis=1)
        probs = distances / np.sum(distances)
        next_centroid = X[np.random.choice(X.shape[0], p=probs)]
        centroids.append(next_centroid)
    return np.array(centroids)
