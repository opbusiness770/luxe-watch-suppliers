import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    direction: "rtl",

    palette: {
        mode: "light",

        primary: {
            main: "#B39154",
            dark: "#92733F",
            light: "#D4BC8A",
            contrastText: "#FFFFFF",
        },

        secondary: {
            main: "#A7A9AC",
            dark: "#737579",
            light: "#D7D8DA",
        },

        background: {
            default: "#F8F7F4",
            paper: "#FFFFFF",
        },

        text: {
            primary: "#1D1D1F",
            secondary: "#696969",
        },

        divider: "#E7E4DE",
    },

    typography: {
        fontFamily: [
            "Arial",
            "Segoe UI",
            "sans-serif",
        ].join(","),

        h1: {
            fontWeight: 600,
        },

        h2: {
            fontWeight: 600,
        },

        h3: {
            fontWeight: 600,
        },

        h4: {
            fontWeight: 600,
        },

        h5: {
            fontWeight: 600,
        },

        h6: {
            fontWeight: 600,
        },

        button: {
            fontWeight: 600,
            textTransform: "none",
        },
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            },

            styleOverrides: {
                root: {
                    borderRadius: 10,

                    minHeight: 46,

                    paddingLeft: 24,
                    paddingRight: 24,

                    fontWeight: 700,

                    fontSize: "0.94rem",

                    letterSpacing: "0.1px",

                    transition:
                        "all 170ms ease",

                    "&:active": {
                        transform:
                            "translateY(1px)",
                    },

                    "&.MuiButton-containedPrimary": {
                        background:
                            "linear-gradient(135deg, #C6A25E 0%, #A9823F 100%)",

                        boxShadow:
                            "0 7px 20px rgba(179,145,84,0.22)",

                        "&:hover": {
                            background:
                                "linear-gradient(135deg, #D0B071 0%, #A9823F 100%)",

                            boxShadow:
                                "0 9px 25px rgba(179,145,84,0.30)",

                            transform:
                                "translateY(-1px)",
                        },
                    },

                    "&.MuiButton-outlinedPrimary": {
                        borderColor:
                            "rgba(179,145,84,0.55)",

                        backgroundColor:
                            "rgba(255,255,255,0.65)",

                        "&:hover": {
                            borderColor:
                                "#B39154",

                            backgroundColor:
                                "rgba(179,145,84,0.08)",
                        },
                    },
                },
            },
        },

        MuiCard: {
            styleOverrides: {
                root: {
                    border:
                        "1px solid #ECE9E3",

                    boxShadow:
                        "0 4px 20px rgba(20, 20, 20, 0.04)",
                },
            },
        },

        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage:
                        "none",

                    border:
                        "1px solid rgba(231,228,222,0.95)",

                    boxShadow:
                        "0 8px 32px rgba(42,35,23,0.055)",
                },
            },
        },

        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor:
                        "#F8F7F4",
                },
            },
        },

        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderColor:
                        "#E7E4DE",
                },

                head: {
                    fontWeight: 600,

                    whiteSpace:
                        "nowrap",

                    color:
                        "#3F3F3F",
                },
            },
        },

        MuiTableRow: {
            styleOverrides: {
                root: {
                    "&.MuiTableRow-hover:hover": {
                        backgroundColor:
                            "#FBFAF7",
                    },
                },
            },
        },

        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                },
            },
        },

        MuiDialogContent: {
            styleOverrides: {
                root: {
                    paddingTop: 16,
                },
            },
        },

        MuiAlert: {
            styleOverrides: {
                root: {
                    borderRadius: 10,
                },
            },
        },

        MuiTextField: {
            defaultProps: {
                variant:
                    "outlined",
            },
        },

        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 8,

                    backgroundColor:
                        "#FFFFFF",

                    "&:hover .MuiOutlinedInput-notchedOutline":
                    {
                        borderColor:
                            "#C5B28D",
                    },

                    "&.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                        borderColor:
                            "#B39154",
                    },
                },
            },
        },

        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color:
                        "#696969",

                    "&.Mui-focused": {
                        color:
                            "#92733F",
                    },
                },
            },
        },

        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: 8,

                    fontWeight: 500,
                },
            },
        },

        MuiTablePagination: {
            styleOverrides: {
                root: {
                    borderTop:
                        "1px solid #E7E4DE",
                },
            },
        },

        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundImage:
                        "none",

                    direction: "rtl",
                },
            },
        },

        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: "0.8rem",
                },
            },
        },
    },
});