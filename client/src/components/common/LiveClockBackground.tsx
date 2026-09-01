import {
    useEffect,
    useState,
} from "react";

import {
    Box,
} from "@mui/material";

type IsraelTime = {
    hours: number;
    minutes: number;
    seconds: number;
};

const israelTimeFormatter =
    new Intl.DateTimeFormat(
        "en-US",
        {
            timeZone:
                "Asia/Jerusalem",

            hour12:
                false,

            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit",
        },
    );

function getIsraelTime(): IsraelTime {
    const parts =
        israelTimeFormatter.formatToParts(
            new Date(),
        );

    const values =
        Object.fromEntries(
            parts.map(
                (part) => [
                    part.type,
                    part.value,
                ],
            ),
        );

    return {
        hours:
            Number(
                values.hour,
            ) % 24,

        minutes:
            Number(
                values.minute,
            ),

        seconds:
            Number(
                values.second,
            ),
    };
}

export default function LiveClockBackground() {
    const [
        time,
        setTime,
    ] = useState<IsraelTime>(
        getIsraelTime,
    );

    useEffect(() => {
        const intervalId =
            window.setInterval(
                () => {
                    setTime(
                        getIsraelTime(),
                    );
                },
                1000,
            );

        return () => {
            window.clearInterval(
                intervalId,
            );
        };
    }, []);

    const hourAngle =
        (time.hours % 12) *
        30 +
        time.minutes *
        0.5 +
        time.seconds /
        120;

    const minuteAngle =
        time.minutes *
        6 +
        time.seconds *
        0.1;

    const secondAngle =
        time.seconds *
        6;

    return (
        <Box
            aria-hidden="true"
            sx={{
                position:
                    "fixed",

                inset:
                    0,

                overflow:
                    "hidden",

                pointerEvents:
                    "none",

                userSelect:
                    "none",

                zIndex:
                    0,
            }}
        >
            {/* Full-page ambient champagne glow */}
            <Box
                sx={{
                    position:
                        "absolute",

                    inset:
                        0,

                    background:
                        `
              radial-gradient(
                circle at 50% 50%,
                rgba(186, 145, 73, 0.12) 0%,
                rgba(186, 145, 73, 0.065) 30%,
                rgba(186, 145, 73, 0.030) 52%,
                rgba(255, 255, 255, 0) 78%
              )
            `,

                    filter:
                        "blur(20px)",
                }}
            />

            {/* Luxury live clock - full-page wallpaper */}
            <Box
                sx={{
                    position:
                        "absolute",

                    left:
                        "50%",

                    top:
                        "50%",

                    transform:
                        "translate(-50%, -50%)",

                    /*
                     * Intentionally much larger than the
                     * viewport, so the dial becomes the
                     * background of the entire page.
                     */
                    width: {
                        xs: "82vmax",
                        sm: "80vmax",
                        md: "77vmax",
                        lg: "74vmax",
                        xl: "72vmax",
                    },

                    height: {
                        xs: "82vmax",
                        sm: "80vmax",
                        md: "77vmax",
                        lg: "74vmax",
                        xl: "72vmax",
                    },
                    /*
                     * Lower opacity is needed because the
                     * clock now spans the whole interface.
                     */
                    opacity: {
                        xs:
                            0.18,

                        sm:
                            0.20,

                        md:
                            0.22,

                        lg:
                            0.24,

                        xl:
                            0.25,
                    },

                    filter:
                        `
              drop-shadow(
                0 36px 90px rgba(80, 58, 24, 0.10)
              )
            `,
                }}
            >
                <Box
                    component="svg"
                    viewBox="0 0 600 600"
                    preserveAspectRatio="xMidYMid meet"
                    sx={{
                        display:
                            "block",

                        width:
                            "100%",

                        height:
                            "100%",

                        overflow:
                            "visible",
                    }}
                >
                    <defs>
                        {/* Rich polished champagne-gold bezel */}
                        <linearGradient
                            id="luxury-bezel"
                            x1="8%"
                            y1="5%"
                            x2="94%"
                            y2="95%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#fff0c7"
                            />

                            <stop
                                offset="11%"
                                stopColor="#d5a64d"
                            />

                            <stop
                                offset="24%"
                                stopColor="#8f621f"
                            />

                            <stop
                                offset="38%"
                                stopColor="#f2cf82"
                            />

                            <stop
                                offset="53%"
                                stopColor="#b47a28"
                            />

                            <stop
                                offset="69%"
                                stopColor="#f7dda0"
                            />

                            <stop
                                offset="84%"
                                stopColor="#98671f"
                            />

                            <stop
                                offset="100%"
                                stopColor="#e6bb69"
                            />
                        </linearGradient>

                        {/* Bright metal highlight */}
                        <linearGradient
                            id="luxury-highlight"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#ffffff"
                                stopOpacity="0.96"
                            />

                            <stop
                                offset="35%"
                                stopColor="#f5e4bd"
                                stopOpacity="0.58"
                            />

                            <stop
                                offset="100%"
                                stopColor="#8e641f"
                                stopOpacity="0.34"
                            />
                        </linearGradient>

                        {/* Transparent ivory glass dial */}
                        <radialGradient
                            id="transparent-dial"
                            cx="42%"
                            cy="35%"
                            r="76%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#fffdf8"
                                stopOpacity="0.54"
                            />

                            <stop
                                offset="52%"
                                stopColor="#f7efe0"
                                stopOpacity="0.30"
                            />

                            <stop
                                offset="100%"
                                stopColor="#d7ba7d"
                                stopOpacity="0.12"
                            />
                        </radialGradient>

                        {/* Gold applied indices */}
                        <linearGradient
                            id="index-gold"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#7e5318"
                            />

                            <stop
                                offset="28%"
                                stopColor="#f4d488"
                            />

                            <stop
                                offset="53%"
                                stopColor="#fff0bd"
                            />

                            <stop
                                offset="72%"
                                stopColor="#c48b32"
                            />

                            <stop
                                offset="100%"
                                stopColor="#6f4814"
                            />
                        </linearGradient>

                        {/* Hand metal */}
                        <linearGradient
                            id="hand-gold"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#5d431f"
                            />

                            <stop
                                offset="27%"
                                stopColor="#c28b34"
                            />

                            <stop
                                offset="50%"
                                stopColor="#fff0b4"
                            />

                            <stop
                                offset="72%"
                                stopColor="#d49d43"
                            />

                            <stop
                                offset="100%"
                                stopColor="#4f381a"
                            />
                        </linearGradient>

                        <radialGradient
                            id="center-cap"
                            cx="35%"
                            cy="28%"
                            r="72%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#fff4cd"
                            />

                            <stop
                                offset="26%"
                                stopColor="#e6b85d"
                            />

                            <stop
                                offset="63%"
                                stopColor="#a96e22"
                            />

                            <stop
                                offset="100%"
                                stopColor="#5e3d16"
                            />
                        </radialGradient>

                        {/* Bezel depth */}
                        <filter
                            id="bezel-shadow"
                            x="-30%"
                            y="-30%"
                            width="160%"
                            height="160%"
                        >
                            <feDropShadow
                                dx="0"
                                dy="7"
                                stdDeviation="7"
                                floodColor="#6a4718"
                                floodOpacity="0.25"
                            />
                        </filter>

                        {/* Applied indices depth */}
                        <filter
                            id="index-shadow"
                            x="-50%"
                            y="-50%"
                            width="200%"
                            height="200%"
                        >
                            <feDropShadow
                                dx="1.2"
                                dy="2"
                                stdDeviation="1.4"
                                floodColor="#493014"
                                floodOpacity="0.34"
                            />
                        </filter>

                        {/* Hands depth */}
                        <filter
                            id="hand-shadow"
                            x="-40%"
                            y="-40%"
                            width="180%"
                            height="180%"
                        >
                            <feDropShadow
                                dx="2"
                                dy="3"
                                stdDeviation="2"
                                floodColor="#3d2a14"
                                floodOpacity="0.34"
                            />
                        </filter>

                        {/* Soft crystal blur */}
                        <filter
                            id="glass-soft"
                            x="-30%"
                            y="-30%"
                            width="160%"
                            height="160%"
                        >
                            <feGaussianBlur
                                stdDeviation="3"
                            />
                        </filter>
                    </defs>

                    {/* Transparent outer halo */}
                    <circle
                        cx="300"
                        cy="300"
                        r="276"
                        fill="none"
                        stroke="rgba(187, 145, 70, 0.09)"
                        strokeWidth="18"
                    />

                    {/* Main polished bezel */}
                    <circle
                        cx="300"
                        cy="300"
                        r="265"
                        fill="none"
                        stroke="url(#luxury-bezel)"
                        strokeWidth="24"
                        filter="url(#bezel-shadow)"
                    />

                    {/* Fine inner bright edge */}
                    <circle
                        cx="300"
                        cy="300"
                        r="249"
                        fill="none"
                        stroke="url(#luxury-highlight)"
                        strokeWidth="5"
                    />

                    {/* Transparent dial */}
                    <circle
                        cx="300"
                        cy="300"
                        r="241"
                        fill="url(#transparent-dial)"
                        stroke="rgba(145, 105, 44, 0.30)"
                        strokeWidth="1.5"
                    />

                    {/* Inner chapter ring */}
                    <circle
                        cx="300"
                        cy="300"
                        r="225"
                        fill="none"
                        stroke="rgba(127, 94, 48, 0.24)"
                        strokeWidth="1"
                    />

                    {/* Minute track */}
                    {Array.from({
                        length: 60,
                    }).map(
                        (
                            _,
                            index,
                        ) => {
                            const isHour =
                                index %
                                5 ===
                                0;

                            return (
                                <line
                                    key={
                                        index
                                    }
                                    x1="300"
                                    y1={
                                        isHour
                                            ? 84
                                            : 91
                                    }
                                    x2="300"
                                    y2={
                                        isHour
                                            ? 111
                                            : 103
                                    }
                                    stroke={
                                        isHour
                                            ? "rgba(92, 64, 27, 0.70)"
                                            : "rgba(46, 43, 38, 0.56)"
                                    }
                                    strokeWidth={
                                        isHour
                                            ? 2.7
                                            : 1.2
                                    }
                                    strokeLinecap="round"
                                    transform={`rotate(${index *
                                        6
                                        } 300 300)`}
                                />
                            );
                        },
                    )}

                    {/* Applied 3D hour markers */}
                    {Array.from({
                        length: 12,
                    }).map(
                        (
                            _,
                            index,
                        ) => {
                            const angle =
                                index *
                                30;

                            const isTwelve =
                                index ===
                                0;

                            const isCardinal =
                                index %
                                3 ===
                                0;

                            return (
                                <g
                                    key={
                                        index
                                    }
                                    transform={`rotate(${angle} 300 300)`}
                                    filter="url(#index-shadow)"
                                >
                                    {isTwelve ? (
                                        <>
                                            <rect
                                                x="291"
                                                y="116"
                                                width="6"
                                                height="38"
                                                rx="2"
                                                fill="url(#index-gold)"
                                                stroke="#744d16"
                                                strokeWidth="0.8"
                                            />

                                            <rect
                                                x="303"
                                                y="116"
                                                width="6"
                                                height="38"
                                                rx="2"
                                                fill="url(#index-gold)"
                                                stroke="#744d16"
                                                strokeWidth="0.8"
                                            />
                                        </>
                                    ) : (
                                        <rect
                                            x={
                                                isCardinal
                                                    ? 295
                                                    : 296
                                            }
                                            y={
                                                isCardinal
                                                    ? 119
                                                    : 125
                                            }
                                            width={
                                                isCardinal
                                                    ? 10
                                                    : 8
                                            }
                                            height={
                                                isCardinal
                                                    ? 36
                                                    : 29
                                            }
                                            rx="2.4"
                                            fill="url(#index-gold)"
                                            stroke="#724c17"
                                            strokeWidth="0.8"
                                        />
                                    )}
                                </g>
                            );
                        },
                    )}

                    {/* Brand */}
                    <text
                        x="300"
                        y="224"
                        textAnchor="middle"
                        fill="rgba(129, 86, 29, 0.82)"
                        fontFamily="Georgia, Times New Roman, serif"
                        fontWeight="700"
                        fontSize="20"
                        letterSpacing="5"
                    >
                        LUXE WATCH
                    </text>

                    <line
                        x1="237"
                        y1="245"
                        x2="274"
                        y2="245"
                        stroke="rgba(177, 120, 37, 0.68)"
                        strokeWidth="1"
                    />

                    <text
                        x="300"
                        y="250"
                        textAnchor="middle"
                        fill="rgba(67, 65, 61, 0.70)"
                        fontFamily="Georgia, Times New Roman, serif"
                        fontSize="8"
                        letterSpacing="3"
                    >
                        JERUSALEM
                    </text>

                    <line
                        x1="326"
                        y1="245"
                        x2="363"
                        y2="245"
                        stroke="rgba(177, 120, 37, 0.68)"
                        strokeWidth="1"
                    />

                    <line
                        x1="242"
                        y1="400"
                        x2="272"
                        y2="400"
                        stroke="rgba(177, 120, 37, 0.52)"
                        strokeWidth="1"
                    />

                    <text
                        x="300"
                        y="404"
                        textAnchor="middle"
                        fill="rgba(64, 63, 59, 0.60)"
                        fontFamily="Georgia, Times New Roman, serif"
                        fontSize="8"
                        letterSpacing="3"
                    >
                        AUTOMATIC
                    </text>

                    <line
                        x1="328"
                        y1="400"
                        x2="358"
                        y2="400"
                        stroke="rgba(177, 120, 37, 0.52)"
                        strokeWidth="1"
                    />

                    {/* Hour hand */}
                    <g
                        transform={`rotate(${hourAngle} 300 300)`}
                        filter="url(#hand-shadow)"
                    >
                        <path
                            d="
                M 294 306
                L 289 211
                L 300 183
                L 311 211
                L 306 306
                Z
              "
                            fill="url(#hand-gold)"
                            stroke="#5e401a"
                            strokeWidth="1.4"
                        />

                        <path
                            d="
                M 298 290
                L 296 216
                L 300 202
                L 304 216
                L 302 290
                Z
              "
                            fill="rgba(255, 244, 210, 0.55)"
                        />
                    </g>

                    {/* Minute hand */}
                    <g
                        transform={`rotate(${minuteAngle} 300 300)`}
                        filter="url(#hand-shadow)"
                    >
                        <path
                            d="
                M 296 307
                L 293 158
                L 300 128
                L 307 158
                L 304 307
                Z
              "
                            fill="url(#hand-gold)"
                            stroke="#5c3d18"
                            strokeWidth="1.2"
                        />

                        <path
                            d="
                M 299 286
                L 298 165
                L 300 146
                L 302 165
                L 301 286
                Z
              "
                            fill="rgba(255, 245, 214, 0.48)"
                        />
                    </g>

                    {/* Seconds hand */}
                    <g
                        transform={`rotate(${secondAngle} 300 300)`}
                    >
                        <line
                            x1="300"
                            y1="349"
                            x2="300"
                            y2="117"
                            stroke="#b77822"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />

                        <circle
                            cx="300"
                            cy="358"
                            r="7"
                            fill="none"
                            stroke="#b77822"
                            strokeWidth="2"
                        />
                    </g>

                    {/* Center cap */}
                    <circle
                        cx="300"
                        cy="300"
                        r="18"
                        fill="url(#center-cap)"
                        stroke="#664316"
                        strokeWidth="2.3"
                        filter="url(#hand-shadow)"
                    />

                    <circle
                        cx="300"
                        cy="300"
                        r="7"
                        fill="#f6d583"
                        stroke="rgba(255, 248, 225, 0.92)"
                        strokeWidth="1.5"
                    />

                    {/* Crystal reflections */}
                    <path
                        d="
              M 140 174
              C 184 96,
                285 66,
                376 102
            "
                        fill="none"
                        stroke="rgba(255,255,255,0.46)"
                        strokeWidth="18"
                        strokeLinecap="round"
                        filter="url(#glass-soft)"
                    />

                    <path
                        d="
              M 165 447
              C 213 479,
                304 493,
                375 462
            "
                        fill="none"
                        stroke="rgba(255,255,255,0.16)"
                        strokeWidth="9"
                        strokeLinecap="round"
                    />
                </Box>
            </Box>
        </Box>
    );
}
