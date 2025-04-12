import React from "react";

const SizeScale = ({ minSize = 10, maxSize = 20 }) => {
    // Create 5 sizes evenly spaced between min and max
    const sizes = Array.from(
        { length: 5 },
        (_, i) => minSize + (maxSize - minSize) * (i / 4)
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
                {sizes.map((size, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            left: `${i * size/2}px`,
                            top: "50%",
                            transform: "translateY(-50%)",
                            width: `${size}px`,
                            height: `${size}px`,
                            borderRadius: "50%",
                            backgroundColor: "#00000090", // Single color for all circles
                            zIndex: 5 - i,
                            opacity: 0.8,
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export { SizeScale };
