import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { usePega } from '../../context/PegaReadyContext';

export default function Dashboard() {
  const { isPegaReady, createCase, PegaContainer } = usePega();

  const handleCreateWorkOrder = () => {
    createCase('WorkOrder', {}).catch((err: any) => console.error(err));
  };

  if (!isPegaReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Connecting to Pega Launchpad...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant='h4'>Dashboard</Typography>
          <Typography variant='body2' color='text.secondary'>
            Overview of your work orders and assignments
          </Typography>
        </div>
        <Button variant='contained' startIcon={<AddIcon />} onClick={handleCreateWorkOrder}>
          New Work Order
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Pega-rendered content area */}
        <Grid item xs={12}>
          <Card elevation={1}>
            <CardContent>
              <Typography variant='h6' gutterBottom>
                Work Area
              </Typography>
              <div id='pega-root'>
                <PegaContainer />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
