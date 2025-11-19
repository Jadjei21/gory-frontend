import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRepo } from './context/RepoContext';
import { hierarchy, tree } from 'd3-hierarchy';

const WIDTH = 600;
const HEIGHT = 600;
const CENTER = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
const RADIUS = 200;

const polarToCartesian = (angle, radius) => {
  return [
    CENTER.x + radius * Math.cos(angle - Math.PI / 2),
    CENTER.y + radius * Math.sin(angle - Math.PI / 2)
  ];
};

const RadialBranchGraph = () => {
  const { currentRepo, refreshKey,exitRepo, triggerRefresh } = useRepo();
  const [branchTree, setBranchTree] = useState(null);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [hoveredBranch, setHoveredBranch] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showModal, setShowModal] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [scale, setScale] = useState(1);
  const [mergeMode, setMergeMode] = useState(false);
  const [hoveredTarget, setHoveredTarget] = useState(null);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState(null);
  const dragSpeed = 0.7; // 0.1 = very slow, 1 = default speed
  const zoomSpeed = 0.02; // Lower = slower (try 0.02 or 0.03 too)
  useEffect(() => {
    if (!branchTree) return;
  
    const root = hierarchy(branchTree);
    tree().size([2 * Math.PI, RADIUS])(root);
    const [cx, cy] = polarToCartesian(root.x, root.y);
  
    // Auto-center the root node in viewport
    const offsetX = window.innerWidth / 2 - cx;
    const offsetY = window.innerHeight / 2 - cy;
    setTranslate({ x: offsetX, y: offsetY });
  }, [branchTree]);
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? zoomSpeed : -zoomSpeed;

    setScale((prev) => Math.max(0.4, Math.min(3, prev + delta)));
  };
  
  const handleMouseDown = (e) => {
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseMoveDrag = (e) => {
    if (!dragStart) return;
    setTranslate((prev) => ({
        x: prev.x + (e.clientX - dragStart.x) * dragSpeed,
        y: prev.y + (e.clientY - dragStart.y) * dragSpeed
      }));
      
    setDragStart({ x: e.clientX, y: e.clientY });
  };
  
  const handleMouseUp = () => setDragStart(null);
  
  useEffect(() => {
    if (!currentRepo) return;

    const fetchData = async () => {
      try {
        const logRes = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app//logs/${currentRepo}`);
        const treeRes = await axios.get(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/branch-tree/${currentRepo}`);
        setCurrentBranch(logRes.data.current_branch);
        setSelectedBranch(logRes.data.current_branch);
        setBranchTree(treeRes.data);
      } catch (err) {
        console.error('Error loading graph data', err);
      }
    };

    fetchData();
  }, [currentRepo, refreshKey]);

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const handleSwitch = async (branchName) => {
    if (branchName === currentBranch) return;
    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/switch`, {
        targetBranch: branchName,
      });
      setTimeout(() => {
        triggerRefresh();
      }, 300);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to switch branch');
    }
  };

  const handleAddBranch = async () => {
    try {
      await axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}`, {
        branchName: newBranchName.trim(),
      });
      setShowModal(false);
      setNewBranchName('');
      triggerRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create branch');
    }
  };
  console.log(branchTree)
  if (!branchTree) return null;

  // Build the radial tree layout
  const root = hierarchy(branchTree);
  const layout = tree().size([2 * Math.PI, RADIUS]);
  layout(root);
  const centerNode = root;
const [cx, cy] = polarToCartesian(centerNode.x, centerNode.y);


  return (
    <div className="radial-container">
      <svg  width="100%"
  height="100%"
  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
  preserveAspectRatio="xMidYMid meet"onWheel={handleWheel}
  onMouseDown={handleMouseDown}
  onMouseMove={handleMouseMoveDrag}
  onMouseUp={handleMouseUp}
  onMouseLeave={handleMouseUp}
  style={{ cursor: dragStart ? 'grabbing' : 'grab' }}>
    <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
        {/* Edges */}
        {root.descendants().slice(1).map((node, i) => {
          const [x1, y1] = polarToCartesian(node.x, node.y);
          const [x2, y2] = polarToCartesian(node.parent.x, node.parent.y);
          return (
            <line
              key={`line-${i}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#999"
              strokeWidth="2"
              className="animated-line"
            />
          );
        })}
        </g>

        {/* Nodes */}
        <g transform={`translate(${translate.x}, ${translate.y}) scale(${scale})`}>
        {root.descendants().map((node, i) => {
          const [x, y] = polarToCartesian(node.x, node.y);
          const isCurrent = node.data.name === currentBranch;
          const isMain = node.depth === 0;
          const isDeletable = !isMain && !isCurrent;
          const angle = node.x;
          const offset = 35;
          const offsetAngleAdd = -45 * (Math.PI / 180);
          const offsetAngleMerge = 135 * (Math.PI / 180);
          const allNodes = root.descendants().map((node) => {
            const [x, y] = polarToCartesian(node.x, node.y);
            return {
              name: node.data.name,
              x,
              y,
              depth: node.depth,
              isCurrent: node.data.name === currentBranch
            };
          });
          const sourceNode = allNodes.find(n => n.isCurrent);

          const addX = x + Math.cos(angle + offsetAngleAdd) * 35;
          const addY = y + Math.sin(angle + offsetAngleAdd) * 35;
          
          const mergeX = x + Math.cos(angle + offsetAngleMerge) * 35;
          const mergeY = y + Math.sin(angle + offsetAngleMerge) * 35;
          
          return (<>{mergeMode && sourceNode && allNodes.map((target, i) => {
            if (target.name === currentBranch) return null;
          
            return (
              <g
                key={`merge-arrow-${target.name}`}
                onClick={(e) => {
                  e.stopPropagation();
                  axios.post(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/merge`, {
                    sourceBranch: target.name,
                    targetBranch: currentBranch
                  }).then(() => {
                    setMergeMode(false);
                    triggerRefresh();
                  }).catch(err => {
                    alert(err.response?.data?.error || 'Merge failed');
                    setMergeMode(false);
                  });
                }}
                onMouseEnter={() => setHoveredTarget(target.name)}
                onMouseLeave={() => setHoveredTarget(null)}
                style={{ cursor: 'pointer' }}
              >
                <defs>
                  <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#4caf50" />
                  </marker>
                </defs>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={target.x}
                  y2={target.y}
                  stroke="#4caf50"
                  strokeWidth={hoveredTarget === target.name ? 4 : 2}
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
            <g
              className="branch-node"
              key={`node-${i}`}
              onClick={() => handleSwitch(node.data.name)}
              onMouseEnter={() => setHoveredBranch(node.data)}
              onMouseLeave={() => setHoveredBranch(null)}
              onMouseMove={handleMouseMove}
              style={{ cursor: 'pointer' }}
            >
              {node.depth === 0 ? (
  <>
    <circle cx={x} cy={y} r={32} fill="none" stroke="#ff9800" strokeWidth="4" />
    <text
      x={x}
      y={y + 38}
      textAnchor="middle"
      fontSize="11"
      fill="#ff9800"
      fontWeight="bold"
    >
      ROOT
    </text>
  </>
) : isCurrent && (
  <circle cx={x} cy={y} r={30} fill="none" stroke="gold" strokeWidth="4" />
)}

              <circle cx={x} cy={y} r={25} fill="#1976d2" />
              <text
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
              >
                {node.data.name}
              </text>

              {/* Add pseudo-branch */}
              {isCurrent && (<>
                <g onClick={(e) => { e.stopPropagation(); setShowModal(true); }}>
                  <circle cx={addX} cy={addY} r={12} fill="white" stroke="#1976d2" strokeWidth="2" />
                  <text
                    x={addX}
                    y={addY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="16"
                    fill="#1976d2"
                  >
                    +
                  </text>
                </g>
                <g onClick={(e) => { e.stopPropagation(); setMergeMode((prev)=>!prev); }}>
                <circle cx={mergeX} cy={mergeY} r={12} fill="white" stroke="#4caf50" strokeWidth="2" />
                <text
                  x={mergeX}
                  y={mergeY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="14"
                  fill="#4caf50"
                >
                  ⇄
                </text>
              </g>
              </>
              )}
              {isDeletable && (
  <g
    className="delete-button"
    onClick={(e) => {
      e.stopPropagation();
      if (window.confirm(`Delete branch "${node.data.name}"?`)) {
        axios
          .delete(`https://gory-server-uwryumbkoq-uc.a.run.app/branch/${currentRepo}/${node.data.name}`)
          .then(() => triggerRefresh())
          .catch((err) => alert(err.response?.data?.error || 'Failed to delete branch'));
      }
    }}
  >
    <circle cx={x + 20} cy={y - 20} r={10}  fill="#f44336"/>
    <text
      x={x + 20}
      y={y - 20}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="19"
      fill="white"
    >
      -
    </text>
  </g>
)}

            </g>
            </>
          );
        })}
        </g>
      </svg>

      {hoveredBranch && (
        <div className="tooltip" style={{ left: tooltipPos.x + 10, top: tooltipPos.y + 10 }}>
          <strong>{hoveredBranch.name}</strong><br />
          Created: {new Date(hoveredBranch.createdAt).toLocaleDateString()}<br />
          Commits: {hoveredBranch.commits?.length || 0}<br />
          Subbranches: {hoveredBranch.children?.length || 0}
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>Create New Branch from <span style={{ color: '#1976d2' }}>{currentBranch}</span></h3>
            <input
              type="text"
              placeholder="New branch name"
              value={newBranchName}
              onChange={(e) => setNewBranchName(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={handleAddBranch} disabled={!newBranchName}>Create</button>
            </div>
          </div>
        </div>
      )}
      <button className="exit-button" onClick={exitRepo}>Exit Repo</button>

    </div>
  );
};

export default RadialBranchGraph;
