import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import theme from "../../theme";


const DropdownContainer = styled.div`
    position: relative;
    display: inline-block;
    font-family: Arial, sans-serif;
`;

const DropdownButton = styled.button`
    height: 40px;
    background-color: #ffffff10;
    color: ${theme.palette.primary.main};
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    min-width: 150px;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: all 0.3s ease;
    font-size: 16px;
    margin-left: 10px;
    margin-right: 10px;

    &:hover {
        background-color: #f5f5f5;
        color: ${theme.palette.primary.dark};
    }

    &:focus {
        outline: none;
        border-color: #4d90fe;
        box-shadow: 0 0 0 2px rgba(77, 144, 254, 0.2);
    }
`;

const DropdownList = styled.ul`
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #ffffff;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 0;
    margin: 5px 0 0 0;
    list-style: none;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    max-height: 200px;
    overflow-y: auto;
    opacity: ${(props) => (props.$isOpen ? "1" : "0")};
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    transform: ${(props) =>
        props.$isOpen ? "translateY(0)" : "translateY(-10px)"};
    transition: all 0.3s ease;
`;

const DropdownItem = styled.li`
    padding: 10px 15px;
    cursor: pointer;
    color: #333;

    &:hover {
        background-color: #f5f5f5;
    }

    ${(props) =>
        props.$isSelected &&
        `
      background-color: #e6f2ff;
      font-weight: bold;
    `}
`;

const CaretIcon = styled.span`
    margin-left: 10px;
    transition: transform 0.3s ease;
    transform: ${(props) => (props.$isOpen ? "rotate(90deg)" : "rotate(0)")};
`;

const Dropdown = ({
    options,
    selectedValue,
    onSelect,
    placeholder = "Select an option",
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleSelect = (value) => {
        onSelect(value);
        setIsOpen(false);
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Find the selected option object
    const selectedOption = Object.values(options).find(
        (option) => option.label === selectedValue
    );

    return (
        <DropdownContainer ref={dropdownRef}>
            <DropdownButton
                onClick={toggleDropdown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                {selectedOption ? selectedOption.label : placeholder}
                <CaretIcon $isOpen={isOpen}>▼</CaretIcon>
            </DropdownButton>

            <DropdownList $isOpen={isOpen} role="listbox">
                {Object.values(options).map((option) => (
                    <DropdownItem
                        key={option.label}
                        onClick={() => handleSelect(option.label)}
                        $isSelected={selectedValue === option.label}
                        role="option"
                        aria-selected={selectedValue === option.label}
                    >
                        {option.label}
                    </DropdownItem>
                ))}
            </DropdownList>
        </DropdownContainer>
    );
};

export { Dropdown };
