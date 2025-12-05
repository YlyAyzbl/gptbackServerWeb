import { Box, Typography, Link } from '@mui/material';

function Footer() {
    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                backgroundColor: 'primary.main',
                color: 'white',
                textAlign: 'center',
                mt: 'auto',
            }}
        >
            <Typography variant="body2" sx={{ mb: 1 }}>
                &copy; {new Date().getFullYear()} Redux + React Router Demo. Powered by React 17 + Tailwind CSS 3
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap', fontSize: '0.875rem' }}>
                <Link href="/" color="inherit" underline="hover">
                    Home
                </Link>
                <Link href="/state-demo" color="inherit" underline="hover">
                    State Demo
                </Link>
                <Link href="/persistence-demo" color="inherit" underline="hover">
                    Persistence Demo
                </Link>
            </Box>
        </Box>
    );
}

export default Footer;
