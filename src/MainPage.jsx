import React, { useEffect, useState } from "react";
import Papa, { parse } from 'papaparse';
import axios from 'axios';

import { Box, CircularProgress, Input, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


import { EmbedGraph } from "./components/Graph/Graph";
import { DescModal } from "./components/Modal/Modal";

const DEVPOST_CSV = 'https://gist.githubusercontent.com/alvanli/afc40b1bfd9da90be290f49fb776f90b/raw/1caa30c403e3f7370c750018872c528c80c6cad8/devpost.csv';
const DEVPOST_CLUSTERS = "https://gist.githubusercontent.com/alvanli/afc40b1bfd9da90be290f49fb776f90b/raw/7f9b70dc3ce7b5cbca0d2616b65774b1de2f6887/clusters.json";

const getRandomSubarray = (arr, size) => {
    const shuffled = [...arr]; // create a shallow copy of the array
    const result = [];
    while (result.length < size) {
        const index = Math.floor(Math.random() * shuffled.length);
        result.push(shuffled.splice(index, 1)[0]);
    }
    return result;
}


const MainPage = () => {
    const [dataset, setDataset] = useState('devpost');
    const [modalOpen, setOpen] = useState(false);
    const [currDatum, setCurrDatum] = useState(null);
    const [data, setData] = useState([]);
    const [clusters, setClusters] = useState('');

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const datasetKeys = {
        devpost: {
            titleKey: 'project_description',
            descKey: 'project_description',
            linkKey: 'project_link'
        },
        reddit: {
            titleKey: 'title',
            linkKey: 'full_link',
            descKey: 'selftext'
        }
    }

    const parseCSV = (rawData) => {
        const parsed = Papa.parse(rawData, {
            header: true,
            dynamicTyping: true
        })
        return parsed.data;
    }

    useEffect(() => {
        axios.get(DEVPOST_CSV).then((response) => {
            const rawData = response.data;
            const parsedData = parseCSV(rawData);
            const embParsedData = parsedData.filter((a) => a.umap_2d && a.dt).map((a) => {
                const arr = a.umap_2d.slice(1, -1).split(" ").map(parseFloat);
                const dt = Date.parse(a.dt);
                return { ...a, umap_2d: arr, dt: dt / 1000 }
            }).filter((a) =>
                a.umap_2d && a.dt && a.umap_2d[0] && a.umap_2d[1] &&
                a.umap_2d[0] > 0 && a.umap_2d[1] > 0 &&
                a.umap_2d[0] < 10 && a.umap_2d[1] < 10
            );


            console.log(`Got ${embParsedData.length} rows of ${dataset} data`);
            console.log(embParsedData.slice(1, 5));
            setData(getRandomSubarray(embParsedData, 5000));
        });
        axios.get(DEVPOST_CLUSTERS).then((response) => {
            const rawClusters = response.data;
            setClusters(rawClusters);
        })
    }, [dataset]);

    return (
        <div style={{
            backgroundColor: "#282828",
            height: "100%"
        }}>
            <div style={{
                padding: "",
                
            }}>
                <Input
                    id="input-with-icon-adornment"
                    startAdornment={
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    }
                />
            </div>
            {currDatum &&
                <DescModal
                    modalOpen={modalOpen}
                    handleClose={handleClose}
                    currDatum={currDatum}
                    titleKey={datasetKeys[dataset].titleKey}
                    descKey={datasetKeys[dataset].descKey}
                    linkKey={datasetKeys[dataset].linkKey}
                />
            }
            {data && data.length ?
                <EmbedGraph
                    data={data}
                    clusters={clusters}
                    titleKey={datasetKeys[dataset].titleKey}
                    linkKey={datasetKeys[dataset].linkKey}
                    setCurrDatum={setCurrDatum}
                    handleOpen={handleOpen}
                />
                : (
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        height: '90vh',
                        alignItems: 'center'
                    }}>
                        <CircularProgress />
                    </Box>
                )
            }
        </div>
    );
}

export { MainPage };