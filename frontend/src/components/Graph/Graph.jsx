import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { debounce } from "lodash";

const getX = (item) => item.x;
const getY = (item) => item.y;
const getDate = (item) => new Date(item.end_date);
const getId = (item) => `${item.id}-${item.title_project.replace(/\s+/g, "")}`;
const MAX_COORD = 5;
const MIN_COORD = 0;

export function EmbedGraph({ setCurrDatum, handleOpen }) {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const [localData, setLocalData] = useState([]);
    const [hovered, setHovered] = useState(null);
    const canvasRef = useRef(null);
    const fetchedRegionsRef = useRef(new Set());
    const abortControllerRef = useRef(null);

    const width = windowSize.width * 0.55;
    const height = windowSize.height * 0.6;

    const initialView = {
        x: [2.0, 3.0],
        y: [2.0, 3.0],
    };

    const xScale = useMemo(
        () => d3.scaleLinear().domain([MIN_COORD, MAX_COORD]).range([0, width]),
        [width]
    );

    const yScale = useMemo(
        () =>
            d3.scaleLinear().domain([MIN_COORD, MAX_COORD]).range([height, 0]),
        [height]
    );

    const colorScale = useMemo(() => {
        const [min, max] = d3.extent(localData.map((d) => getDate(d)));
        return d3.scaleSequential(d3.interpolateInferno).domain([min, max]);
    }, [localData]);

    const fetchData = useMemo(
        () =>
            debounce(async (x0, x1, y0, y1, signal) => {
                try {
                    const regionKey = `${x0}-${x1}-${y0}-${y1}`;
                    if (fetchedRegionsRef.current.has(regionKey)) return;

                    const url = `http://127.0.0.1:8080/get_points/?min_x=${x0}&max_x=${x1}&min_y=${y0}&max_y=${y1}`;
                    const response = await fetch(url, { signal });
                    const newData = await response.json();

                    setLocalData((prev) => {
                        const existingIds = new Set(prev.map(getId));
                        return [
                            ...prev,
                            ...newData.filter(
                                (d) => !existingIds.has(getId(d))
                            ),
                        ];
                    });

                    fetchedRegionsRef.current.add(regionKey);
                } catch (error) {
                    if (error.name !== "AbortError")
                        console.error("Fetch error:", error);
                }
            }, 100),
        []
    );

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const zoom = d3
            .zoom()
            .scaleExtent([1, 20])
            .on("zoom", (event) => setTransform(event.transform));

        const initialScale = 5;

        const initialX = -xScale(initialView.x[0]) * initialScale;
        const initialY = -yScale(initialView.y[1]) * initialScale;

        const initialTransform = d3.zoomIdentity
            .translate(initialX, initialY)
            .scale(initialScale);

        d3.select(canvas).call(zoom).call(zoom.transform, initialTransform);

        fetchData(
            initialView.x[0],
            initialView.x[1],
            initialView.y[0],
            initialView.y[1],
            new AbortController().signal
        );

        return () => {
            d3.select(canvas).on(".zoom", null);
            abortControllerRef.current?.abort();
        };
    }, [width, height]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.save();

        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        const visibleX0 = xScale.invert(-transform.x / transform.k);
        const visibleX1 = xScale.invert((width - transform.x) / transform.k);
        const visibleY0 = yScale.invert((height - transform.y) / transform.k);
        const visibleY1 = yScale.invert(-transform.y / transform.k);

        const x0 = Math.max(MIN_COORD, Math.min(visibleX0, visibleX1) - 0.1);
        const x1 = Math.min(MAX_COORD, Math.max(visibleX0, visibleX1) + 0.1);
        const y0 = Math.max(MIN_COORD, Math.min(visibleY0, visibleY1) - 0.1);
        const y1 = Math.min(MAX_COORD, Math.max(visibleY0, visibleY1) + 0.1);

        if (x1 > x0 && y1 > y0) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            fetchData(x0, x1, y0, y1, abortController.signal);
        }

        localData.forEach((d) => {
            if (d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1) {
                ctx.beginPath();
                ctx.arc(xScale(d.x), yScale(d.y), 2, 0, 2 * Math.PI);
                ctx.fillStyle = colorScale(new Date(d.end_date));
                ctx.globalAlpha = 0.4;
                ctx.fill();
            }
        });

        if (hovered) {
            ctx.beginPath();
            ctx.arc(
                xScale(hovered.obj.x),
                yScale(hovered.obj.y),
                5,
                0,
                2 * Math.PI
            );
            ctx.fillStyle = "yellow";
            ctx.globalAlpha = 1;
            ctx.fill();
        }

        ctx.restore();
    }, [
        transform,
        localData,
        hovered,
        colorScale,
        xScale,
        yScale,
        width,
        height,
    ]);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
            setTransform(d3.zoomIdentity);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleMouseMove = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - transform.x) / transform.k;
        const mouseY = (e.clientY - rect.top - transform.y) / transform.k;

        let closest = null;
        let minDistance = Infinity;

        localData.forEach((d) => {
            const x = xScale(getX(d));
            const y = yScale(getY(d));
            const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

            if (distance < 5 / transform.k && distance < minDistance) {
                minDistance = distance;
                closest = {
                    xPos: e.clientX,
                    yPos: e.clientY,
                    name: d.title_project,
                    obj: d,
                };
            }
        });

        setHovered(closest);
    };

    const handleClick = () => {
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
