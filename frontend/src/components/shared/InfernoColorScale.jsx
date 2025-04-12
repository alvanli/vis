import React from "react";
import * as d3 from "d3";

const InfernoColorScaleLegend = ({ min = 0, max = 1 }) => {
    const colorScale = d3
        .scaleSequential(d3.interpolateInferno)
        .domain([min, max]);

    const values = Array.from(
        { length: 5 },
        (_, i) => min + (max - min) * (i / 4)
    );

    return (
        <div style={{ display: "flex", height: "40px" }}>
            <div
                style={{
                    position: "relative",
                    width: "50px",
                    marginLeft: "20px",
                    marginRight: "5px",
                    alignItems: "center",
                }}
            >
                {values.map((value, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${i * 10}px`,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: colorScale(value),
                            zIndex: 5 - i,
                            opacity: 0.8,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export { InfernoColorScaleLegend };
