import { useState } from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Chip from '@mui/material/Chip';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Pagination from '@mui/material/Pagination';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import DatePicker from '@mui/lab/DatePicker';

import NodeControl from '../components/NodeControl';

import simulate from '../simulator';
import { dateDiff } from '../utils';

import { Node, NodeDistribution, NodeConfig, SimulationResults, Wallet, Log } from '../interfaces';

const nodeConfig: NodeConfig = {
  lesser: {
    type: 'lesser',
    label: 'Lesser',
    dailyReward: 0.0125,
    cost: 1,
    fusionTax: 0.0125,
    fusionCost: 5,
    fusionTarget: 'common',
  },
  common: {
    type: 'common',
    label: 'Common',
    dailyReward: 0.0718,
    cost: 5,
    fusionTax: 0.1651,
    fusionCost: 2,
    fusionTarget: 'legendary',
  },
  legendary: {
    type: 'legendary',
    label: 'Legendary',
    dailyReward: 0.1651,
    cost: 10,
    fusionTax: 1.898,
    fusionCost: 10,
    fusionTarget: 'omega',
  },
  omega: {
    type: 'omega',
    label: 'Omega',
    limit: 1,
    dailyReward: 1.898,
  },
};

const nodes: Node[] = Object.values(nodeConfig);

const TODAY_DATE = new Date();
TODAY_DATE.setHours(0, 0, 0, 0);

const drawerWidth = 280;

