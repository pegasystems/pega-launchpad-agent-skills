import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import BuildIcon from '@mui/icons-material/Build';

export default function Header() {
  return (
    <AppBar position='static'>
      <Toolbar>
        <BuildIcon sx={{ mr: 1.5 }} />
        <Typography variant='h6' sx={{ flexGrow: 1 }}>
          Work Management
        </Typography>
        <Box>
          <Typography variant='body2' sx={{ opacity: 0.8 }}>
            Pega Launchpad
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
