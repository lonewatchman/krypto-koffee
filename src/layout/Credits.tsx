import { Link } from "@mui/material";
import { Typography } from "@mui/material";
import { Box } from "@mui/material";

export const Credits = () => (
    <>
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Typography>
                Ingeniously Crafted with &nbsp;
                <span style={{ color: "red" }}>❤️</span>
                &nbsp; by &nbsp;
                <Link
                    sx={{ color: "#ce93d8" }}
                    href="https://github.com/elcharitas"
                >
                    Jonathan Irhodia
                </Link>
            </Typography>
        </Box>
    </>
);
