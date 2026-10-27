/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Modern, Ultra-Responsive & Scalable Board Component for Maen Dam-Daman.
 * Supports:
 * - Portrait (Tegak - Optimal for mobile & maximum screen presence) [Default]
 * - Landscape (Mendatar - Classic traditional layout)
 * - Modern high-finish themes (Modern Emerald & Gold, Premium Teak Wood, Obsidian Slate)
 * - Tactile 3D ceramic pieces with tactile glyphs and glowing state indicators
 * - Dynamic scaling & zoom controls (+ / - slider, quick presets)
 * - Color-blind accessible geometric patterns
 */

import React, { useRef, useState } from 'react';
import { BOARD_NODES, RAW_EDGES } from '../game/boardData';
import { GameState, Move, Piece, PlayerId } from '../game/rulesEngine';
import { sound } from '../game/audio';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Smartphone,
  Monitor,
  Tag,
  Maximize2,
} from 'lucide-react';
import { Language, translations } from '../i18n';

export type BoardTheme = 'green' | 'wood' | 'obsidian';
export type BoardOrientation = 'portrait' | 'landscape';

interface BoardProps {
  gameState: GameState;
  selectedPieceId: string | null;
  legalMovesForSelected: Move[];
  onSelectPiece: (pieceId: string) => void;
  onSelectDestination: (toNodeId: string) => void;
  boardTheme: BoardTheme;
  orientation: BoardOrientation;
  onToggleOrientation: () => void;
  isFlipped: boolean;
  onToggleFlip: () => void;
  boardScale: number;
  onScaleChange: (newScale: number) => void;
  showNodeLabels: boolean;
  onToggleNodeLabels: () => void;
  disabled?: boolean;
  lang?: Language;
  gameMode?: 'ai' | 'pvp' | 'online';
}

