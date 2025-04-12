import React, { useRef, useState, useEffect } from "react";
import styled from "styled-components";
import theme from "../../theme";

const ScrollBarContainer = styled.div`
    display: flex;
    align-items: center;
    width: 100px;
    height: 40px;
    position: relative;
`;

const Track = styled.div`
    width: 100%;
    height: 4px;
    background-color: ${theme.palette.primary.dark};
    border-radius: 2px;
    position: relative;
`;

const Progress = styled.div`
    height: 100%;
    background-color: ${theme.palette.primary.main};
    border-radius: 2px;
    width: ${(props) => props.value}%;
`;

const Knob = styled.div`
    width: 16px;
    height: 16px;
    background-color: ${theme.palette.primary.main};
    border-radius: 50%;
    position: absolute;
    left: ${(props) => props.value}%;
    top: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: transform 0.1s ease;

    &:active {
        transform: translate(-50%, -50%) scale(1.2);
    }
`;

const ScrollBar = ({ value, setValue, label }) => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleMouseDown = () => {
        setIsDragging(true);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e) => {
        if (!isDragging || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        let newValue =
            ((e.clientX - containerRect.left) / containerRect.width) * 100;

        // Clamp the value between 0 and 100
        newValue = Math.max(0, Math.min(100, newValue));

        setValue(newValue);
    };

    const handleClick = (e) => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newValue =
            ((e.clientX - containerRect.left) / containerRect.width) * 100;
        setValue(newValue);
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging]);

    return (
        <div
            style={{
                display: "flex",
                height: "40px",
                alignItems: "center",

                color: theme.palette.primary.main,
            }}
        >
            <div
                style={{
                    fontSize: "17px",
                    paddingLeft: "22px",
                    paddingRight: "8px",
                }}
            >
                {label}
            </div>
            <ScrollBarContainer ref={containerRef} onMouseDown={handleClick}>
                <Track>
                    <Progress value={value} />
                    <Knob value={value} onMouseDown={handleMouseDown} />
                </Track>
            </ScrollBarContainer>
        </div>
    );
};

export { ScrollBar };
