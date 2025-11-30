import { useEffect, useRef, useState } from "react";
import jsPDF from "jspdf"; 
import './Drawing.css'

const Drawing = ({theme}) => {
    const canvasRef = useRef(null);
      const ctxRef = useRef(null);
    
      const [color, setColor] = useState("#000000");
      const [size, setSize] = useState(4);
      const [tool, setTool] = useState("brush"); 
      // "brush" | "eraser" | "pen" | "rect" | "circle" | "triangle" | "square" |"text" | "line" | "arrow" 
      const [textBox, setTextBox] = useState(null); // {x, y, value}
    
    
      const [history, setHistory] = useState([]);
      const [historyIndex, setHistoryIndex] = useState(-1);
      const [drawing, setDrawing] = useState(false);
    
      const currentStrokeRef = useRef(null);
      const shapeStartRef = useRef(null);
    
      const [penPoints, setPenPoints] = useState([]);
    
      // Resize canvas for high-DPI
    //   const resizeCanvas = () => {
    //     const canvas = canvasRef.current;
    //     const ctx = ctxRef.current;
    //     const rect = canvas.getBoundingClientRect();
    //     const dpr = window.devicePixelRatio || 1;
    //     canvas.width = Math.round(rect.width * dpr);
    //     canvas.height = Math.round(rect.height * dpr);
    //     ctx.scale(dpr, dpr);
    //     redraw();
    //   };
    const resizeCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // const rect = canvas.parentElement.getBoundingClientRect();
        // const width = rect.width;  // full container width
        const width =1270;
        const height = 500;        // locked height

        const scale = window.devicePixelRatio || 1;

        canvas.width = width * scale;
        canvas.height = height * scale;

        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;

        const ctx = canvas.getContext("2d");
        ctx.scale(scale, scale);

        ctxRef.current = ctx;

        redraw(); // make sure drawings persist after resize
        };

    
      const pushHistory = (stroke) => {
        setHistory((prev) => {
          const newHistory = [...prev.slice(0, historyIndex + 1), stroke];
          setHistoryIndex(newHistory.length - 1);
          return newHistory;
        });
      };
    
      const redraw = () => {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        const rect = canvas.getBoundingClientRect();
    
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, rect.width, rect.height);
        ctx.restore();
    
        for (let i = 0; i <= historyIndex; i++) {
          const s = history[i];
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.strokeStyle = s.eraser ? "#ffffff" : s.color;
          ctx.lineWidth = s.size;
    
          
          if (s.shape === "text") {
                ctx.font = `${s.size * 4}px Arial`;  // scale font size with your brush size
                ctx.fillStyle = s.color || "#000000";
                ctx.fillText(s.value, s.x, s.y);
            // ctx.font = "20px Arial";
            // ctx.fillStyle = "black";
            // ctx.fillText(s.value, s.x, s.y);
            }
            else if (s.shape === "line" || s.shape === "arrow") {
                const [p1, p2] = s.points;
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
    
                if (s.shape === "arrow") {
                    drawArrowhead(ctx, p1, p2, s.size);
                }
                }
    
    
    
          else if (s.shape === "rect") {
            const [p1, , p3] = s.points;
            ctx.strokeRect(p1.x, p1.y, p3.x - p1.x, p3.y - p1.y);
          }
          else if (s.shape === "square") {
            const [p1, , p3] = s.points;
            const side = Math.min(Math.abs(p3.x - p1.x), Math.abs(p3.y - p1.y));
            const width = p3.x > p1.x ? side : -side;
            const height = p3.y > p1.y ? side : -side;
            ctx.strokeRect(p1.x, p1.y, width, height);
          }
          else if (s.shape === "circle") {
            const [p1, p2] = s.points;
            const radius = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)) / 2;
            const centerX = (p1.x + p2.x) / 2;
            const centerY = (p1.y + p2.y) / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
          } else if (s.shape === "triangle") {
            ctx.beginPath();
            ctx.moveTo(s.points[0].x, s.points[0].y);
            ctx.lineTo(s.points[1].x, s.points[1].y);
            ctx.lineTo(s.points[2].x, s.points[2].y);
            ctx.closePath();
            ctx.stroke();
          } else {
            // freehand stroke
            ctx.beginPath();
            const pts = s.points;
            if (!pts || pts.length === 0) continue;
            ctx.moveTo(pts[0].x, pts[0].y);
            for (let j = 1; j < pts.length; j++) {
              const midx = (pts[j - 1].x + pts[j].x) / 2;
              const midy = (pts[j - 1].y + pts[j].y) / 2;
              ctx.quadraticCurveTo(pts[j - 1].x, pts[j - 1].y, midx, midy);
            }
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.stroke();
          }
        }
      };
    
      const getPos = (e) => {
        const rect = canvasRef.current.getBoundingClientRect();
        if (e.touches && e.touches.length) {
          return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
      };
    
      const startStroke = (e) => {
        e.preventDefault();
        const p = getPos(e);
    
        if (tool === "brush" || tool === "eraser") {
          setDrawing(true);
          currentStrokeRef.current = { points: [p], color, size, eraser: tool === "eraser" };
          drawPoint(p.x, p.y, true);
        } else if (tool === "rect" || tool === "circle" || tool === "triangle" || tool === "square"|| tool === "line" || tool === "arrow" ) {
          shapeStartRef.current = p;
        }
        if (tool === "text") {
                setTextBox({ x: p.x, y: p.y, value: "" }); // show input box
        }
    
        setDrawing(true);
        // setStart(getPos(e));
        
      };
    
      const drawPoint = (x, y, init = false) => {
        const ctx = ctxRef.current;
        ctx.lineJoin = "round";
        ctx.lineCap = "round";
        ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
        ctx.lineWidth = size;
        if (init) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y);
          ctx.stroke();
          return;
        }
        ctx.lineTo(x, y);
        ctx.stroke();
      };
    
      const moveStroke = (e) => {
        if ((tool === "brush" || tool === "eraser") && drawing) {
          const p = getPos(e);
          currentStrokeRef.current.points.push(p);
          const pts = currentStrokeRef.current.points;
          const l = pts.length;
          if (l < 2) return;
    
          const ctx = ctxRef.current;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.strokeStyle = currentStrokeRef.current.eraser ? "#ffffff" : currentStrokeRef.current.color;
          ctx.lineWidth = currentStrokeRef.current.size;
          ctx.beginPath();
          ctx.moveTo(pts[l - 2].x, pts[l - 2].y);
          const midx = (pts[l - 2].x + pts[l - 1].x) / 2;
          const midy = (pts[l - 2].y + pts[l - 1].y) / 2;
          ctx.quadraticCurveTo(pts[l - 2].x, pts[l - 2].y, midx, midy);
          ctx.stroke();
        } 
        else if (tool === "rect" || tool === "circle" || tool === "triangle" || tool === "square") {
          if (!shapeStartRef.current) return;
          const ctx = ctxRef.current;
          redraw(); 
          const start = shapeStartRef.current;
          const end = getPos(e);
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
    
          if (tool === "rect") {
            ctx.strokeRect(start.x, start.y, end.x - start.x, end.y - start.y);
          }
          else if (tool === "square") {
            const side = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
            const width = end.x > start.x ? side : -side;
            const height = end.y > start.y ? side : -side;
            ctx.strokeRect(start.x, start.y, width, height);
          }
          else if (tool === "circle") {
            const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)) / 2;
            const centerX = (start.x + end.x) / 2;
            const centerY = (start.y + end.y) / 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            ctx.stroke();
          } else if (tool === "triangle") {
            ctx.beginPath();
            ctx.moveTo((start.x + end.x) / 2, start.y);
            ctx.lineTo(start.x, end.y);
            ctx.lineTo(end.x, end.y);
            ctx.closePath();
            ctx.stroke();
          }
        }
        else if (tool === "line" || tool === "arrow") {
            if (!shapeStartRef.current) return;
            const ctx = ctxRef.current;
            redraw(); 
            const start = shapeStartRef.current;
            const end = getPos(e);
    
            ctx.strokeStyle = color;
            ctx.lineWidth = size;
    
            // Draw the line
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
    
            // If arrow, draw arrowhead
            if (tool === "arrow") {
                drawArrowhead(ctx, start, end, size);
            }
            }
    
      };
    
      const endStroke = (e) => {
        if (tool === "brush" || tool === "eraser") {
          if (!drawing) return;
          setDrawing(false);
          pushHistory(currentStrokeRef.current);
          currentStrokeRef.current = null;
        } else if (tool === "rect" || tool === "circle" || tool === "triangle" || tool === "square") {
          if (!shapeStartRef.current) return;
          const start = shapeStartRef.current;
          const end = getPos(e);
          let points = [];
    
          if (tool === "rect" ) {
            points = [start, { x: end.x, y: start.y }, end, { x: start.x, y: end.y }];
          }
          else if (tool === "square") {
            const side = Math.min(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
            const width = end.x > start.x ? side : -side;
            const height = end.y > start.y ? side : -side;
            points = [
              start,
              { x: start.x + width, y: start.y },
              { x: start.x + width, y: start.y + height },
              { x: start.x, y: start.y + height }
            ];
          }
          else if (tool === "circle") {
            points = [start, end];
          } else if (tool === "triangle") {
            points = [
              { x: (start.x + end.x) / 2, y: start.y },
              { x: start.x, y: end.y },
              { x: end.x, y: end.y },
            ];
          }
    
          pushHistory({ points, color, size, eraser: false, shape: tool });
          shapeStartRef.current = null;
        }
        else if (tool === "line" || tool === "arrow") {
            if (!shapeStartRef.current) return;
            const start = shapeStartRef.current;
            const end = getPos(e);
    
            pushHistory({
                shape: tool,
                points: [start, end],
                color,
                size,
                eraser: false
            });
    
            shapeStartRef.current = null;
            }
    
      };
    
      const clearCanvas = () => {
        setHistory([]);
        setHistoryIndex(-1);
        redraw();
      };
    
      const undo = () => {
        if (historyIndex >= 0) setHistoryIndex(historyIndex - 1);
      };
    
      const redo = () => {
        if (historyIndex < history.length - 1) setHistoryIndex(historyIndex + 1);
      };
    
     
      useEffect(() => {
        const canvas = canvasRef.current;
        ctxRef.current = canvas.getContext("2d");
    
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
    
        const start = (e) => startStroke(e);
        const move = (e) => moveStroke(e);
        const end = (e) => endStroke(e);
    
        canvas.addEventListener("mousedown", start);
        window.addEventListener("mousemove", move);
        window.addEventListener("mouseup", end);
    
        canvas.addEventListener("touchstart", start, { passive: false });
        window.addEventListener("touchmove", move, { passive: false });
        window.addEventListener("touchend", end);
    
        return () => {
          window.removeEventListener("resize", resizeCanvas);
          canvas.removeEventListener("mousedown", start);
          window.removeEventListener("mousemove", move);
          window.removeEventListener("mouseup", end);
          canvas.removeEventListener("touchstart", start);
          window.removeEventListener("touchmove", move);
          window.removeEventListener("touchend", end);
        };
      }, [drawing, color, size, tool, historyIndex]);
    
      useEffect(() => {
        redraw();
      }, [historyIndex, history]);
    
      // Pen tool: handle clicks and double-clicks
      useEffect(() => {
        const canvas = canvasRef.current;
    
        const handleClick = (e) => {
          if (tool !== "pen") return;
          const pos = getPos(e);
          setPenPoints((prev) => [...prev, pos]);
        };
    
        const handleDoubleClick = () => {
          if (tool !== "pen" || penPoints.length < 2) return;
          pushHistory({ points: penPoints, color, size, eraser: false });
          setPenPoints([]);
        };
    
        if (tool === "pen") {
          canvas.addEventListener("click", handleClick);
          canvas.addEventListener("dblclick", handleDoubleClick);
        }
    
        return () => {
          canvas.removeEventListener("click", handleClick);
          canvas.removeEventListener("dblclick", handleDoubleClick);
        };
      }, [tool, penPoints, color, size]);
    
      useEffect(() => {
        if (tool !== "pen") return;
        const ctx = ctxRef.current;
        redraw();
        if (penPoints.length > 0) {
          ctx.strokeStyle = color;
          ctx.lineWidth = size;
          ctx.beginPath();
          ctx.moveTo(penPoints[0].x, penPoints[0].y);
          for (let i = 1; i < penPoints.length; i++) {
            ctx.lineTo(penPoints[i].x, penPoints[i].y);
          }
          ctx.stroke();
        }
      }, [penPoints, tool, color, size]);
    
      
      const increase = () => {
        if (size < 100) setSize(size + 1);
      };
    
      const decrease = () => {
        if (size > 0) setSize(size - 1);
      };
      const drawArrowhead = (ctx, from, to, size) => {
        const headlen = 10 + size; // arrow head size
        const angle = Math.atan2(to.y - from.y, to.x - from.x);
    
        ctx.beginPath();
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.moveTo(to.x, to.y);
        ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.stroke();
        };
    
    
        //save image
        const [format, setFormat] = useState("png");
    
      const saveImage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        if (format === "png" || format === "jpeg" || format === "webp") {
          const scale = 4; 
          const offCanvas = document.createElement("canvas");
          offCanvas.width = canvas.width * scale;
          offCanvas.height = canvas.height * scale;
    
          const ctx = offCanvas.getContext("2d");
    
          // Fill background white (or any color you want)
          ctx.fillStyle = "#ffffff";  
          ctx.fillRect(0, 0, offCanvas.width, offCanvas.height);
    
          // Scale and draw original canvas
          ctx.scale(scale, scale);
          ctx.drawImage(canvas, 0, 0);
    
          const dataUrl = offCanvas.toDataURL(`image/${format}`);
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = `drawing.${format}`;
          a.click();
        }
    
    
        if (format === "pdf") {
          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("landscape", "pt", [canvas.width, canvas.height]);
          pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
          pdf.save("drawing.pdf");
        }
    
        if (format === "svg") {
          const dataUrl = canvas.toDataURL("image/png");
          const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
              <image href="${dataUrl}" width="${canvas.width}" height="${canvas.height}" />
            </svg>
          `;
          const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
          const a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "drawing.svg";
          a.click();
        }
      };
    
  return (
    <>
      <div className= {`left-sidebar ${theme}`}>
        
        <button className={`tool-icon brush ${tool === "brush" ? "active" : ""}`} title="Pen" onClick={() => setTool("brush")}></button>
        <button className={`tool-icon eraser ${tool === "eraser" ? "active" : ""}`}  title="Eraser" onClick={() => setTool("eraser")}></button>
        <button className={`tool-icon signature ${tool === "pen" ? "active" : ""}`}  title="Curve:Double click to end" onClick={() => setTool("pen")}></button>
        <button className={`tool-icon square ${tool === "square" ? "active" : ""}`}  title="Square" onClick={() => setTool("square")}></button>
        <button className={`tool-icon rectangle ${tool === "rect" ? "active" : ""}`}  title="Rectangle" onClick={() => setTool("rect")}></button>
        <button className={`tool-icon circle ${tool === "circle" ? "active" : ""}`}  title="Circle" onClick={() => setTool("circle")}></button>
        <button className={`tool-icon triangle ${tool === "triangle" ? "active" : ""}`}  title="Triangle" onClick={() => setTool("triangle")}></button>
        <button className={`tool-icon line ${tool === "line" ? "active" : ""}`}  title="Line" onClick={() => setTool("line")}></button>
        <button className={`tool-icon arrow ${tool === "arrow" ? "active" : ""}`}  title="Arrow" onClick={() => setTool("arrow")}></button>
        <button className={`tool-icon text ${tool === "text" ? "active" : ""}`}  title="Text" onClick={() => setTool("text")}></button>

      </div>
      <div className="canvas-container">
        <div className="canvas-toolbar">
            <div className="canvas-grid">
            <div className="">
                <button type="button" className="minus-btn" onClick={decrease} disabled={size <= 0} title="Decrease size">- </button>
                <input type="text" className="quantity-input" value={size} min="0" max="100" title="Size"
                    onChange={(e) => {
                        let value = Number(e.target.value);
                        if (value < 0) value = 0;
                        if (value > 100) value = 100;
                        setSize(value);
                        }}/>

                <button type="button" className="plus-btn" onClick={increase} disabled={size >= 100} title="Increase size">+</button>
            </div>
            <div className=""> <input type="color" className="color-button" title="Color pick" value={color} onChange={(e) => setColor(e.target.value)} /></div>
            <button className="tool-icon undoImg" title="Undo" onClick={undo}></button>
            <button className="tool-icon redoImg" title="Redo" onClick={redo}></button>
            <button className="tool-icon refresh" title="Refresh" onClick={clearCanvas}></button>
            <button className="ai-cleanup-btn">AI Cleanup</button>
            </div>
            <div className="canvas-right">
                <div className="format-options">
                {["png", "jpeg", "pdf", "svg"].map((fmt) => (
                    <button
                    key={fmt}
                    className={`format-btn ${format === fmt ? "active" : ""}`}
                    onClick={() => setFormat(fmt)}
                    type="button"
                    >
                    {fmt.toUpperCase()}
                    </button>
                ))}
                <button onClick={saveImage} className="ai-cleanup-btn" type="button">
                    Download
                </button>
                </div>

            </div>
        </div>
        
        <canvas ref={canvasRef}
            id="canvas"
            style={{
                // width: "1250px",   
                width: "100%",   
                height: "800px", 
                border: "1px solid black"
            }}                
                className={`canvas-box ${
                    tool === "brush" ? "cursor-brush" :
                    tool === "eraser" ? "cursor-eraser" :
                    tool === "pen" ? "cursor-pen" :
                    tool === "rect" ? "cursor-rect" :
                    tool === "square" ? "cursor-square" :
                    tool === "circle" ? "cursor-circle" :
                    tool === "triangle" ? "cursor-triangle" : ""
                }`}
              />

              {textBox && (
                <input
                    type="text"
                    value={textBox.value}
                    autoFocus
                    onChange={(e) => setTextBox({ ...textBox, value: e.target.value })}
                    onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        if (textBox.value.trim() !== "") {
                        pushHistory({
                            shape: "text",
                            x: textBox.x,
                            y: textBox.y,
                            value: textBox.value,
                            color: color,  // use current selected color
                            size: size     // optional: font size
                        });
                        }
                        setTextBox(null); // remove input after enter
                    }
                    }}
                    style={{
                        position: "absolute",
                        top: textBox.y + canvasRef.current.getBoundingClientRect().top,
                        left: textBox.x + canvasRef.current.getBoundingClientRect().left,
                        maxWidth: canvasRef.current.getBoundingClientRect().width - textBox.x, // prevent overflow
                        border: "1px solid black",
                        font: `${size * 4}px Arial`,
                        color: color,
                        background: "transparent",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        pointerEvents: "auto"
                    }}
                />
                )}

      </div>
      {/* <div className="right-sidebar">
                <div 
                style={{ width: "100px", margin: "0 auto", border: "1px solid gray" }}
                >
                    rightside 
                </div>
      </div> */}
    </>
  )
}

export default Drawing