const HomePage = () => {
  const [nodeDistribution, setNodeDistribution] = useState<NodeDistribution>({
    lesser: 4,
    common: 1,
    legendary: 4,
    omega: 0,
  });
  const [startDate, setStartDate] = useState<Date>(TODAY_DATE);
  const [endDate, setEndDate] = useState<Date | null>(new Date('2022-03-01'));

  const [coinPrice, setCoinPrice] = useState<string>('100');
  const [wallet, setWallet] = useState<Wallet<string>>({ PENT: '0', MATIC: '15' });
  const [avgGasPrice, setAvgGasPrice] = useState<string>('0.01');
  const [logPage, setLogPage] = useState(1);
  const [logPageSize] = useState(7);

  const [results, setResults] = useState<SimulationResults>();

  const handleGenerateClick = () => {
    const numOfDays = endDate ? dateDiff(startDate, endDate) : 7;
    const simulationResults = simulate(
      startDate,
      numOfDays,
      nodeConfig,
      nodeDistribution,
      wallet,
      parseInt(coinPrice),
      parseInt(avgGasPrice)
    );
    setResults(simulationResults);
  };

  let pagedKeys: string[] = [];
  let logPageCount = 1;

  if (results?.log) {
    logPageCount = Math.ceil(Object.keys(results.log).length / logPageSize);

    const start = (logPage - 1) * logPageSize;
    const end = start + logPageSize;
    pagedKeys = Object.keys(results.log).slice(start, end);
  }

  return (
    <Box sx={{ display: 'flex', pb: 5 }}>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            backgroundColor: '#131313',
            borderColor: '#131313',
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        elevation={0}
        variant="permanent"
        anchor="left"
      >
        <Toolbar>
          <Typography variant="h5">Configuration</Typography>
        </Toolbar>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Stack gap={4}>
            <Stack gap={2}>
              <TextField
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                type="number"
                label="Coin price"
                value={coinPrice}
                onChange={event => setCoinPrice(event.target.value)}
              />
              <TextField
                InputProps={{
                  endAdornment: <InputAdornment position="end">MATIC</InputAdornment>,
                }}
                type="number"
                label="Avg. gas price"
                value={avgGasPrice}
                onChange={event => setAvgGasPrice(event.target.value)}
              />
            </Stack>
            <Stack gap={2}>
              <TextField
                InputProps={{
                  endAdornment: <InputAdornment position="end">PENT</InputAdornment>,
                }}
                type="number"
                label="Wallet (PENT)"
                value={wallet['PENT']}
                onChange={event => setWallet(wallet => ({ ...wallet, PENT: event.target.value }))}
              />
              <TextField
                InputProps={{
                  endAdornment: <InputAdornment position="end">MATIC</InputAdornment>,
                }}
                type="number"
                label="Wallet (MATIC)"
                value={wallet['MATIC']}
                onChange={event => setWallet(wallet => ({ ...wallet, MATIC: event.target.value }))}
              />
            </Stack>

            <Stack gap={2}>
              {nodes.map(node => (
                <Stack key={node.type} spacing={4} direction="row" alignItems="center">
                  <img height={64} width={64} alt={node.label} src={`/images/${node.type}.png`} />
                  <Slider
                    aria-label={`${node.label}-slider`}
                    valueLabelDisplay="auto"
                    max={node.limit || 10}
                    value={nodeDistribution[node.type]}
                    onChange={(_event, value) =>
                      setNodeDistribution(nodeDistribution => ({ ...nodeDistribution, [node.type]: value as number }))
                    }
                  />
                  <Typography>{nodeDistribution[node.type]}</Typography>
                </Stack>
              ))}
            </Stack>

            <Stack gap={2}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={value => {
                  const newValue = value || TODAY_DATE;
                  setStartDate(newValue);

                  if (endDate && newValue >= endDate) {
                    setEndDate(null);
                  }
                }}
                showTodayButton
                shouldDisableDate={date => date < TODAY_DATE}
                renderInput={params => <TextField {...params} />}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={newValue => {
                  setEndDate(newValue);
                }}
                shouldDisableDate={date => (date ? date <= startDate : false)}
                renderInput={params => <TextField {...params} />}
              />
              <Button variant="contained" onClick={handleGenerateClick}>
                Calculate
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Drawer>

      <Container>
        <Toolbar />

        {!results && (
          <Stack gap={6}>
            <Stack gap={3}>
              <Typography variant="h3">Welcome,</Typography>
              <Typography>
                This is a simple calculator for compounding Pentagon nodes. Use the panel to your left to get started.
              </Typography>
              <Grid container columns={4} gap={2}>
                {nodes.map(node => (
                  <Grid key={node.type} flex={1} item>
                    <NodeControl {...node} imgSrc={`/images/${node.type}.png`} />
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Stack>
        )}
        {results && (
          <Stack gap={5}>
            <Grid container columns={2} gap={2}>
              <Grid flex={1} item>
                <Paper variant="outlined" sx={{ backgroundColor: '#1F1F1FAA', py: 2, px: 4, borderRadius: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Wallet
                  </Typography>
                  <Stack gap={1}>
                    <Typography component="div">
                      {results.wallet['PENT']} PENT{' '}
                      {results.diff.wallet['PENT'] !== 0 && (
                        <Chip
                          size="small"
                          label={`${results.diff.wallet['PENT'] > 0 ? '+' : ''}${results.diff.wallet['PENT']}`}
                          color={results.diff.wallet['PENT'] > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </Typography>
                    <Typography component="div">
                      {results.wallet['MATIC']} MATIC{' '}
                      {results.diff.wallet['MATIC'] !== 0 && (
                        <Chip
                          size="small"
                          label={`${results.diff.wallet['MATIC'] > 0 ? '+' : ''}${results.diff.wallet['MATIC']}`}
                          color={results.diff.wallet['MATIC'] > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      )}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
              <Grid flex={1} item>
                <Paper variant="outlined" sx={{ backgroundColor: '#1F1F1FAA', py: 2, px: 4, borderRadius: 3 }}>
                  <Grid container gap={1} columns={2}>
                    <Grid flex={1} item>
                      <Typography variant="h6" gutterBottom>
                        Daily Rewards
                      </Typography>
                      <Stack gap={1}>
                        <Typography component="div">
                          {results.dailyRewards['PENT']} PENT{' '}
                          {results.diff.dailyRewards['PENT'] !== 0 && (
                            <Chip
                              size="small"
                              label={`${results.diff.dailyRewards['PENT'] > 0 ? '+' : ''}${
                                results.diff.dailyRewards['PENT']
                              }`}
                              color={results.diff.dailyRewards['PENT'] > 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          )}
                        </Typography>
                        <Typography component="div">
                          ${results.dailyRewards['USD']}{' '}
                          {results.diff.dailyRewards['USD'] !== 0 && (
                            <Chip
                              size="small"
                              label={`${results.diff.dailyRewards['USD'] > 0 ? '+' : ''}${
                                results.diff.dailyRewards['USD']
                              }`}
                              color={results.diff.dailyRewards['USD'] > 0 ? 'success' : 'error'}
                              variant="outlined"
                            />
                          )}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item>
                      <Typography variant="h6" gutterBottom>
                        Monthly Rewards
                      </Typography>
                      <Stack gap={1}>
                        <Typography>{Math.round(results.dailyRewards['PENT'] * 30 * 10000) / 10000} PENT </Typography>
                        <Typography>${results.dailyRewards['USD'] * 30} </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
            <Grid container columns={4} gap={2}>
              {nodes.map(node => (
                <Grid key={node.type} flex={1} item>
                  <NodeControl
                    {...node}
                    imgSrc={`/images/${node.type}.png`}
                    value={results.nodeDistribution[node.type] || 0}
                    diff={results.diff.nodeDistribution[node.type]}
                  />
                </Grid>
              ))}
            </Grid>
            {results && results.log && (
              <div>
                <Typography variant="h6" gutterBottom>
                  Log
                </Typography>
                {pagedKeys.map(key => (
                  <Accordion key={key}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls="panel1a-content"
                      id="panel1a-header"
                    >
                      <Typography>{key}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {results.log &&
                        results.log[key].map((entry, entryIndex) => (
                          <Typography key={`${key}-entry-${entryIndex}`}>{entry}</Typography>
                        ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Pagination
                    count={logPageCount}
                    page={logPage}
                    onChange={(_event, value) => {
                      setLogPage(value);
                    }}
                  />
                </Box>
              </div>
            )}
          </Stack>
        )}
      </Container>
    </Box>
  );
};

export default HomePage;
