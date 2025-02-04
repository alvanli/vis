import React from "react";
import { Box, Modal, Typography, IconButton } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';

const DescModal = ({ modalOpen, handleClose, currDatum, titleKey, descKey, linkKey }) => {
    let desc = Object.keys(currDatum).length > 0 && descKey in currDatum ? currDatum[descKey] : '';
    if (desc.length > 1000) {
        desc = `${desc.slice(0, 1000)}...`;
    }

    let title = Object.keys(currDatum).length > 0 && titleKey in currDatum && titleKey !== descKey ? currDatum[titleKey] : '';
    if (title.length > 100) {
        title = `${title.slice(0, 100)}...`;
    }


    return (
        <Modal
            open={modalOpen}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 500,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
            }}>
                <Typography
                    id="modal-modal-title1"
                    style={{
                        color: "black",
                        fontSize: 20
                    }}
                >
                    {title}
                </Typography>
                <Typography id="modal-modal-title2"
                    style={{
                        color: "black",
                        fontSize: 12
                    }}
                >
                    {desc}
                </Typography>
                <IconButton href={currDatum[linkKey]}>
                    <LinkIcon />
                </IconButton>
            </Box>
        </Modal>
    )
}

export { DescModal }