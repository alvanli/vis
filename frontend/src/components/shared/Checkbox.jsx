import React from "react";
import styled from "styled-components";
import theme from "../../theme";

const CheckboxContainer = styled.div`
    display: inline-block;
    vertical-align: middle;
`;

const HiddenCheckbox = styled.input.attrs({ type: "checkbox" })`
    border: 0;
    clip: rect(0 0 0 0);
    clippath: inset(50%);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    white-space: nowrap;
    width: 1px;
`;

const StyledCheckbox = styled.div`
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 4px;
    border: 1px solid ${theme.palette.primary.main};
    transition: all 150ms;

    ${HiddenCheckbox}:focus + & {
        box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.3);
    }
`;

const Checkmark = styled.svg`
    fill: none;
    stroke: white;
    stroke-width: 2px;
    visibility: ${(props) => (props.checked ? "visible" : "hidden")};
`;

const CheckboxLabel = styled.label`
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    color: ${theme.palette.primary.main}
`;

const Checkbox = ({ checked, onChange, label, className }) => {
    return (
        <CheckboxLabel className={className}>
            <CheckboxContainer>
                <HiddenCheckbox checked={checked} onChange={onChange} />
                <StyledCheckbox checked={checked}>
                    <Checkmark checked={checked} viewBox="0 0 24 24">
                        <polyline points="20 6 9 17 4 12" />
                    </Checkmark>
                </StyledCheckbox>
            </CheckboxContainer>
            {label && <span>{label}</span>}
        </CheckboxLabel>
    );
};

export { Checkbox };
