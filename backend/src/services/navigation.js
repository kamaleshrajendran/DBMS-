// Dijkstra's shortest path algorithm
class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(element, priority) {
    const item = { element, priority };
    let added = false;
    for (let i = 0; i < this.items.length; i++) {
      if (item.priority < this.items[i].priority) {
        this.items.splice(i, 0, item);
        added = true;
        break;
      }
    }
    if (!added) {
      this.items.push(item);
    }
  }

  dequeue() {
    return this.items.shift();
  }

  isEmpty() {
    return this.items.length === 0;
  }
}

const dijkstra = (graph, start, goal) => {
  const dist = {};
  const prev = {};
  const pq = new PriorityQueue();

  // Initialize distances
  Object.keys(graph).forEach((node) => {
    dist[node] = Infinity;
  });
  dist[start] = 0;
  pq.enqueue(start, 0);

  while (!pq.isEmpty()) {
    const { element: current } = pq.dequeue();

    if (current === goal) {
      break;
    }

    if (!graph[current]) continue;

    graph[current].forEach((edge) => {
      const alt = dist[current] + edge.weight;
      if (alt < dist[edge.to]) {
        dist[edge.to] = alt;
        prev[edge.to] = current;
        pq.enqueue(edge.to, alt);
      }
    });
  }

  // Reconstruct path
  const path = [];
  let current = goal;
  while (prev[current]) {
    path.unshift(current);
    current = prev[current];
  }
  if (current === start || start === goal) {
    path.unshift(start);
  }

  return {
    path,
    distance: dist[goal],
  };
};

// Convert path to step-by-step directions
const generateSteps = (path, nodes) => {
  const steps = [];
  for (let i = 0; i < path.length - 1; i++) {
    const current = nodes[path[i]];
    const next = nodes[path[i + 1]];

    if (current && next) {
      const dx = next.x - current.x;
      const dy = next.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const direction = Math.atan2(dy, dx) * (180 / Math.PI);

      let directionText = 'Go ';
      if (direction > -45 && direction <= 45) directionText += 'right';
      else if (direction > 45 && direction <= 135) directionText += 'down';
      else if (direction > 135 || direction <= -135) directionText += 'left';
      else directionText += 'up';

      steps.push(`${directionText} for ${distance.toFixed(0)}m to reach ${next.label}`);
    }
  }
  return steps;
};

module.exports = { dijkstra, generateSteps, PriorityQueue };
