import React from "react";
import MilestoneCard from "./MilestoneCard";
import WavyConnector from "./WavyConnector";

const TimelineItem = ({ item, index, isLast, onEdit, onDelete }) => {
    const isEven = index % 2 === 0; // 0, 2, 4...
    // Even: Card on Right (2015).
    // Odd: Card on Left (2016).

    // Connector direction:
    // If Even (Card Right), Empty Left -> Bulge Left.
    // If Odd (Card Left), Empty Right -> Bulge Right.
    const connectorDirection = isEven ? "left" : "right";

    // Colors for the dots
    const colors = [
        "bg-amber-400 border-amber-400", // Yellow
        "bg-orange-400 border-orange-400", // Orange
        "bg-rose-300 border-rose-300", // Pinkish
        "bg-pink-400 border-pink-400", // Pink
        "bg-purple-400 border-purple-400", // Purple
        "bg-blue-400 border-blue-400", // Blue
    ];
    const colorClass = colors[index % colors.length];

    return (
        <div className="flex w-full z-10 relative">
            {/* Left Side */}
            <div className={`flex-1 flex ${!isEven ? 'justify-end pr-8' : ''}`}>
                {!isEven && (
                    <MilestoneCard
                        item={item}
                        index={index}
                        isEven={false}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>

            {/* Center Line */}
            <div className="w-24 flex flex-col items-center relative shrink-0">
                {/* Date Pill */}
                <div className="absolute -top-6 z-30 whitespace-nowrap">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm border border-slate-200 bg-white text-slate-600`}>
                        {new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" - "}
                        {new Date(item.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                </div>

                {/* The Dot */}
                <div className="relative z-20 mt-2">
                    {/* Outer Dotted Ring */}
                    <div className={`w-16 h-16 rounded-full border-2 border-dashed ${colorClass.split(' ')[1]} flex items-center justify-center bg-gray-50`}>
                        {/* Inner Circle */}
                        <div className={`w-10 h-10 rounded-full ${colorClass.split(' ')[0]} shadow-md`}></div>
                    </div>
                </div>

                {/* The Connector */}
                {!isLast && (
                    <div className="absolute top-14 w-full h-full pointer-events-none z-0">
                        <WavyConnector direction={connectorDirection} />
                    </div>
                )}
            </div>

            {/* Right Side */}
            <div className={`flex-1 flex ${isEven ? 'justify-start pl-8' : ''}`}>
                {isEven && (
                    <MilestoneCard
                        item={item}
                        index={index}
                        isEven={true}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                )}
            </div>
        </div>
    );
};

export default TimelineItem;
