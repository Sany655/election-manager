export function convertMinutesToHrMin(minutes) {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs > 0 ? `${hrs} hr` : ""}${hrs > 0 && mins > 0 ? " " : ""}${mins > 0 ? `${mins} min` : ""
    }`.trim();
}

export const formatLastSeen = (lastSeenMin) => {
  if (lastSeenMin < 1) return "Just now";
  if (lastSeenMin < 60) return `${lastSeenMin} min ago`;
  const hours = Math.floor(lastSeenMin / 60);
  const minutes = lastSeenMin % 60;
  return `${hours}h ${minutes}m ago`;
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const getAuthToken = () => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp('(^| )auth_token=([^;]+)'));
  if (match) return match[2];
  return null;
};
