import React from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { Box, LinearProgress } from '@mui/material';

export const LoaderBackdrop = ({ open }) => (
  <Backdrop
    sx={{
      zIndex: (theme) => theme.zIndex.drawer + 1,
      color: '#fff',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      position: 'fixed', 
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
    }}
    open={open}
  >
    <CircularProgress color="inherit" />
  </Backdrop>
);
export const LineLoader = (props) => {
    return (
      <>
        <Box sx={{ width: '100%' }} display={props.loader ? 'block' : 'none'}>
          <LinearProgress color="success" />
        </Box>
      </>
    )
  }