import React, { useState } from "react";

import { EmbedGraph, AxisTypes } from "./components/Graph/Graph";
import { DescModal } from "./components/Modal/Modal";
import theme from "./theme";
import { HackBlock } from "./components/HackBlock/HackBlock";
import { InputBox } from "./components/InputBox/InputBox";

const MainPage = () => {
    const [modalOpen, setOpen] = useState(false);
    const [currDatum, setCurrDatum] = useState(null);
    const [selected, setSelected] = useState([]);
    const [filters, setFilters] = useState({ prize_only: false });
    const [sizeAxis, setSizeAxis] = useState(AxisTypes.DATE.label);
    const [colorAxis, setColorAxis] = useState(AxisTypes.TEXT_LEN.label);
    const [hovered, setHovered] = useState(null);
    const [sizeMultiplier, setSizeMultiplier] = useState(50);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <div
            style={{
                height: "calc( 100vh - 40px )",
                backgroundColor: theme.palette.background.default,
                padding: "20px",
            }}
        >
            <InputBox
                setSelected={setSelected}
                selected={selected}
                hovered={hovered}
                filters={filters}
                setFilters={setFilters}
                sizeAxis={sizeAxis}
                setSizeAxis={setSizeAxis}
                colorAxis={colorAxis}
                setColorAxis={setColorAxis}
                sizeMultiplier={sizeMultiplier}
                setSizeMultiplier={setSizeMultiplier}
            />
            {currDatum && (
                <DescModal
                    modalOpen={modalOpen}
                    handleClose={handleClose}
                    currDatum={currDatum}
                />
            )}
            <div
                style={{
                    display: "flex",
                    margin: "20px 40px",
                }}
            >
                <div
                    style={{
                        boxShadow: "inset 0 0 50px rgba(0, 0, 0, 0.5)",
                        borderColor: theme.palette.primary.main,
                        borderWidth: "4px",
                        borderStyle: "solid",
                        borderRadius: "20px",
                        width: "60%",
                        marginRight: "10px",
                    }}
                >
                    <EmbedGraph
                        setCurrDatum={setCurrDatum}
                        handleOpen={handleOpen}
                        hovered={hovered}
                        setHovered={setHovered}
                        selected={selected}
                        setSelected={setSelected}
                        filters={filters}
                        colorAxis={colorAxis}
                        sizeAxis={sizeAxis}
                        sizeMultiplier={sizeMultiplier}
                    />
                </div>
                <div
                    style={{
                        width: "40%",
                        backgroundColor: theme.palette.background.dark,
                        borderRadius: "20px",
                        boxShadow: "5px 5px 5px 0px rgba(0, 0, 0, 0.4)",
                    }}
                >
                    <HackBlock
                        setSelected={setSelected}
                        selected={selected}
                        hovered={hovered}
                        filters={filters}
                        setFilters={setFilters}
                        sizeAxis={sizeAxis}
                        setSizeAxis={setSizeAxis}
                        colorAxis={colorAxis}
                        setColorAxis={setColorAxis}
                    />
                </div>
            </div>
        </div>
    );
};

export { MainPage };
