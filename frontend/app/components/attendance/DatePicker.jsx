"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { DateRange } from "react-day-picker";
import { FaCalendarWeek } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Helper function to check if date is valid
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// Helper function to safely format date
const formatDate = (date) => {
  if (!date) return null;
  
  // If it's a string, try to convert to Date
  if (typeof date === 'string') {
    const parsedDate = new Date(date);
    return isValidDate(parsedDate) ? format(parsedDate, "LLL dd, y") : null;
  }
  
  // If it's already a Date object, validate and format
  return isValidDate(date) ? format(date, "LLL dd, y") : null;
};

export function DatePicker({ className, date, setDate }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className={cn(
              "data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <FaCalendarWeek />
            {date ? (
              formatDate(date) || <span>Pick a date</span>
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar 
            mode="single" 
            selected={date} 
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function DatePickerWithRange({ className, date, setDate }) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <FaCalendarWeek />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDate(date.from) || "Invalid date"} -{" "}
                  {formatDate(date.to) || "Invalid date"}
                </>
              ) : (
                formatDate(date.from) || "Invalid date"
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}