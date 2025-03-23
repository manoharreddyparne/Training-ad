const { google } = require("googleapis");

// Returns a Google Calendar client using the tokens stored on the user object.
const getCalendarClient = (user) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  oauth2Client.setCredentials({
    access_token: user.googleAccessToken,
    refresh_token: user.googleRefreshToken,
  });
  return google.calendar({ version: "v3", auth: oauth2Client });
};

/**
 * Inserts or updates an event in the user's primary calendar using timetable data.
 * For a given time slot (if timeSlotIndex is provided), a unique identifier is generated
 * and set as the iCalUID. The function first checks for an event with that iCalUID.
 * If found, it updates that event; otherwise, it creates a new event.
 * Manually created events (without your custom iCalUID) are left intact.
 */
const addEventToCalendar = async (user, timetable, timeSlotIndex = null) => {
  try {
    const calendar = getCalendarClient(user);
    let event;
    let uniqueId = null;

    if (
      timeSlotIndex !== null &&
      timetable.timeSlots &&
      timetable.timeSlots.length > timeSlotIndex
    ) {
      const slot = timetable.timeSlots[timeSlotIndex];
      // Generate a unique identifier using timetable _id and the time slot index.
      // Use only allowed characters (lowercase letters, numbers, hyphens, and underscores).
      uniqueId = `${timetable._id.toString()}-${timeSlotIndex}-manoharreddy`.toLowerCase();
      event = {
        // Do not include the 'id' property on insert. We'll use iCalUID for lookup.
        summary: `${timetable.title} - ${slot.subject}`,
        description: `Class in room ${slot.room} taught by ${slot.teacher}`,
        start: {
          dateTime: new Date(slot.startTime).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(slot.endTime).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        iCalUID: uniqueId,
      };
    } else {
      // Fallback: create an event using the timetable's overall date.
      event = {
        summary: timetable.title,
        description: `Timetable scheduled on ${new Date(timetable.date).toLocaleDateString()}`,
        start: {
          dateTime: new Date(timetable.date).toISOString(),
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: new Date(new Date(timetable.date).getTime() + 60 * 60 * 1000).toISOString(),
          timeZone: "Asia/Kolkata",
        },
      };
    }

    // If a uniqueId exists, check if an event with that iCalUID already exists.
    if (uniqueId) {
      const listRes = await calendar.events.list({
        calendarId: "primary",
        iCalUID: uniqueId,
        singleEvents: true,
      });
      if (listRes.data.items && listRes.data.items.length > 0) {
        // If found, update the existing event.
        const existingEvent = listRes.data.items[0];
        // Prepare resource for update (do not include an id property)
        const updateResource = { ...event };
        console.log("Event found with iCalUID", uniqueId, "- updating it.");
        const updateRes = await calendar.events.update({
          calendarId: "primary",
          eventId: existingEvent.id,
          resource: updateResource,
          sendUpdates: "all",
        });
        console.log("Updated Google Calendar event:", updateRes.data);
        return updateRes.data;
      }
    }
    
    // Otherwise, insert a new event (do not include custom 'id' on insert).
    const insertRes = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      sendUpdates: "all",
    });
    console.log("Created Google Calendar event:", insertRes.data);
    return insertRes.data;
  } catch (error) {
    console.error("Error creating/updating Google Calendar event:", error.message);
    throw error;
  }
};

module.exports = { addEventToCalendar, getCalendarClient };
