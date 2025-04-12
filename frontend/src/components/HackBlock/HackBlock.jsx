import React from "react";
import styled from "styled-components";
import LinkIcon from "@mui/icons-material/Link";

import theme from "../../theme";
import { LocalIconButton } from "../shared/IconButton";

// import { Button } from "../shared/Button";

const getId = (item) => `${item.id}-${item.title_project.replace(/\s+/g, "")}`;

const HackWrapper = styled.div`
    margin: 24px;
    text-align: left;
`;
const HackTitle = styled.div`
    font-size: 20px;
`;
const HackSummary = styled.div`
    margin: 10px 0;
    font-size: 16px;
`;
const HackDivider = styled.hr`
    border-top: 2px solid ${theme.palette.secondary.main};
    margin: 10px 0px;
`;

const HackIndividual = ({ hack }) => {
    return (
        <HackWrapper>
            <HackTitle>{hack.title_project}</HackTitle>
            <HackSummary>{hack.brief_desc}</HackSummary>
            <LocalIconButton
                href={hack.project_link}
                icon={<LinkIcon color="primary" />}
            ></LocalIconButton>
            <HackDivider />
        </HackWrapper>
    );
};

const HackBlock = ({
    hovered,
    selected,
}) => {

    return (
        <div style={{ color: theme.palette.primary.main, margin: "0 10px" }}>
            
            <div
                style={{
                    overflowY: "scroll",
                    height: "50vh",
                }}
            >
                {selected &&
                    selected.length > 0 &&
                    selected.map((hack) => {
                        if (hovered && getId(hack) === getId(hovered.obj)) {
                            return (
                                <div
                                    style={{ fontWeight: "bold" }}
                                    key={`hackblock-bolded-${getId(hack)}`}
                                >
                                    <HackIndividual hack={hack} />
                                </div>
                            );
                        }
                        return (
                            <HackIndividual
                                hack={hack}
                                key={`hackblock-${getId(hack)}`}
                            />
                        );
                    })}
            </div>
        </div>
    );
};

export { HackBlock };
