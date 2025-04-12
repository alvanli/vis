import React, { useState } from "react";
import styled from "styled-components";

import { Input } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";

import theme from "../../theme";
import { AxisTypes } from "../Graph/Graph";
import { Button } from "../shared/Button";
import { Dropdown } from "../shared/Dropdown";
import { Checkbox } from "../shared/Checkbox";
import { InfernoColorScaleLegend } from "../shared/InfernoColorScale";
import { SizeScale } from "../shared/SizeScale";
import { ScrollBar } from "../shared/ScrollBar";

import { pipeline } from "@huggingface/transformers";

const pipe = await pipeline(
    "feature-extraction",
    "nomic-ai/nomic-embed-text-v1",
    {
        quantized: true, // Comment out this line to use the quantized version
    }
);

const InputBox = ({
    colorAxis,
    setColorAxis,
    sizeAxis,
    setSizeAxis,
    filters,
    setFilters,
    setSelected,
    sizeMultiplier,
    setSizeMultiplier,
}) => {
    const [textInput, setTextInput] = useState("");
    const [isTextLoading, setIsTextLoading] = useState(false);
    const handleChange = (event) => {
        setTextInput(event.target.value);
    };

    const checkboxChangeHandler = (filterName, checked) => {
        setFilters({
            ...filters,
            [filterName]: checked,
        });
    };

    const resetSelections = () => {
        setSelected([]);
    };

    const submitText = async () => {
        setIsTextLoading(true);
        const output = await pipe(textInput, {
            pooling: "mean",
            normalize: true,
        });
        const embeddings = Array.isArray(output) ? output : output.data;
        console.log("emb", embeddings);
        const response = await fetch("http://127.0.0.1:8080/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                text: textInput,
                embeddings: embeddings,
            }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();

        setTextInput("");
        // } catch (error) {
        //     console.error('Error processing text:', error);
        // }
    };

    return (
        <div
            style={{
                margin: "0 40px",
            }}
        >
            <div
                style={{
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
                    value={textInput}
                    onChange={handleChange}
                    disableUnderline={true}
                    sx={{
                        color: "primary.main",
                    }}
                />
                <IconButton
                    type="button"
                    sx={{ p: "10px" }}
                    aria-label="search"
                    onClick={() => submitText()}
                >
                    <SearchIcon color="primary" />
                </IconButton>
            </div>
            <div>
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-start",
                        marginTop: "16px",
                    }}
                >
                    <div style={{ padding: "5px", margin: "5px" }}>
                        <Checkbox
                            label="Winners Only"
                            checked={filters.prize_only}
                            onChange={() =>
                                checkboxChangeHandler(
                                    "prize_only",
                                    !filters.prize_only
                                )
                            }
                        />
                    </div>
                    <Button onClick={() => resetSelections()}>
                        Reset Selection
                    </Button>
                    <InfernoColorScaleLegend />
                    <Dropdown
                        options={AxisTypes}
                        selectedValue={colorAxis}
                        placeholder="Color"
                        onSelect={setColorAxis}
                    />
                    <SizeScale />
                    <Dropdown
                        options={AxisTypes}
                        selectedValue={sizeAxis}
                        placeholder="Size"
                        onSelect={setSizeAxis}
                    />
                    <ScrollBar
                        value={sizeMultiplier}
                        setValue={setSizeMultiplier}
                        label="Size"
                    />
                </div>
            </div>
        </div>
    );
};

export { InputBox };
