import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import axios from "axios";

import { Box, CircularProgress, Input } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

import { EmbedGraph } from "./components/Graph/Graph";
import { DescModal } from "./components/Modal/Modal";
import theme from "./theme";
import { HackBlock } from "./components/HackBlock/HackBlock";

const DEVPOST_CSV =
    "https://gist.githubusercontent.com/alvanli/afc40b1bfd9da90be290f49fb776f90b/raw/1caa30c403e3f7370c750018872c528c80c6cad8/devpost.csv";
const DEVPOST_CLUSTERS =
    "https://gist.githubusercontent.com/alvanli/afc40b1bfd9da90be290f49fb776f90b/raw/7f9b70dc3ce7b5cbca0d2616b65774b1de2f6887/clusters.json";

const getRandomSubarray = (arr, size) => {
    const shuffled = [...arr];
    const result = [];
    while (result.length < size) {
        const index = Math.floor(Math.random() * shuffled.length);
        result.push(shuffled.splice(index, 1)[0]);
    }
    return result;
};

const MainPage = () => {
    const dataset = "devpost";
    const [modalOpen, setOpen] = useState(false);
    const [currDatum, setCurrDatum] = useState(null);
    const [data, setData] = useState([]);
    const [clusters, setClusters] = useState("");
    const [hovered, setHovered] = useState(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const datasetKeys = {
        devpost: {
            titleKey: "project_description",
            descKey: "project_description",
            linkKey: "project_link",
        },
        reddit: {
            titleKey: "title",
            linkKey: "full_link",
            descKey: "selftext",
        },
    };

    const parseCSV = (rawData) => {
        const parsed = Papa.parse(rawData, {
            header: true,
            dynamicTyping: true,
        });
        return parsed.data;
    };

    useEffect(() => {
        axios.get(DEVPOST_CSV).then((response) => {
            const rawData = response.data;
            const parsedData = parseCSV(rawData);
            const embParsedData = parsedData
                .filter((a) => a.umap_2d && a.dt)
                .map((a) => {
                    const arr = a.umap_2d
                        .slice(1, -1)
                        .split(" ")
                        .map(parseFloat);
                    const dt = Date.parse(a.dt);
                    return { ...a, umap_2d: arr, dt: dt / 1000 };
                })
                .filter(
                    (a) =>
                        a.umap_2d &&
                        a.dt &&
                        a.umap_2d[0] &&
                        a.umap_2d[1] &&
                        a.umap_2d[0] > 0 &&
                        a.umap_2d[1] > 0 &&
                        a.umap_2d[0] < 10 &&
                        a.umap_2d[1] < 10
                );

            console.log(`Got ${embParsedData.length} rows of ${dataset} data`);
            console.log(embParsedData.slice(1, 5));
            setData(getRandomSubarray(embParsedData, 1000));
        });
        axios.get(DEVPOST_CLUSTERS).then((response) => {
            const rawClusters = response.data;
            setClusters(rawClusters);
        });
    }, [dataset]);

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
                    titleKey={datasetKeys[dataset].titleKey}
                    descKey={datasetKeys[dataset].descKey}
                    linkKey={datasetKeys[dataset].linkKey}
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
                    {data && data.length ? (
                        <EmbedGraph
                            data={data}
                            clusters={clusters}
                            titleKey={datasetKeys[dataset].titleKey}
                            linkKey={datasetKeys[dataset].linkKey}
                            setCurrDatum={setCurrDatum}
                            handleOpen={handleOpen}
                            hovered={hovered}
                            setHovered={setHovered}
                        />
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
                    )}
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
