import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { polygonHull } from "d3-polygon";
import { debounce } from "lodash";

const getX = (item) => item.x;
const getY = (item) => item.y;
const getDate = (item) => new Date(item.end_date);
const getId = (item) =>
    `${item.id}-${item.title_project.replace(/\s+/g, "")}-${item.project_link}`;
const AxisTypes = {
    DATE: { label: "By Date" },
    TEXT_LEN: { label: "By Text Length" },
    NONE: { label: "Not Selected" },
};
const MAX_COORD = 20;
const MIN_COORD = -10;
const BALL_SIZE = 0.2;
const SIZE_BUFFER = 0.01;

function EmbedGraph({
    setCurrDatum,
    handleOpen,
    filters,
    selected,
    setSelected,
    hovered,
    setHovered,
    sizeAxis,
    colorAxis,
    sizeMultiplier
}) {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const [transform, setTransform] = useState(d3.zoomIdentity);
    const [localData, setLocalData] = useState([]);
    const [filteredGridData, setFilteredGridData] = useState([]);
    const canvasRef = useRef(null);
    const fetchedRegionsRef = useRef(new Set());
    const abortControllerRef = useRef(null);
    const [mouseClientPos, setMouseClientPos] = useState({
        clientX: null,
        clientY: null,
    });
    const [clusters, setClusters] = useState([]);

    const width = windowSize.width * 0.55;
    const height = windowSize.height * 0.6;

    const initialView = {
        x: [1.5, 2.0],
        y: [2.5, 3.0],
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

    const getColorScaleAttr = (d) => {
        if (colorAxis === AxisTypes.DATE.label) {
            return getDate(d);
        } else if (colorAxis === AxisTypes.TEXT_LEN.label) {
            return Math.min(d.full_desc.length, 15000);
        } else {
            return 1;
        }
    }

    const getSizeScaleAttr = (d) => {
        if (sizeAxis === AxisTypes.DATE.label) {
            return getDate(d);
        } else if (sizeAxis === AxisTypes.TEXT_LEN.label) {
            return Math.min(d.full_desc.length, 15000);
        } else {
            return 1;
        }
    }

    const colorScale = useMemo(() => {
        const [min, max] = d3.extent(
            localData.map((d) => getColorScaleAttr(d))
        );
        return d3.scaleSequential(d3.interpolateInferno).domain([min, max]);
    }, [localData, colorAxis]);

    const sizeScale = useMemo(() => {
        const [min, max] = d3.extent(
            localData.map((d) => getSizeScaleAttr(d)) // Replace with your size attribute accessor
        );
        
        return d3.scalePow()
            .domain([min, max])
            .range([0.05, 0.5]);
        
        // return d3.scaleSqrt()
        //     .domain([min, max])
        //     .range([5, 30]);
    }, [localData, sizeAxis]);

    const fetchPoints = useMemo(
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
            }, 200),
        []
    );

    const fetchClusters = async () => {
        try {
            const url = `http://127.0.0.1:8080/get_clusters`;
            const response = await fetch(url);
            const newData = await response.json();
            setClusters(newData);
        } catch (error) {
            if (error.name !== "AbortError")
                console.error("Fetch error:", error);
        }
    };

    // useEffect(() => {
    //     fetchClusters();
    // }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const zoom = d3
            .zoom()
            .scaleExtent([5, 60])
            .on("zoom", (event) => setTransform(event.transform));

        const initialScale = 40;

        const initialX = -xScale(initialView.x[0]) * initialScale;
        const initialY = -yScale(initialView.y[1]) * initialScale;

        const initialTransform = d3.zoomIdentity
            .translate(initialX, initialY)
            .scale(initialScale);

        d3.select(canvas).call(zoom).call(zoom.transform, initialTransform);

        fetchPoints(
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

    // point filtering
    useEffect(() => {
        const visibleX0 = xScale.invert(-transform.x / transform.k);
        const visibleX1 = xScale.invert((width - transform.x) / transform.k);
        const visibleY0 = yScale.invert((height - transform.y) / transform.k);
        const visibleY1 = yScale.invert(-transform.y / transform.k);

        const x0 = Math.max(
            MIN_COORD,
            Math.min(visibleX0, visibleX1) - SIZE_BUFFER
        );
        const x1 = Math.min(
            MAX_COORD,
            Math.max(visibleX0, visibleX1) + SIZE_BUFFER
        );
        const y0 = Math.max(
            MIN_COORD,
            Math.min(visibleY0, visibleY1) - SIZE_BUFFER
        );
        const y1 = Math.min(
            MAX_COORD,
            Math.max(visibleY0, visibleY1) + SIZE_BUFFER
        );

        if (x1 > x0 && y1 > y0) {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            fetchPoints(x0, x1, y0, y1, abortController.signal);
        }

        const filteredData = localData.filter((d) => {
            if (filters.prize_only && d.prize.length <= 2) return false;
            if (d.x >= x0 && d.x <= x1 && d.y >= y0 && d.y <= y1) return true;
            return false;
        });
        setFilteredGridData(filteredData);
    }, [localData, transform, filters]);

    // draw fn
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.save();

        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);
        let mouseX = null,
            mouseY = null;
        if (mouseClientPos.clientX !== null) {
            const rect = canvas.getBoundingClientRect();
            mouseX =
                (mouseClientPos.clientX - rect.left - transform.x) /
                transform.k;
            mouseY =
                (mouseClientPos.clientY - rect.top - transform.y) / transform.k;
        }
        // console.log(transform.k);
        if (transform.k < 19) {
            // render cluster points
        }
        if (transform.k > 25) {
            // render points
            filteredGridData.forEach((d) => {
                let xPos = xScale(d.x);
                let yPos = yScale(d.y);

                if (mouseX !== null && mouseY !== null) {
                    const dx = mouseX - xPos;
                    const dy = mouseY - yPos;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const screenRadius = 200;
                    const dataRadius = screenRadius / transform.k;

                    if (distance < dataRadius) {
                        const force =
                            Math.pow(1 - distance / dataRadius, 2) * 0.3;
                        xPos += dx * force;
                        yPos += dy * force;
                    }
                }
                let currAlpha = 0.4;
                let currBallSize = sizeScale(getSizeScaleAttr(d)); // BALL_SIZE;
                // if (!filters.prize_only) {
                //     currBallSize *= 0.5;
                // }
                currBallSize = currBallSize * (1 + (sizeMultiplier-50) / 100);
                let currColor = colorScale(getColorScaleAttr(d));
                if (selected.some((curr) => getId(curr) === getId(d))) {
                    currBallSize *= 2;
                    currAlpha = 0.8;
                }
                if (hovered && getId(d) === getId(hovered.obj)) {
                    currBallSize *= 1.5;
                    currColor = "yellow";
                    currAlpha = 1.0;
                }
                ctx.beginPath();
                ctx.arc(xPos, yPos, currBallSize, 0, 2 * Math.PI);
                ctx.fillStyle = currColor;
                ctx.globalAlpha = currAlpha;
                ctx.fill();
            });
        }

        ctx.restore();
    }, [
        filteredGridData,
        hovered,
        colorScale,
        xScale,
        yScale,
        width,
        height,
        mouseClientPos,
        selected,
        colorAxis,
        sizeAxis,
        sizeMultiplier
    ]);

    useEffect(() => {
        const groupedPoints = new Map();

        filteredGridData.forEach((point) => {
            const label = point.label;
            if (!groupedPoints.has(label)) {
                groupedPoints.set(label, []);
            }
            groupedPoints.get(label).push(point);
        });
    }, [filteredGridData, clusters]);

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

        setMouseClientPos({
            clientX: e.clientX,
            clientY: e.clientY,
        });

        localData.forEach((d) => {
            if (filters.prize_only && d.prize.length <= 2) return;

            const x = xScale(getX(d));
            const y = yScale(getY(d));
            const distance = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

            if (distance < 30 / transform.k && distance < minDistance) {
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
        const curr_obj = hovered.obj;
        setCurrDatum(curr_obj);
        setSelected((prev) => {
            const exists = prev.some((item) => getId(item) == getId(curr_obj));
            if (exists) {
                return prev.filter((item) => getId(item) !== getId(curr_obj));
            } else {
                return [...prev, curr_obj];
            }
        });
        // handleOpen();
    };

    return (
        <div
            style={{
                position: "relative",
                maskImage:
                    "linear-gradient(to right, transparent, black 20%, black 80%, transparent), linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
                maskComposite: "intersect",
            }}
        >
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

export { EmbedGraph, AxisTypes };
