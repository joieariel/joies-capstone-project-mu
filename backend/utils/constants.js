// Constants for community center operations

// Days of the week
const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Define different hour patterns
const hourPatterns = {
  // standard business hours
  standard: {
    weekday: { open_time: "9:00 AM", close_time: "5:00 PM", is_closed: false },
    saturday: {
      open_time: "10:00 AM",
      close_time: "4:00 PM",
      is_closed: false,
    },
    sunday: { open_time: null, close_time: null, is_closed: true },
  },
  // extended hours
  extended: {
    weekday: { open_time: "8:00 AM", close_time: "9:00 PM", is_closed: false },
    saturday: { open_time: "9:00 AM", close_time: "8:00 PM", is_closed: false },
    sunday: { open_time: "10:00 AM", close_time: "6:00 PM", is_closed: false },
  },
  // 24/7 operation
  twentyFourSeven: {
    weekday: {
      open_time: "12:00 AM",
      close_time: "11:59 PM",
      is_closed: false,
    },
    saturday: {
      open_time: "12:00 AM",
      close_time: "11:59 PM",
      is_closed: false,
    },
    sunday: { open_time: "12:00 AM", close_time: "11:59 PM", is_closed: false },
  },
  // limited weekend hours
  limitedWeekend: {
    weekday: { open_time: "7:00 AM", close_time: "8:00 PM", is_closed: false },
    saturday: { open_time: "9:00 AM", close_time: "5:00 PM", is_closed: false },
    sunday: { open_time: null, close_time: null, is_closed: true },
  },
  // Late night hours
  lateNight: {
    weekday: {
      open_time: "10:00 AM",
      close_time: "11:00 PM",
      is_closed: false,
    },
    saturday: {
      open_time: "10:00 AM",
      close_time: "12:00 AM",
      is_closed: false,
    },
    sunday: { open_time: "12:00 PM", close_time: "10:00 PM", is_closed: false },
  },
};

module.exports = {
  daysOfWeek,
  hourPatterns,
};