export const Board: React.FC<BoardProps> = ({
  gameState,
  selectedPieceId,
  legalMovesForSelected,
  onSelectPiece,
  onSelectDestination,
  boardTheme,
  orientation,
  onToggleOrientation,
  isFlipped,
  onToggleFlip,
  boardScale,
  onScaleChange,
  showNodeLabels,
  onToggleNodeLabels,
  disabled = false,
  lang = 'id',
  gameMode = 'ai',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const t = translations[lang];
  const isPortrait = orientation === 'portrait';

  // SVG dimensions:
  // Portrait: 560 x 860 (ideal for modern smartphones and vertical display)
  // Landscape: 980 x 580 (classic horizontal display)
  const SVG_WIDTH = isPortrait ? 560 : 980;
  const SVG_HEIGHT = isPortrait ? 860 : 580;

  // Project normalized 0..1 (x, y) coordinates to SVG pixels
  // In landscape: P1 is on the left (nx=0.05..0.26), P2 on the right (nx=0.74..0.95)
  // In portrait:  P1 is at the BOTTOM (ny_port=0.76..0.96), P2 at the TOP (ny_port=0.04..0.24)
  const getCoordinates = (nodeId: string): { x: number; y: number } => {
    const node = BOARD_NODES[nodeId];
    if (!node) return { x: 0, y: 0 };

    if (isPortrait) {
      // Rotate 90 degrees so P1 (left wing) is at bottom, P2 (right wing) is at top:
      // x_port corresponds to node.y (columns: A=0.12 left to E=0.88 right)
      // y_port corresponds to 1 - node.x (P1 nx=0.05 -> y=0.95 bottom; P2 nx=0.95 -> y=0.05 top)
      let nx = node.y;
      let ny = 1 - node.x;

      if (isFlipped) {
        nx = 1 - nx;
        ny = 1 - ny;
      }

      const padX = 40;
      const padY = 40;
      return {
        x: nx * (SVG_WIDTH - padX * 2) + padX,
        y: ny * (SVG_HEIGHT - padY * 2) + padY,
      };
    } else {
      // Landscape:
      let nx = node.x;
      let ny = node.y;

      if (isFlipped) {
        nx = 1 - nx;
        ny = 1 - ny;
      }

      const padX = 45;
      const padY = 40;
      return {
        x: nx * (SVG_WIDTH - padX * 2) + padX,
        y: ny * (SVG_HEIGHT - padY * 2) + padY,
      };
    }
  };

  // Modern, high-craft theme visual palettes
  const themeStyles = {
    green: {
      // Modern Forest Velvet & Brass (Upgraded from flat lime green)
      boardBg: '#1b4324',
      boardInner: '#245a30',
      boardSurface: '#2d6d3b',
      borderRim: '#4a8e5a',
      goldAccent: '#eab308',
      gridLines: '#fef08a',
      wingLines: '#ffffff',
      nodeFill: '#14351c',
      nodeRing: '#3d7a4c',
      labelColor: '#fef3c7',
      p1GradStart: '#fb923c',
      p1GradEnd: '#c2410c',
      p1Rim: '#fed7aa',
      p2GradStart: '#38bdf8',
      p2GradEnd: '#0369a1',
      p2Rim: '#bae6fd',
    },
    wood: {
      // Modern Teak & Laser-Carved Amber
      boardBg: '#2a170d',
      boardInner: '#3a2012',
      boardSurface: '#472818',
      borderRim: '#7c4322',
      goldAccent: '#f59e0b',
      gridLines: '#fcd34d',
      wingLines: '#ffedd5',
      nodeFill: '#1f1008',
      nodeRing: '#61341a',
      labelColor: '#fef3c7',
      p1GradStart: '#f97316',
      p1GradEnd: '#9a3412',
      p1Rim: '#ffedd5',
      p2GradStart: '#0ea5e9',
      p2GradEnd: '#075985',
      p2Rim: '#e0f2fe',
    },
    obsidian: {
      // Cyber / Sleek Graphite Slate & Neon Gold
      boardBg: '#090a0f',
      boardInner: '#12141c',
      boardSurface: '#191c28',
      borderRim: '#2d3348',
      goldAccent: '#38bdf8',
      gridLines: '#fbbf24',
      wingLines: '#94a3b8',
      nodeFill: '#0b0d13',
      nodeRing: '#2e3549',
      labelColor: '#cbd5e1',
      p1GradStart: '#f43f5e',
      p1GradEnd: '#9f1239',
      p1Rim: '#ffe4e6',
      p2GradStart: '#06b6d4',
      p2GradEnd: '#0e7490',
      p2Rim: '#cffafe',
    },
  }[boardTheme];

  // Map legal destinations for fast check
  const destinationMap = new Map<string, Move>();
  legalMovesForSelected.forEach((m) => {
    destinationMap.set(m.toNodeId, m);
  });

  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];

  const handleNodeClick = (nodeId: string) => {
    if (disabled) return;

    if (destinationMap.has(nodeId)) {
      onSelectDestination(nodeId);
      return;
    }

    const occupantId = gameState.nodeOccupancy[nodeId];
    if (occupantId) {
      const piece = gameState.pieces[occupantId];
      if (piece && piece.owner === gameState.currentPlayer) {
        sound.playSelect();
        onSelectPiece(piece.id);
      }
    }
  };

  const [showControls, setShowControls] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full flex-1 min-h-0 relative select-none">
      {/* Floating Board Quick Controls Button */}
      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 z-30 flex items-center gap-1.5">
        <button
          onClick={onToggleFlip}
          className="p-1.5 sm:p-2 rounded-xl bg-stone-900/85 hover:bg-stone-800 border border-stone-800/80 text-stone-300 hover:text-white backdrop-blur-md shadow-md transition active:scale-95"
          title={lang === 'en' ? 'Flip board 180°' : 'Putar papan 180°'}
          aria-label="Flip board"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={onToggleNodeLabels}
          className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-md shadow-md transition active:scale-95 ${
            showNodeLabels
              ? 'bg-amber-600/80 border-amber-500 text-white shadow-amber-950/40'
              : 'bg-stone-900/85 border-stone-800/80 text-stone-400 hover:text-white'
          }`}
          title={lang === 'en' ? 'Toggle Node Labels (A..Z)' : 'Tampilkan Simpul Graf (A..Z)'}
          aria-label="Toggle node labels"
        >
          <Tag size={14} />
        </button>
        <button
          onClick={() => setShowControls(!showControls)}
          className={`p-1.5 sm:p-2 rounded-xl border backdrop-blur-md shadow-md transition active:scale-95 ${
            showControls
              ? 'bg-stone-800 border-amber-500/80 text-amber-300'
              : 'bg-stone-900/85 border-stone-800/80 text-stone-400 hover:text-white'
          }`}
          title={lang === 'en' ? 'Display & Zoom Settings' : 'Pengaturan Tampilan & Zoom'}
          aria-label="Display settings"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Floating Expandable Zoom & Orientation Panel */}
      {showControls && (
        <div className="absolute top-10 sm:top-12 right-1 sm:right-2 z-30 p-2.5 bg-stone-900/95 border border-stone-700/80 rounded-2xl backdrop-blur-md shadow-2xl text-xs text-stone-200 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-2 min-w-[220px]">
          <div className="flex items-center justify-between border-b border-stone-800 pb-1.5">
            <span className="font-bold text-[11px] text-amber-400">
              {lang === 'en' ? 'Board Controls' : 'Kontrol Papan'}
            </span>
            <button
              onClick={() => setShowControls(false)}
              className="text-stone-500 hover:text-stone-300 text-xs px-1"
            >
              ✕
            </button>
          </div>

          {/* Orientation Toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-stone-400">
              {lang === 'en' ? 'Orientation:' : 'Orientasi:'}
            </span>
            <button
              onClick={onToggleOrientation}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-semibold transition text-[11px] ${
                isPortrait
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              {isPortrait ? <Smartphone size={12} /> : <Monitor size={12} />}
              <span>{isPortrait ? 'Portrait' : 'Landscape'}</span>
            </button>
          </div>

          {/* Zoom Slider */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => onScaleChange(Math.max(0.65, boardScale - 0.1))}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 transition"
              title="Perkecil"
            >
              <ZoomOut size={13} />
            </button>
            <input
              type="range"
              min="0.65"
              max="1.35"
              step="0.05"
              value={boardScale}
              onChange={(e) => onScaleChange(parseFloat(e.target.value))}
              className="w-24 accent-amber-500 cursor-pointer h-1.5 bg-stone-700 rounded-lg"
            />
            <button
              onClick={() => onScaleChange(Math.min(1.35, boardScale + 0.1))}
              className="p-1 rounded hover:bg-stone-800 text-stone-300 transition"
              title="Perbesar"
            >
              <ZoomIn size={13} />
            </button>
            <span className="font-mono text-[10px] text-amber-400 min-w-6 text-right">
              {Math.round(boardScale * 100)}%
            </span>
          </div>

          {/* Fit Preset */}
          <button
            onClick={() => onScaleChange(1.0)}
            className="w-full py-1 text-center rounded-lg bg-stone-800 hover:bg-stone-700 text-[11px] font-medium text-stone-300 transition"
          >
            {lang === 'en' ? 'Reset to 100% Fit' : 'Reset ke 100% Pas'}
          </button>
        </div>
      )}

      {/* Main Board Viewport with Smooth Dynamic Scaling */}
      <div
        ref={containerRef}
        className="w-full h-full flex-1 flex items-center justify-center p-1 sm:p-2 min-h-0 overflow-visible transition-all"
      >
        <div
          className="relative transition-transform duration-200 ease-out origin-center flex items-center justify-center max-h-full max-w-full"
          style={{
            transform: `scale(${boardScale})`,
            width: '100%',
            maxWidth: isPortrait ? '480px' : '860px',
          }}
        >
          <svg
            viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
            preserveAspectRatio="xMidYMid meet"
            className={`w-full max-h-[66dvh] sm:max-h-[72vh] h-auto drop-shadow-2xl rounded-3xl touch-manipulation transition-opacity duration-200 ${
              disabled ? 'pointer-events-none opacity-95 cursor-wait' : ''
            }`}
          >
            <defs>
              {/* Shadows & 3D Depth Filters */}
              <filter id="modernBoardGlow" x="-5%" y="-5%" width="110%" height="110%">
                <feDropShadow dx="0" dy="12" stdDeviation="16" floodColor="#000000" floodOpacity="0.65" />
              </filter>
              <filter id="piece3dDepth" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="1.5" dy="4" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.75" />
              </filter>
              <filter id="targetPulseGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>

              {/* Player 1 Tactile Stone Gradient */}
              <radialGradient id="p1ModernGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#ffb088" />
                <stop offset="35%" stopColor={themeStyles.p1GradStart} />
                <stop offset="85%" stopColor={themeStyles.p1GradEnd} />
                <stop offset="100%" stopColor="#7c2d12" />
              </radialGradient>

              {/* Player 2 Tactile Stone Gradient */}
              <radialGradient id="p2ModernGrad" cx="35%" cy="30%" r="65%">
                <stop offset="0%" stopColor="#bae6fd" />
                <stop offset="35%" stopColor={themeStyles.p2GradStart} />
                <stop offset="85%" stopColor={themeStyles.p2GradEnd} />
                <stop offset="100%" stopColor="#0c4a6e" />
              </radialGradient>

              {/* Board Bevel Radial Highlight */}
              <radialGradient id="boardSheen" cx="50%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
                <stop offset="70%" stopColor="#000000" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0.45" />
              </radialGradient>
            </defs>

            {/* Board Base Frame Plate */}
            <rect
              x="6"
              y="6"
              width={SVG_WIDTH - 12}
              height={SVG_HEIGHT - 12}
              rx="28"
              fill={themeStyles.boardBg}
              stroke={themeStyles.borderRim}
              strokeWidth="5"
              filter="url(#modernBoardGlow)"
            />

            {/* Inset Playing Surface */}
            <rect
              x="18"
              y="18"
              width={SVG_WIDTH - 36}
              height={SVG_HEIGHT - 36}
              rx="22"
              fill={themeStyles.boardInner}
              stroke={themeStyles.borderRim}
              strokeWidth="2"
              opacity="0.95"
            />

            {/* Ambient Surface Sheen */}
            <rect
              x="20"
              y="20"
              width={SVG_WIDTH - 40}
              height={SVG_HEIGHT - 40}
              rx="20"
              fill="url(#boardSheen)"
              className="pointer-events-none"
            />

            {/* Decorative Heritage Filigree in Corners */}
            <g opacity="0.35" stroke={themeStyles.goldAccent} strokeWidth="1.5" fill="none">
              <path d={`M 30,30 L 60,30 M 30,30 L 30,60`} />
              <path d={`M ${SVG_WIDTH - 30},30 L ${SVG_WIDTH - 60},30 M ${SVG_WIDTH - 30},30 L ${SVG_WIDTH - 30},60`} />
              <path d={`M 30,${SVG_HEIGHT - 30} L 60,${SVG_HEIGHT - 30} M 30,${SVG_HEIGHT - 30} L 30,${SVG_HEIGHT - 60}`} />
              <path d={`M ${SVG_WIDTH - 30},${SVG_HEIGHT - 30} L ${SVG_WIDTH - 60},${SVG_HEIGHT - 30} M ${SVG_WIDTH - 30},${SVG_HEIGHT - 30} L ${SVG_WIDTH - 30},${SVG_HEIGHT - 60}`} />
            </g>

            {/* Subtle Inscribed Branding */}
            {isPortrait ? (
              <g opacity="0.4" fill={themeStyles.labelColor} className="font-serif">
                <text
                  x={SVG_WIDTH / 2}
                  y="34"
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="4"
                  textAnchor="middle"
                >
                  {t.boardTopTerritory(isFlipped, gameMode === 'ai')}
                </text>
                <text
                  x={SVG_WIDTH / 2}
                  y={SVG_HEIGHT - 24}
                  fontSize="12"
                  fontWeight="bold"
                  letterSpacing="4"
                  textAnchor="middle"
                >
                  {t.boardBottomTerritory(isFlipped, gameMode === 'ai')}
                </text>
              </g>
            ) : (
              <g opacity="0.4" fill={themeStyles.labelColor} className="font-serif">
                <text
                  x="30"
                  y={SVG_HEIGHT / 2}
                  fontSize="13"
                  fontWeight="bold"
                  letterSpacing="3"
                  transform={`rotate(-90 30,${SVG_HEIGHT / 2})`}
                  textAnchor="middle"
                >
                  MAEN DAM-DAMAN
                </text>
                <text
                  x={SVG_WIDTH - 30}
                  y={SVG_HEIGHT / 2}
                  fontSize="13"
                  fontWeight="bold"
                  letterSpacing="3"
                  transform={`rotate(90 ${SVG_WIDTH - 30},${SVG_HEIGHT / 2})`}
                  textAnchor="middle"
                >
                  {t.boardLandscapeSubtitle}
                </text>
              </g>
            )}

            {/* 76 Board Edges / Track Lines */}
            <g strokeLinecap="round" strokeLinejoin="round">
              {RAW_EDGES.map(([uId, vId], idx) => {
                const uCoords = getCoordinates(uId);
                const vCoords = getCoordinates(vId);

                const uNode = BOARD_NODES[uId];
                const vNode = BOARD_NODES[vId];
                const isWing = uNode.region !== 'square' || vNode.region !== 'square';
                const strokeColor = isWing ? themeStyles.wingLines : themeStyles.gridLines;
                const strokeW = isWing ? 4.2 : 4.8;

                return (
                  <line
                    key={`edge-${idx}`}
                    x1={uCoords.x}
                    y1={uCoords.y}
                    x2={vCoords.x}
                    y2={vCoords.y}
                    stroke={strokeColor}
                    strokeWidth={strokeW}
                    opacity="0.92"
                  />
                );
              })}
            </g>

            {/* Last Move Trajectory (Dashed Indicator) */}
            {lastMove && (
              <line
                x1={getCoordinates(lastMove.fromNodeId).x}
                y1={getCoordinates(lastMove.fromNodeId).y}
                x2={getCoordinates(lastMove.toNodeId).x}
                y2={getCoordinates(lastMove.toNodeId).y}
                stroke={lastMove.isCapture ? '#ef4444' : '#38bdf8'}
                strokeWidth="4.5"
                strokeDasharray="6,4"
                opacity="0.85"
                filter="url(#targetPulseGlow)"
              />
            )}

            {/* Visual Indicator of Exactly Where Piece Was Captured */}
            {lastMove && lastMove.isCapture && lastMove.capturedNodeId && (
              <g>
                <circle
                  cx={getCoordinates(lastMove.capturedNodeId).x}
                  cy={getCoordinates(lastMove.capturedNodeId).y}
                  r="18"
                  fill="rgba(239, 68, 68, 0.35)"
                  stroke="#ef4444"
                  strokeWidth="3"
                  strokeDasharray="4,3"
                  className="animate-pulse"
                />
                <text
                  x={getCoordinates(lastMove.capturedNodeId).x}
                  y={getCoordinates(lastMove.capturedNodeId).y + 5}
                  fill="#ef4444"
                  fontSize="15"
                  fontWeight="900"
                  textAnchor="middle"
                  className="pointer-events-none drop-shadow font-mono"
                >
                  ✕
                </text>
              </g>
            )}

            {/* All 37 Node Intersections */}
            <g>
              {Object.values(BOARD_NODES).map((node) => {
                const { x, y } = getCoordinates(node.id);
                const isDest = destinationMap.has(node.id);
                const destMove = destinationMap.get(node.id);
                const isCaptureDest = isDest && destMove?.isCapture;
                const isHovered = hoveredNode === node.id;
                const occupantId = gameState.nodeOccupancy[node.id];

                return (
                  <g
                    key={`node-${node.id}`}
                    className="cursor-pointer"
                    onClick={() => handleNodeClick(node.id)}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {/* Generous touch target area */}
                    <circle cx={x} cy={y} r="26" fill="transparent" />

                    {/* Node Dot / Intersection Rivet */}
                    <circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill={themeStyles.nodeFill}
                      stroke={themeStyles.gridLines}
                      strokeWidth="2.2"
                    />

                    {/* Legal Destination Highlight */}
                    {isDest && (
                      <g className="animate-pulse">
                        <circle
                          cx={x}
                          cy={y}
                          r={isCaptureDest ? 23 : 18}
                          fill={isCaptureDest ? 'rgba(239, 68, 68, 0.45)' : 'rgba(34, 197, 94, 0.45)'}
                          stroke={isCaptureDest ? '#ef4444' : '#22c55e'}
                          strokeWidth="3.5"
                          strokeDasharray={isCaptureDest ? '5,3' : 'none'}
                          filter="url(#targetPulseGlow)"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="5.5"
                          fill={isCaptureDest ? '#ef4444' : '#22c55e'}
                        />
                      </g>
                    )}

                    {/* Hover indicator when unoccupied */}
                    {isHovered && !occupantId && !isDest && (
                      <circle
                        cx={x}
                        cy={y}
                        r="11"
                        fill="rgba(255, 255, 255, 0.2)"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Ethnomathematics Label */}
                    {showNodeLabels && (
                      <text
                        x={x}
                        y={y - 13}
                        fill={themeStyles.labelColor}
                        fontSize="11"
                        fontWeight="800"
                        textAnchor="middle"
                        className="pointer-events-none drop-shadow font-mono"
                      >
                        {node.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Tactile 3D Pieces (Bidak) */}
            <g filter="url(#piece3dDepth)">
              {Object.values(gameState.pieces).map((piece: Piece) => {
                const { x, y } = getCoordinates(piece.nodeId);
                const isSelected = selectedPieceId === piece.id;
                const isP1 = piece.owner === 'P1';

                return (
                  <g
                    key={`piece-${piece.id}`}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNodeClick(piece.nodeId);
                    }}
                  >
                    {/* Active Selected Glow Ring */}
                    {isSelected && (
                      <circle
                        r="26"
                        fill="none"
                        stroke="#fbbf24"
                        strokeWidth="4"
                        className="animate-pulse"
                      />
                    )}

                    {/* Multi-jump required halo */}
                    {gameState.consecutivePieceId === piece.id && (
                      <circle
                        r="26"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="3.5"
                        strokeDasharray="4,3"
                        className="animate-spin"
                        style={{ animationDuration: '3s' }}
                      />
                    )}

                    {/* Outer Tactile Stone Body */}
                    <circle
                      r={isSelected ? 21.5 : 18.5}
                      fill={isP1 ? 'url(#p1ModernGrad)' : 'url(#p2ModernGrad)'}
                      stroke={isP1 ? themeStyles.p1Rim : themeStyles.p2Rim}
                      strokeWidth={isSelected ? 3 : 2.2}
                    />

                    {/* Inner Rim Light Bevel */}
                    <circle
                      r={isSelected ? 17.5 : 15}
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="1.2"
                      opacity="0.35"
                    />

                    {/* High-Contrast Cultural Motif for Color-Blind Clarity */}
                    {isP1 ? (
                      // P1: Concentric Solar Rings + Core
                      <g stroke={themeStyles.p1Rim} strokeWidth="1.6" fill="none" opacity="0.9">
                        <circle r="9" />
                        <circle r="4" fill={themeStyles.p1Rim} />
                      </g>
                    ) : (
                      // P2: Lapis 4-Point Star Diamond
                      <g stroke={themeStyles.p2Rim} strokeWidth="1.6" fill={themeStyles.p2Rim} opacity="0.95">
                        <polygon points="0,-8 7.5,0 0,8 -7.5,0" fillOpacity="0.4" />
                        <circle r="3" fill={themeStyles.p2Rim} />
                      </g>
                    )}

                    {/* King (Raja) Crown Insignia */}
                    {piece.isKing && (
                      <g transform="translate(0, -1)">
                        <circle r="9" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />
                        <path
                          d="M -4.5,2.5 L -4.5,-2.5 L -1.5,0 L 0,-3.5 L 1.5,0 L 4.5,-2.5 L 4.5,2.5 Z"
                          fill="#78350f"
                        />
                      </g>
                    )}

                    {/* Piece Identification Badge */}
                    <text
                      x="0"
                      y={piece.isKing ? 13 : 3.5}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="800"
                      textAnchor="middle"
                      className="pointer-events-none drop-shadow-sm select-none opacity-90 font-mono"
                    >
                      {piece.isKing ? (lang === 'en' ? 'KING' : 'RAJA') : isP1 ? 'P1' : 'P2'}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};
