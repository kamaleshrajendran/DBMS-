const NavGraph = require('../models/navgraph');
const { dijkstra, generateSteps } = require('../services/navigation');

exports.calculateRoute = async (req, res) => {
  try {
    const { floorId, startNodeId, endNodeId } = req.body;

    const navGraph = await NavGraph.findOne({ floorId });
    if (!navGraph) {
      return res.status(404).json({ message: 'Navigation graph not found' });
    }

    // Build adjacency list from edges
    const graph = {};
    navGraph.nodes.forEach((node) => {
      graph[node.id] = [];
    });

    navGraph.edges.forEach((edge) => {
      if (!graph[edge.from]) graph[edge.from] = [];
      graph[edge.from].push({ to: edge.to, weight: edge.weight });
    });

    // Find shortest path
    const { path, distance } = dijkstra(graph, startNodeId, endNodeId);

    // Convert node IDs to coordinates
    const pathCoordinates = path.map((nodeId) => {
      const node = navGraph.nodes.find((n) => n.id === nodeId);
      return node ? { x: node.x, y: node.y } : null;
    });

    // Create step-by-step directions
    const nodesMap = {};
    navGraph.nodes.forEach((node) => {
      nodesMap[node.id] = node;
    });
    const steps = generateSteps(path, nodesMap);

    res.json({
      path: pathCoordinates,
      pathNodeIds: path,
      distance,
      steps,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating route', error: error.message });
  }
};

exports.createNavGraph = async (req, res) => {
  try {
    const { floorId, nodes, edges } = req.body;

    let navGraph = await NavGraph.findOne({ floorId });
    if (navGraph) {
      navGraph.nodes = nodes;
      navGraph.edges = edges;
    } else {
      navGraph = new NavGraph({ floorId, nodes, edges });
    }

    await navGraph.save();
    res.status(201).json({ message: 'Navigation graph created', navGraph });
  } catch (error) {
    res.status(500).json({ message: 'Error creating navigation graph', error: error.message });
  }
};

exports.getNavGraph = async (req, res) => {
  try {
    const navGraph = await NavGraph.findOne({ floorId: req.params.floorId });
    if (!navGraph) {
      return res.status(404).json({ message: 'Navigation graph not found' });
    }
    res.json({ navGraph });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching navigation graph', error: error.message });
  }
};
