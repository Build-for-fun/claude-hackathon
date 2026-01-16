import { Node, Edge, Graph } from './types.js';

export class GraphManager {
  private graph: Graph;

  constructor() {
    this.graph = {
      nodes: new Map(),
      edges: new Map(),
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        nodeCount: 0,
        edgeCount: 0,
      },
    };
  }

  addNode(node: Omit<Node, 'timestamp'>): Node {
    const fullNode: Node = {
      ...node,
      timestamp: new Date().toISOString(),
    };
    
    this.graph.nodes.set(node.id, fullNode);
    this.updateMetadata();
    return fullNode;
  }

  addEdge(edge: Omit<Edge, 'id' | 'timestamp'>): Edge {
    const edgeId = `${edge.source}_${edge.type}_${edge.target}`;
    const fullEdge: Edge = {
      ...edge,
      id: edgeId,
      timestamp: new Date().toISOString(),
    };
    
    this.graph.edges.set(edgeId, fullEdge);
    this.updateMetadata();
    return fullEdge;
  }

  getNode(id: string): Node | undefined {
    return this.graph.nodes.get(id);
  }

  getEdge(id: string): Edge | undefined {
    return this.graph.edges.get(id);
  }

  getNodesByType(type: Node['type']): Node[] {
    return Array.from(this.graph.nodes.values()).filter(node => node.type === type);
  }

  getEdgesByType(type: Edge['type']): Edge[] {
    return Array.from(this.graph.edges.values()).filter(edge => edge.type === type);
  }

  getConnectedNodes(nodeId: string): Node[] {
    const connectedIds = new Set<string>();
    
    for (const edge of this.graph.edges.values()) {
      if (edge.source === nodeId) {
        connectedIds.add(edge.target);
      } else if (edge.target === nodeId) {
        connectedIds.add(edge.source);
      }
    }
    
    return Array.from(connectedIds)
      .map(id => this.graph.nodes.get(id))
      .filter((node): node is Node => node !== undefined);
  }

  getEdgesForNode(nodeId: string): Edge[] {
    return Array.from(this.graph.edges.values()).filter(
      edge => edge.source === nodeId || edge.target === nodeId
    );
  }

  findPath(startId: string, endId: string, maxDepth: number = 5): string[] | null {
    const visited = new Set<string>();
    const queue: Array<{ id: string; path: string[] }> = [{ id: startId, path: [startId] }];
    
    while (queue.length > 0) {
      const { id, path } = queue.shift()!;
      
      if (id === endId) {
        return path;
      }
      
      if (path.length >= maxDepth || visited.has(id)) {
        continue;
      }
      
      visited.add(id);
      
      const connectedNodes = this.getConnectedNodes(id);
      for (const node of connectedNodes) {
        if (!visited.has(node.id)) {
          queue.push({ id: node.id, path: [...path, node.id] });
        }
      }
    }
    
    return null;
  }

  findClusters(): string[][] {
    const visited = new Set<string>();
    const clusters: string[][] = [];
    
    for (const nodeId of this.graph.nodes.keys()) {
      if (!visited.has(nodeId)) {
        const cluster = this.exploreCluster(nodeId, visited);
        if (cluster.length > 1) {
          clusters.push(cluster);
        }
      }
    }
    
    return clusters;
  }

  private exploreCluster(startId: string, visited: Set<string>): string[] {
    const cluster: string[] = [];
    const queue = [startId];
    
    while (queue.length > 0) {
      const id = queue.shift()!;
      
      if (visited.has(id)) {
        continue;
      }
      
      visited.add(id);
      cluster.push(id);
      
      const connectedNodes = this.getConnectedNodes(id);
      for (const node of connectedNodes) {
        if (!visited.has(node.id)) {
          queue.push(node.id);
        }
      }
    }
    
    return cluster;
  }

  getStrongestConnections(limit: number = 10): Edge[] {
    return Array.from(this.graph.edges.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, limit);
  }

  getNodeDegree(nodeId: string): number {
    return this.getEdgesForNode(nodeId).length;
  }

  getMostConnectedNodes(limit: number = 10): Array<{ node: Node; degree: number }> {
    const nodeDegrees = Array.from(this.graph.nodes.values()).map(node => ({
      node,
      degree: this.getNodeDegree(node.id),
    }));
    
    return nodeDegrees
      .sort((a, b) => b.degree - a.degree)
      .slice(0, limit);
  }

  exportGraph(): { nodes: Node[]; edges: Edge[]; metadata: Graph['metadata'] } {
    return {
      nodes: Array.from(this.graph.nodes.values()),
      edges: Array.from(this.graph.edges.values()),
      metadata: this.graph.metadata,
    };
  }

  importGraph(data: { nodes: Node[]; edges: Edge[] }): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    
    for (const node of data.nodes) {
      this.graph.nodes.set(node.id, node);
    }
    
    for (const edge of data.edges) {
      this.graph.edges.set(edge.id, edge);
    }
    
    this.updateMetadata();
  }

  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
    this.updateMetadata();
  }

  private updateMetadata(): void {
    this.graph.metadata.updated = new Date().toISOString();
    this.graph.metadata.nodeCount = this.graph.nodes.size;
    this.graph.metadata.edgeCount = this.graph.edges.size;
  }

  getGraph(): Graph {
    return this.graph;
  }
}
