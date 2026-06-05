import React from "react";
import { FaCalendarCheck } from "react-icons/fa";

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

const MilestoneHoverCard = ({ item }) => {
    return (
        <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-200 w-[320px] z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="mb-3">
                <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1">
                    {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <FaCalendarCheck className="text-blue-500" />
                    <span>
                        {new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {" - "}
                        {new Date(item.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-xs mb-4 leading-relaxed line-clamp-3">
                {item.description}
            </p>

            {/* Types */}
            {item.milestones && item.milestones.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {item.milestones.map((mt, i) => (
                        <div
                            key={mt.id || i}
                            className="relative overflow-hidden rounded-md shadow-sm border border-slate-100 bg-slate-50 px-2 py-1 flex items-center gap-1.5"
                        >
                            <span className={`text-[10px] font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${getGradient(i)}`}>
                                {mt.eventType?.name || "Type"}
                            </span>
                            <span className="text-[10px] font-bold text-slate-700 bg-white px-1 rounded border border-slate-100">
                                {mt.count}
                            </span>
                            {mt.area && (
                                <span className="text-[10px] font-semibold text-slate-400 uppercase border-l border-slate-200 pl-1.5">
                                    {mt.area}
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MilestoneHoverCard;
