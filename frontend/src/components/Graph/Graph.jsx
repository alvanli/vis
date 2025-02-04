import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const getX = (item) => item.umap_2d[0];
const getY = (item) => item.umap_2d[1];

export function EmbedGraph({
    data,
    titleKey,
    setCurrDatum,
    handleOpen,
    hovered,
    setHovered,
}) {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const canvasRef = useRef(null);

    const width = windowSize.width * 0.55;
    const height = windowSize.height * 0.6;
    const boundsWidth = width;
    const boundsHeight = height;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const zoom = d3
            .zoom()
            .scaleExtent([0.5, 8])
            .on("zoom", (event) => {
                setTransform(event.transform);
            });

        d3.select(canvas).call(zoom);

        return () => {
            d3.select(canvas).on(".zoom", null);
        };
    }, []);

    const xScale = useMemo(() => {
        const [min, max] = d3.extent(data.map(getX));
        return d3
            .scaleLinear()
            .domain([min, max])
            .range([0, boundsWidth])
            .nice();
    }, [data, boundsWidth]);

    const yScale = useMemo(() => {
        const [min, max] = d3.extent(data.map(getY));
        return d3
            .scaleLinear()
            .domain([min, max])
            .range([boundsHeight, 0])
            .nice();
    }, [data, boundsHeight]);

    const colorScale = useMemo(() => {
        const [min, max] = d3.extent(data.map((d) => d.dt));
        return d3
            .scaleSequential()
            .interpolator(d3.interpolateInferno)
            .domain([min, max]);
    }, [data]);

    const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);

        ctx.save();

        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        data.forEach((d) => {
            ctx.beginPath();
            ctx.arc(xScale(getX(d)), yScale(getY(d)), 2, 0, 2 * Math.PI);
            ctx.fillStyle = colorScale(d.dt);
            ctx.globalAlpha = 0.4;
            ctx.fill();
        });

        if (hovered) {
          const hoveredPoint = hovered.obj;
          ctx.beginPath();
          ctx.arc(xScale(getX(hoveredPoint)), yScale(getY(hoveredPoint)), 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'yellow';
          ctx.globalAlpha = 1;
          ctx.fill();
        }

        ctx.restore();
    };

    useEffect(() => {
        draw();
    }, [data, xScale, yScale, colorScale, width, height, transform, hovered]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            setTransform(d3.zoomIdentity); // Reset transform on resize
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // Adjusted mouse move handler with transform inversion
    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseXCanvas = e.clientX - rect.left;
        const mouseYCanvas = e.clientY - rect.top;

        // Invert transform to get original positions
        const invertedX = (mouseXCanvas - transform.x) / transform.k;
        const invertedY = (mouseYCanvas - transform.y) / transform.k;

        let closest = null;
        let minDistance = Infinity;

        data.forEach((d) => {
            const x = xScale(getX(d));
            const y = yScale(getY(d));
            const distance = Math.sqrt(
                (x - invertedX) ** 2 + (y - invertedY) ** 2
            );

            if (distance < 5 / transform.k && distance < minDistance) {
                minDistance = distance;
                closest = {
                    xPos: e.clientX,
                    yPos: e.clientY,
                    name: d[titleKey].split("\n")[0],
                    obj: d,
                };
            }
        });

        setHovered(closest);
    };

    // Click handler remains the same
    const handleClick = (e) => {
        if (!hovered) return;
        setCurrDatum(hovered.obj);
        handleOpen();
    };

    return (
        <div style={{ position: "relative" }}>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovered(null)}
                onClick={handleClick}
                style={{ cursor: "pointer" }}
            />
        </div>
    );
}
