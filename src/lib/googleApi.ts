import { getAccessToken } from "./auth";

export async function createGoogleCalendarEvent(title: string, dateStr: string, timeStr?: string, description?: string) {
  const token = await getAccessToken();
  if (!token) return;

  // Assume dateStr is yyyy-mm-dd
  let startDateTime = `${dateStr}T09:00:00-03:00`;
  let endDateTime = `${dateStr}T10:00:00-03:00`;

  if (timeStr) {
    const parts = timeStr.split(":");
    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);
    m += 30;
    if (m >= 60) {
      m -= 60;
      h += 1;
    }
    const endH = String(h).padStart(2, "0");
    const endM = String(m).padStart(2, "0");

    startDateTime = `${dateStr}T${timeStr}:00-03:00`;
    endDateTime = `${dateStr}T${endH}:${endM}:00-03:00`;
  }

  const event = {
    summary: title,
    description: description || "",
    start: {
      dateTime: startDateTime,
      timeZone: "America/Sao_Paulo"
    },
    end: {
      dateTime: endDateTime, // we could also calculate end time + 30 mins
      timeZone: "America/Sao_Paulo"
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "popup", minutes: 10 }
      ]
    }
  };

  try {
    const res = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(event)
    });

    if (!res.ok) {
      console.error("Failed to create Google Calendar event", await res.text());
    }
  } catch (error) {
    console.error("Error creating Google Calendar event", error);
  }
}

export async function createGoogleTask(title: string, notes?: string, dateStr?: string) {
  const token = await getAccessToken();
  if (!token) return;

  // Find default tasklist
  let tasklistId = "@default";
  
  const task: any = {
    title,
    notes: notes || "",
  };

  if (dateStr) {
    task.due = `${dateStr}T00:00:00.000Z`;
  }

  try {
    const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${tasklistId}/tasks`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(task)
    });

    if (!res.ok) {
      console.error("Failed to create Google Task", await res.text());
    }
  } catch (error) {
    console.error("Error creating Google Task", error);
  }
}
