import React from "react";

const WavyConnector = ({ direction = "right" }) => {
    // direction 'right' means the curve bulges to the right first (or logically flows that way)
    // Actually, let's just define two shapes:
    // Shape A: Curves Right then Left (for connecting to a Left-aligned item?)
    // Shape B: Curves Left then Right.

    // Let's stick to the visual in the image:
    // Top dot -> Next dot.
    // If Next dot's content is on the LEFT, the curve seems to go RIGHT then LEFT?
    // Let's look at the image:
    // 2015 (Right) -> 2016 (Left). Curve goes Right then Left.
    // 2016 (Left) -> 2017 (Right). Curve goes Left then Right.

    const isRight = direction === "right"; // Curves Right then Left

    // SVG ViewBox: 0 0 100 200
    // Start: 50, 0
    // End: 50, 200

    // Control Points for S-curve
    // If Right:
    // CP1: 100, 100
    // CP2: 0, 100
    // This is a bit simple.

    // Let's use multiple paths with offsets.
    const paths = [0, 1, 2, 3].map((i) => {
        const offset = (i - 1.5) * 4; // -6, -2, 2, 6
        // We need to offset the curve itself.
        // It's easier to just translate the path or use slightly different control points?
        // Parallel curves are tricky with simple offsets.
        // For a visual effect, just shifting the x-coordinates of the whole curve might work if the curve is gentle.

        return (
            <path
                key={i}
                d={isRight
                    ? `M ${50 + offset} 0 C ${100 + offset} 70, ${0 + offset} 130, ${50 + offset} 200`
                    : `M ${50 + offset} 0 C ${0 + offset} 70, ${100 + offset} 130, ${50 + offset} 200`
                }
                fill="none"
                stroke="#94a3b8" // slate-400
                strokeWidth="2"
                className="opacity-60"
            />
        );
    });

    return (
        <div className="w-full h-full flex justify-center overflow-visible z-0 relative">
            <svg viewBox="0 0 100 200" preserveAspectRatio="none" className="h-full w-24 overflow-visible">
                {paths}
            </svg>
        </div>
    );
};

export default WavyConnector;
