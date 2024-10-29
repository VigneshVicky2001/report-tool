import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Box, Grid, Alert } from '@mui/material'; // Import Alert
import { useNavigate } from 'react-router-dom';
import baseApi from './baseApi';
import hoverSound from '../Assets/wav/03 Primary System Sounds/ui_unlock.mp3';

const Start = () => {
  const navigate = useNavigate();

  const validServiceIds = ["STC", "AHA", "News9", "PLDT Cignal", "PLDT Plive", "PLDT Smart"];

  const serviceIdMapping = {
    "STC": "5200",
    "AHA": "5001",
    "News9": "5010",
    "PLDT Cignal": "5028",
    "PLDT Plive": "5028",
    "PLDT Smart": "5028",
    "AMD": "amd_project",
    "Canela": "canela_project",
    "Cogeco": "cogeco_project",
    "MSG": "msg_project",
    "RSM": "rsm_project",
    "Telekom Malaysia": "telekom_malaysia_project",
    "YES": "yes_project",
    "GAME": "game_project",
    "Univision": "univision_project",
    "Starhub": "starhub_project"
  };

  const [error, setError] = useState('');
  const hoverSoundRef = useRef(new Audio(hoverSound));

  const setProject = async (payload) => {
    try {
      const response = await baseApi.post('/set-service', payload);
    } catch (error) {
      console.error('Error setting project:', error);
    }
  };

  const handleClick = async (label) => {
    const serviceId = serviceIdMapping[label];
    localStorage.setItem("serviceId", serviceId);
    if (validServiceIds.includes(label)) {
      await setProject({ service_id: serviceId });
      setError('');
      // console.log(serviceId);
      navigate('/content', { state: { label: label }});
    } else {
      const errorMessage = `Error: The service "${label}" does not have a valid ID.`;
      setError(errorMessage);
      window.alert("contact admin");
    }
  };

  const handleMouseEnter = () => {
    hoverSoundRef.current.pause();
    hoverSoundRef.current.currentTime = 0;
    hoverSoundRef.current.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  };

  return (
    <Box sx={{ padding: 2, backgroundColor: '#2b2b2b', flex: 1, display: 'flex', alignItems: 'center' }}>
      <Container>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="center"
          style={{ minHeight: '80vh' }}
        >
          {Object.keys(serviceIdMapping).map((label, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Button
                onClick={() => handleClick(label)}
                onMouseEnter={handleMouseEnter}
                variant="contained"
                size="large"
                sx={{
                  height: '136px',
                  width: '219px',
                  fontSize: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#171717',
                  color: '#fff',
                  transition: 'transform 0.3s, background-color 0.3s',
                  '&:hover': {
                    backgroundColor: '#e26838',
                    transform: 'scale(1.05)',
                    color: 'black',
                  },
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{label}</span>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* {error && (
          <Alert severity="error" sx={{ marginTop: 2, textAlign: 'center' }}>
            Project doesn't exist, contact admin
          </Alert>
        )} */}
      </Container>
    </Box>
  );
};

export default Start;
