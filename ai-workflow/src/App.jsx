import { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  { id: '1', type: 'default', position: { x: 250, y: 0 }, data: { label: 'Start', prompt: '' } },
];

let id = 1;
const getId = () => `${++id}`;

export default function App() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState([]);
  const [executing, setExecuting] = useState(false);
  const [activeEdge, setActiveEdge] = useState(null);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, label: 'YES' }, eds)),
    []
  );

  const addNode = () => {
    const newNode = {
      id: getId(),
      type: 'default',
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 300 },
      data: { label: 'Decision Node', prompt: '' },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const clearAll = () => {
    setNodes(initialNodes);
    setEdges([]);
    setLogs([]);
    setInput('');
    id = 1;
  };

  const updateNodePrompt = (nodeId, prompt) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, prompt } } : node
      )
    );
  };

  const toggleEdgeLabel = (edgeId) => {
    setEdges((eds) =>
      eds.map((e) =>
        e.id === edgeId ? { ...e, label: e.label === 'YES' ? 'NO' : 'YES' } : e
      )
    );
  };

  const runWorkflow = async () => {
    setExecuting(true);
    setLogs([]);
    setActiveEdge(null);

    let currentNodeId = '1';
    const visited = new Set();
    const newLogs = [];

    while (currentNodeId && !visited.has(currentNodeId)) {
      visited.add(currentNodeId);
      const node = nodes.find((n) => n.id === currentNodeId);
      if (!node || !node.data.prompt) break;

      newLogs.push(`Running: "${node.data.prompt}"`);
      setLogs([...newLogs]);

      await new Promise((r) => setTimeout(r, 500));

      try {
        const res = await fetch('http://localhost:3001/api/run-node', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: node.data.prompt, input }),
        });
        const { result, error } = await res.json();
        if (error) {
          newLogs.push(`Error: ${error}`);
          setLogs([...newLogs]);
          break;
        }

        newLogs.push(`Result: ${result}`);
        setLogs([...newLogs]);

        const edge = edges.find((e) => e.source === currentNodeId && e.label === result);
        if (edge) {
          setActiveEdge(edge.id);
          await new Promise((r) => setTimeout(r, 800));
          currentNodeId = edge.target;
        } else {
          newLogs.push(`No ${result} edge found. Workflow ended.`);
          setLogs([...newLogs]);
          break;
        }
      } catch (err) {
        newLogs.push(`Error: ${err.message}`);
        setLogs([...newLogs]);
        break;
      }
    }

    setExecuting(false);
    setActiveEdge(null);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#0A1628', color: '#F8F7F4' }}>
      {/* Sidebar */}
      <div style={{ width: 320, padding: 20, borderRight: '1px solid #2A3040', display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' }}>
        <h2 style={{ color: '#C4A962', margin: 0 }}>AI Workflow Builder</h2>

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={addNode} style={{ flex: 1, padding: 10, background: '#112240', color: '#F8F7F4', border: '1px solid #2A3040', borderRadius: 4, cursor: 'pointer' }}>Add Node</button>
          <button onClick={clearAll} style={{ flex: 1, padding: 10, background: '#3a1a1a', color: '#f44336', border: '1px solid #f44336', borderRadius: 4, cursor: 'pointer' }}>Clear All</button>
        </div>

        <input
          placeholder="Workflow input text..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ padding: 10, background: '#112240', color: '#F8F7F4', border: '1px solid #2A3040', borderRadius: 4 }}
        />
        <button
          onClick={runWorkflow}
          disabled={executing}
          style={{ padding: 12, background: executing ? '#555' : '#C4A962', color: '#0A1628', border: 'none', borderRadius: 4, fontWeight: 600, cursor: executing ? 'not-allowed' : 'pointer' }}
        >
          {executing ? 'Running...' : 'Run Workflow'}
        </button>

        {/* Node editors */}
        {nodes.filter((n) => n.id !== '1').map((node) => (
          <div key={node.id} style={{ background: '#112240', padding: 10, borderRadius: 4, border: '1px solid #2A3040' }}>
            <div style={{ fontSize: 12, color: '#787671', marginBottom: 4 }}>Node {node.id}</div>
            <input
              placeholder="Prompt (YES/NO question)"
              value={node.data.prompt}
              onChange={(e) => updateNodePrompt(node.id, e.target.value)}
              style={{ width: '100%', padding: 8, background: '#0A1628', color: '#F8F7F4', border: '1px solid #2A3040', borderRadius: 4, fontSize: 12 }}
            />
          </div>
        ))}

        {/* Edge toggles */}
        {edges.length > 0 && (
          <div style={{ background: '#112240', padding: 10, borderRadius: 4, border: '1px solid #2A3040' }}>
            <div style={{ color: '#C4A962', marginBottom: 8, fontSize: 12 }}>Edges</div>
            {edges.map((edge) => (
              <div key={edge.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                <span style={{ fontSize: 12, color: '#B8B5AE' }}>{edge.source} → {edge.target}</span>
                <button
                  onClick={() => toggleEdgeLabel(edge.id)}
                  style={{
                    padding: '4px 10px',
                    background: edge.label === 'NO' ? '#f44336' : '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {edge.label || 'YES'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div style={{ background: '#112240', padding: 10, borderRadius: 4, border: '1px solid #2A3040', maxHeight: 200, overflowY: 'auto', fontSize: 12 }}>
            <div style={{ color: '#C4A962', marginBottom: 6 }}>Execution Log</div>
            {logs.map((log, i) => (
              <div key={i} style={{ color: '#B8B5AE', padding: '2px 0' }}>{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Flow Canvas */}
      <div style={{ flex: 1 }} ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges.map((e) => ({
            ...e,
            label: e.label || 'YES',
            style: {
              stroke: activeEdge === e.id ? '#C4A962' : e.label === 'NO' ? '#f44336' : '#4CAF50',
              strokeWidth: activeEdge === e.id ? 3 : 2,
            },
            animated: activeEdge === e.id,
          }))}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background color="#2A3040" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
}