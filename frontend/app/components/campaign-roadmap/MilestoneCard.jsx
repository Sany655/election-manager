import React from "react";
import { FaCalendarCheck, FaEdit, FaTrash } from "react-icons/fa";

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

const MilestoneCard = ({ item, index, isEven, onEdit, onDelete }) => {
    return (
        <div className={`relative bg-white p-6 rounded-2xl shadow-lg border border-slate-100 w-full mb-8
            ${isEven ? 'text-left' : 'text-right'}
            hover:shadow-xl hover:scale-[1.02] transition-all duration-300 group
            hover:bg-gradient-to-br hover:from-white hover:to-blue-50 hover:border-blue-200
        `}>
            {/* Header Section */}
            <div className={`flex justify-between items-start mb-3 ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                <div className={`flex-1 ${isEven ? 'pr-4' : 'pl-4'}`}>
                    <h3 className="text-xl font-extrabold text-slate-800 group-hover:text-blue-900 tracking-tight leading-tight mb-1 transition-colors">
                        {item.title}
                    </h3>
                    <div className={`flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-blue-600 uppercase tracking-wider ${isEven ? 'justify-start' : 'justify-end'} transition-colors`}>
                        <FaCalendarCheck className="text-blue-500" />
                        <span>
                            {new Date(item.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            {" - "}
                            {new Date(item.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                        title="Edit Milestone"
                    >
                        <FaEdit />
                    </button>
                    <button
                        onClick={() => onDelete(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                        title="Delete Milestone"
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm mb-5 leading-relaxed font-medium transition-colors">
                {item.description}
            </p>

            {/* Campaign Types - Shining Effect */}
            {item.milestones && item.milestones.length > 0 && (
                <div className={`flex flex-wrap gap-3 mt-4 ${isEven ? 'justify-start' : 'justify-end'}`}>
                    {item.milestones.map((mt, i) => (
                        <div
                            key={mt.id || i}
                            className="relative overflow-hidden group/badge rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(i)} opacity-10 group-hover/badge:opacity-20 transition-opacity`}></div>
                            <div className="relative px-3 py-2 border border-slate-100 bg-white/50 backdrop-blur-sm rounded-lg flex items-center gap-2">
                                <span className={`text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r ${getGradient(i)}`}>
                                    {mt.eventType?.name || "Type"}
                                </span>
                                <span className="text-xs font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {mt.count}
                                </span>
                                {mt.area && (
                                    <span className="text-[12px] font-semibold text-slate-500 uppercase border-l border-slate-200 pl-2">
                                        {mt.area}
                                    </span>
                                )}
                            </div>

                            {/* Shine Animation */}
                            <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-40 group-hover/badge:animate-shine" />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MilestoneCard;
