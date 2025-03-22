const { google } = require("googleapis");

const getCalendarClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Use the user's stored tokens
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
};

const addEventToCalendar = async (user, timetable) => {
  try {
    const calendar = getCalendarClient(user);

    // Construct an event object. You may adjust this to include multiple events if needed.
    const event = {
      summary: timetable.title,
      description: `Timetable scheduled on ${new Date(timetable.date).toLocaleDateString()}`,
      start: {
        // Using the timetable date as start time. Adjust if you have specific time slots.
        dateTime: new Date(timetable.date).toISOString(),
        timeZone: "UTC", // Change to your desired time zone if needed.
      },
      end: {
        // For example, set the event to be one hour long.
        dateTime: new Date(new Date(timetable.date).getTime() + 60 * 60 * 1000).toISOString(),
        timeZone: "UTC",
      },
    };

    // Insert the event into the user's primary calendar.
    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });
    console.log("Google Calendar event created:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating Google Calendar event:", error);
    throw error;
  }
};

module.exports = { addEventToCalendar, getCalendarClient };
