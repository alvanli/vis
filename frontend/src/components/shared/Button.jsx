import React from "react";
import styled from "styled-components";
import theme from "../../theme";

const StyledButton = styled.button`
    height: 40px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background-color: ${theme.palette.primary.main};
    border: none;
    color: black;
    padding: 5px 16px;
    text-align: center;
    text-decoration: none;
    font-size: 16px;
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.3s ease;
    margin-left: 10px;
    margin-right: 10px;

    &:hover {
        background-color: ${theme.palette.primary.dark};
    }

    &:disabled {
        background-color: #cccccc;
        cursor: not-allowed;
    }
`;

const Button = ({
    children,
    onClick,
    disabled = false,
    type = "button"
}) => {
    return (
        <StyledButton onClick={onClick} disabled={disabled} type={type}>
            {children}
        </StyledButton>
    );
};

export { Button };
