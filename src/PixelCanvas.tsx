import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useRef, useEffect, useState, useCallback } from "react";

const CANVAS_SIZE = 1000;
const INITIAL_ZOOM = 0.5;
const MIN_ZOOM = 0.1;
const MAX_ZOOM = 20;

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF",
  "#800000", "#008000", "#000080", "#808000", "#800080", "#008080", "#C0C0C0", "#808080",
  "#FFA500", "#FFC0CB", "#A52A2A", "#DDA0DD", "#98FB98", "#F0E68C", "#DEB887", "#5F9EA0",
];

export function PixelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(INITIAL_ZOOM);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [isDragging, setIsDragging] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  const setPixel = useMutation(api.pixels.setPixel);

  // Calculate visible region
  const visibleStartX = Math.max(0, Math.floor(-panX / zoom));
  const visibleStartY = Math.max(0, Math.floor(-panY / zoom));
  const visibleEndX = Math.min(CANVAS_SIZE - 1, Math.ceil((800 - panX) / zoom));
  const visibleEndY = Math.min(CANVAS_SIZE - 1, Math.ceil((600 - panY) / zoom));

  const pixels = useQuery(api.pixels.getPixelsInRegion, {
    startX: visibleStartX,
    startY: visibleStartY,
    endX: visibleEndX,
    endY: visibleEndY,
  });

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pixels) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#f8f9fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(panX, panY);
    ctx.scale(zoom, zoom);

    // Draw grid if zoomed in enough
    if (zoom > 2) {
      ctx.strokeStyle = "#e9ecef";
      ctx.lineWidth = 0.1;
      for (let x = visibleStartX; x <= visibleEndX; x++) {
        ctx.beginPath();
        ctx.moveTo(x, visibleStartY);
        ctx.lineTo(x, visibleEndY + 1);
        ctx.stroke();
      }
      for (let y = visibleStartY; y <= visibleEndY; y++) {
        ctx.beginPath();
        ctx.moveTo(visibleStartX, y);
        ctx.lineTo(visibleEndX + 1, y);
        ctx.stroke();
      }
    }

    // Draw pixels
    pixels.forEach((pixel) => {
      ctx.fillStyle = pixel.color;
      ctx.fillRect(pixel.x, pixel.y, 1, 1);
    });

    // Restore context
    ctx.restore();
  }, [pixels, zoom, panX, panY, visibleStartX, visibleStartY, visibleEndX, visibleEndY]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert screen coordinates to world coordinates
    const worldX = Math.floor((x - panX) / zoom);
    const worldY = Math.floor((y - panY) / zoom);

    if (worldX >= 0 && worldX < CANVAS_SIZE && worldY >= 0 && worldY < CANVAS_SIZE) {
      setPixel({ x: worldX, y: worldY, color: selectedColor });
    }
  }, [isDragging, panX, panY, zoom, selectedColor, setPixel]);

  const handleMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setLastPanPoint({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const deltaX = event.clientX - lastPanPoint.x;
    const deltaY = event.clientY - lastPanPoint.y;

    setPanX(prev => prev + deltaX);
    setPanY(prev => prev + deltaY);
    setLastPanPoint({ x: event.clientX, y: event.clientY });
  }, [isDragging, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom * zoomFactor));

    // Zoom towards mouse position
    const zoomRatio = newZoom / zoom;
    setPanX(prev => mouseX - (mouseX - prev) * zoomRatio);
    setPanY(prev => mouseY - (mouseY - prev) * zoomRatio);
    setZoom(newZoom);
  }, [zoom]);

  return (
    <div className="flex h-full">
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="border cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        />
        
        {/* Controls */}
        <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg">
          <div className="text-sm text-gray-600 mb-2">
            Zoom: {(zoom * 100).toFixed(0)}%
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setZoom(prev => Math.max(MIN_ZOOM, prev * 0.8))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              -
            </button>
            <button
              onClick={() => setZoom(INITIAL_ZOOM)}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              Reset
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(MAX_ZOOM, prev * 1.25))}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Color Palette */}
      <div className="w-64 bg-white border-l p-4">
        <h3 className="text-lg font-semibold mb-4">Color Palette</h3>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-12 h-12 rounded border-2 ${
                selectedColor === color ? "border-gray-800" : "border-gray-300"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Custom Color:</label>
          <input
            type="color"
            value={selectedColor}
            onChange={(e) => setSelectedColor(e.target.value)}
            className="w-full h-10 rounded border"
          />
        </div>

        <div className="text-sm text-gray-600">
          <p className="mb-2">Selected: {selectedColor}</p>
          <p className="mb-2">• Click to paint pixels</p>
          <p className="mb-2">• Drag to pan</p>
          <p>• Scroll to zoom</p>
        </div>
      </div>
    </div>
  );
}
