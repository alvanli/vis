import React, { useState } from "react";

import { Box, CircularProgress, Input } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

import { EmbedGraph } from "./components/Graph/Graph";
import { DescModal } from "./components/Modal/Modal";
import theme from "./theme";
import { HackBlock } from "./components/HackBlock/HackBlock";

const MainPage = () => {
    const [modalOpen, setOpen] = useState(false);
    const [currDatum, setCurrDatum] = useState(null);
    const [selected, setSelected] = useState([]);
    const [hovered, setHovered] = useState(null);

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
            <div
                style={{
                    margin: "0 40px",
                    padding: "18px",
                    borderColor: theme.palette.primary.main,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    borderRadius: "20px",
                    color: theme.palette.primary.main,
                    display: "flex",
                }}
            >
                <Input
                    className="text-sky-50"
                    id="input-with-icon-adornment"
                    color="primary"
                    rows={2}
                    multiline={true}
                    fullWidth={true}
                    disableUnderline={true}
                    sx={{
                        color: "primary.main",
                    }}
                />
                <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="search"
                >
                    <SearchIcon color="primary" />
                </IconButton>
            </div>
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
                        boxShadow: "inset 0 0 20px rgba(0, 0, 0, 0.5)",
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
                        />
                    {/* {data && data.length ? (
                        
                    ) : (
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                height: "30vh",
                                alignItems: "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    )} */}
                </div>
                <div
                    style={{
                        width: "40%",
                        backgroundColor: theme.palette.background.dark,
                        borderRadius: "20px",
                        boxShadow: "5px 5px 5px 0px rgba(0, 0, 0, 0.4)",
                    }}
                >
                    <HackBlock hovered={hovered} />
                </div>
            </div>
        </div>
    );
};

export { MainPage };
