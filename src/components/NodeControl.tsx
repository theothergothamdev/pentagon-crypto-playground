import { useState } from 'react';
import ReactCardFlip from 'react-card-flip';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { Node } from '../interfaces';

interface NodeControlProps extends Node {
  value?: number;
  imgSrc: string;
}

const NodeControl = ({
  value,
  label,
  dailyReward,
  cost,
  fusionTax,
  fusionCost,
  fusionTarget,
  imgSrc,
  limit = 10,
}: NodeControlProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const handleInfoToggle = () => setShowInfo(value => !value);
  return (
    <ReactCardFlip containerStyle={{ height: '100%' }} isFlipped={showInfo}>
      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          backgroundColor: '#1F1F1FAA',
          p: 3,
          borderRadius: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography textAlign="center" variant="h5">
          {label}
        </Typography>
        <IconButton sx={{ position: 'absolute', right: 12, top: 20 }} aria-label="info" onClick={handleInfoToggle}>
          <InfoOutlinedIcon />
        </IconButton>

        <Stack alignItems="center" justifyContent="center" gap={1}>
          <img height={192} width={192} alt={label} src={imgSrc} />
          {typeof value === 'number' && (
            <Typography variant="h5" textAlign="center">
              {value}
            </Typography>
          )}
          {typeof value === 'undefined' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Stack sx={{ flex: 1, mt: 4 }} gap={1}>
                {cost && <Typography>Cost: {cost} PENT</Typography>}
                <Typography>Daily Reward: {dailyReward} PENT</Typography>
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          position: 'relative',
          backgroundColor: '#1F1F1FAA',
          p: 3,
          borderRadius: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography textAlign="center" variant="h6">
          {label}
        </Typography>
        <IconButton sx={{ position: 'absolute', right: 12, top: 20 }} aria-label="info" onClick={handleInfoToggle}>
          <InfoOutlinedIcon />
        </IconButton>

        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Stack sx={{ flex: 1, mt: 4 }} gap={1}>
            {cost && <Typography>Cost: {cost} PENT</Typography>}
            <Typography>Daily Reward: {dailyReward} PENT</Typography>
            {limit && <Typography>Limit: {limit}</Typography>}
            {fusionCost && <Typography>Fusion cost: {fusionCost} PENT</Typography>}
            {fusionTax && <Typography>Fusion tax: {fusionTax} PENT</Typography>}
            {fusionTarget && <Typography>Fusion target: {fusionTarget}</Typography>}
          </Stack>
        </Box>
      </Paper>
    </ReactCardFlip>
  );
};

export default NodeControl;
