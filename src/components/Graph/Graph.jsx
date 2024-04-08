import { useMemo, useRef, useEffect, useState } from "react";
import { Tooltip } from "./Tooltip";
// https://colorffy.com/dark-theme-generator
import * as d3 from "d3";


const getX = (item) => {
  return item.umap_2d[0];
};

const getY = (item) => {
  return item.umap_2d[1];
};

const MARGIN = { top: 50, right: 50, bottom: 60, left: 50 };
const BUBBLE_MIN_SIZE = 1;
const BUBBLE_MAX_SIZE = 7;

export function EmbedGraph({ data, clusters, linkKey, titleKey, setCurrDatum, handleOpen }) {
  const [hovered, setHovered] = useState(null);

  const windowWidth = useRef(window.innerWidth);
  const windowHeight = useRef(window.innerHeight);

  const width = 1200;
  const height = 1000;
  const axesRef = useRef(null);
  const boundsWidth = width - MARGIN.right - MARGIN.left;
  const boundsHeight = height - MARGIN.top - MARGIN.bottom;

  // Scales
  const yScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => getY(d)));
    return d3.scaleLinear().domain([min, max]).range([boundsHeight, 0]).nice();
  }, [data]);

  const xScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => getX(d)));
    return d3.scaleLinear().domain([min, max]).range([0, boundsWidth]).nice();
  }, [data]);

  const colorScale = useMemo(() => {
    const [min, max] = d3.extent(data.map((d) => d.dt));
    return d3.scaleSequential().interpolator(d3.interpolateInferno).domain([min, max]);
  }, [data]);

  // Build the shapes
  const allShapes = data.map((d, i) => {
    return (
      <circle
        key={i}
        r={2}
        cx={xScale(getX(d))}
        cy={yScale(getY(d))}
        opacity={1}
        fill={colorScale(d.dt)}
        fillOpacity={0.4}
        strokeWidth={1}
        onMouseEnter={() =>
          setHovered({
            xPos: xScale(getX(d)),
            yPos: yScale(getY(d)),
            name: d[titleKey].split("\n")[0],
            obj: d,
          })
        }
        onMouseLeave={() => {
          setHovered(null);
        }}
        style={{
          cursor: "pointer"
        }}
        onClick={() => {
          setCurrDatum(d);
          handleOpen();
        }}
      />
    );
  });

  const allClusterLabels = clusters && clusters.length ? Object.keys(clusters).map((key, idx) => {
    return (
      <text
        x={xScale(clusters[key]['center'][0])}
        y={yScale(clusters[key]['center'][1])}
        fontFamily="sans-serif"
        fontSize={7}
        color="white"
        fontWeight={300}
      >
        {clusters[key]['summary']}
      </text>
    );
  }) : null;

  return (
    <div>
      <>
        <label
          class="inline-block pl-[0.15rem] hover:cursor-pointer"
          for="flexSwitch"
        >
        </label>
      </>
      <svg width={width} height={height}>
        <g
          width={boundsWidth}
          height={boundsHeight}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        >
          {allShapes}
        </g>
        {/* <g>
          {allClusterLabels}
        </g> */}
        <g
          width={boundsWidth}
          height={boundsHeight}
          ref={axesRef}
          transform={`translate(${[MARGIN.left, MARGIN.top].join(",")})`}
        />
      </svg>
      <div
        style={{
          width: boundsWidth,
          height: boundsHeight,
          position: "absolute",
          top: 0,
          left: 0,
          pointerEvents: "none",
          marginLeft: MARGIN.left,
          marginTop: MARGIN.top,
        }}
      >
        <Tooltip
          interactionData={hovered}
          data={data}
        />
      </div>
    </div>
  );
}
