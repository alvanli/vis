import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import theme from "../../theme";

const ButtonWrapper = styled.a`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: transparent;
    color: inherit;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
        background-color: ${theme.palette.primary.dark};
    }

    &:active {
        background-color: rgba(0, 0, 0, 0.08);
    }

    & > * {
        width: 24px;
        height: 24px;
    }
`;

const LocalIconButton = ({ href, icon, ...props }) => {
    return (
        <ButtonWrapper href={href} {...props}>
            {React.cloneElement(icon, {
                // You can pass additional props to the icon here if needed
            })}
        </ButtonWrapper>
    );
};

LocalIconButton.propTypes = {
    href: PropTypes.string,
    icon: PropTypes.element.isRequired,
};

export { LocalIconButton };
