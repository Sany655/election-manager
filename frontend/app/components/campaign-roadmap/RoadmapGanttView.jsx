"use client";
import React, { useState, useRef } from "react";
import MilestoneHoverCard from "./MilestoneHoverCard";

const getGradient = (index) => {
    const gradients = [
        "from-blue-500 to-cyan-500",
        "from-purple-500 to-pink-500",
        "from-amber-500 to-orange-500",
        "from-emerald-500 to-teal-500",
        "from-indigo-500 to-violet-500",
        "from-rose-500 to-red-500",
    ];
    return gradients[index % gradients.length];
};

const RoadmapGanttView = ({ milestones }) => {
    const [hoveredItem, setHoveredItem] = useState(null);
    const [hoverPos, setHoverPos] = useState({ x: 0, y: 0 });
    const containerRef = useRef(null);

    if (!milestones || milestones.length === 0) {
        return <div className="text-center py-10 text-slate-500">No milestones to display.</div>;
    }

    // 1. Calculate Timeline Range
    const dates = milestones.flatMap(m => [new Date(m.startDate), new Date(m.endDate)]);
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    // Add buffer (7 days before, 7 days after)
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDuration = maxDate - minDate;

    // Helper to get percentage position
    const getPosition = (date) => {
        return ((new Date(date) - minDate) / totalDuration) * 100;
    };

    // Helper to get duration percentage
    const getWidth = (start, end) => {
        return ((new Date(end) - new Date(start)) / totalDuration) * 100;
    };

    // Generate Month Markers
    const months = [];
    let currentDate = new Date(minDate);
    currentDate.setDate(1); // Start from 1st of the month

    while (currentDate <= maxDate) {
        months.push(new Date(currentDate));
        currentDate.setMonth(currentDate.getMonth() + 1);
    }

    const handleMouseEnter = (e, item) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();

        // Calculate position relative to the container or viewport
        // Let's use fixed positioning for simplicity, or absolute relative to a parent.
        // If we use fixed, scrolling might be tricky.
        // Let's use absolute relative to the .relative container of the chart.

        // Actually, let's just track the mouse or the element.
        // Element is safer.

        let x = rect.left + rect.width / 2;
        let y = rect.top + window.scrollY; // Absolute Y on page

        // Adjust if close to right edge
        const screenWidth = window.innerWidth;
        if (x > screenWidth - 350) {
            x = x - 320; // Shift left
        }

        setHoverPos({ x, y: rect.bottom + window.scrollY + 10 }); // Show below
        setHoveredItem(item);
    };

    const handleMouseLeave = () => {
        setHoveredItem(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative" ref={containerRef}>
            <div className="overflow-x-auto custom-scrollbar">
                <div className="min-w-[800px] p-6 pb-24"> {/* Added padding bottom for hover card space */}
                    {/* Timeline Header */}
                    <div className="relative h-10 border-b border-slate-100 mb-6">
                        {months.map((month, index) => {
                            const left = getPosition(month);
                            // Only show if within range (0-100)
                            if (left < 0 || left > 100) return null;

                            return (
                                <div
                                    key={index}
                                    className="absolute top-0 text-xs font-semibold text-slate-400 uppercase tracking-wider border-l border-slate-200 pl-2 h-full flex items-center"
                                    style={{ left: `${left}%` }}
                                >
                                    {month.toLocaleDateString("en-US", { month: "short", year: "2-digit" })}
                                </div>
                            );
                        })}
                    </div>

                    {/* Milestones Rows */}
                    <div className="space-y-6">
                        {milestones.map((item, index) => {
                            const left = getPosition(item.startDate);
                            const width = getWidth(item.startDate, item.endDate);
                            const gradient = getGradient(index);

                            return (
                                <div key={item.id} className="relative group/row">
                                    {/* Row Label (Desktop: Left side, Mobile: Top) */}
                                    <div className="mb-2 flex justify-between items-baseline">
                                        <h4 className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{item.title}</h4>
                                        <span className="text-xs text-slate-400">
                                            {new Date(item.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(item.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>

                                    {/* Bar Track */}
                                    <div className="h-8 bg-slate-50 rounded-full w-full relative overflow-hidden">
                                        {/* Grid Lines for context */}
                                        {months.map((month, i) => {
                                            const l = getPosition(month);
                                            if (l < 0 || l > 100) return null;
                                            return <div key={i} className="absolute top-0 bottom-0 border-l border-slate-200 border-dashed" style={{ left: `${l}%` }} />;
                                        })}

                                        {/* The Bar */}
                                        <div
                                            className={`absolute top-1 bottom-1 rounded-full shadow-sm cursor-pointer overflow-hidden
                                                bg-gradient-to-r ${gradient}
                                                hover:shadow-md hover:brightness-105 transition-all
                                            `}
                                            style={{ left: `${left}%`, width: `${Math.max(width, 1)}%` }} // Min width 1%
                                            onMouseEnter={(e) => handleMouseEnter(e, item)}
                                            onMouseLeave={handleMouseLeave}
                                        >
                                            {/* Shine Effect */}
                                            <div className="absolute top-0 -inset-full h-full w-1/2 z-10 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-30 animate-shine" />

                                            {/* Label inside bar if wide enough */}
                                            {width > 15 && (
                                                <div className="absolute inset-0 flex items-center px-3 text-white text-xs font-bold shadow-sm whitespace-nowrap overflow-hidden text-ellipsis">
                                                    {item.title}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Hover Card Portal/Overlay */}
            {hoveredItem && (
                <div
                    className="fixed z-50 pointer-events-none"
                    style={{
                        left: hoverPos.x,
                        top: hoverPos.y,
                        transform: 'translate(-50%, 0)' // Center horizontally relative to the point
                    }}
                >
                    <MilestoneHoverCard item={hoveredItem} />
                </div>
            )}
        </div>
    );
};

export default RoadmapGanttView;
