"use client";
import { useState } from "react";

export default function AddEventForm() {
  // Keep a stable shape so inputs stay controlled for component lifetime
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    latitude: "",
    longitude: "",
    eventDate: "",
    eventTime: "", // <- added to keep input controlled
    maxAttendees: "",
  });

  function handleChange(e : any) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e : any) {
    e.preventDefault();

    // client-side validation and type normalization
    const {
      title,
      description,
      latitude,
      longitude,
      eventDate,
      eventTime,
      maxAttendees,
    } = formData;
    if (!title || !description || !latitude || !longitude || !eventDate || !eventTime) {
      console.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      console.error("Szerokość/długość muszą być liczbami");
      return;
    }

    // build ISO date-time safely (treat input as local date+time)
    const dateTime = new Date(`${eventDate}T${eventTime}`);
    if (Number.isNaN(dateTime.getTime())) {
      console.error("Nieprawidłowa data/godzina");
      return;
    }
    const eventDateIso = dateTime.toISOString();

    const payload = {
      title,
      description,
      latitude: lat,
      longitude: lng,
      eventDate: eventDateIso,
      maxAttendees: maxAttendees ? parseInt(maxAttendees, 10) : null,
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Błąd przy dodawaniu wydarzenia:", body?.error || res.statusText);
        return;
      }

      console.log("Nowy event zapisany:", body);

      // Reset while preserving the same keys (keep controlled inputs)
      setFormData({
        title: "",
        description: "",
        latitude: "",
        longitude: "",
        eventDate: "",
        eventTime: "",
        maxAttendees: "",
      });
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form
      className="flex flex-col gap-3 bg-gray-300 p-4 rounded-lg text-gray-950"
      onSubmit={handleSubmit}
    >
      <label htmlFor="title">Tytuł:</label>
      <input
        className="bg-gray-200"
        id="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        name="title"
        required
      />

      <label htmlFor="description">Opis:</label>
      <textarea
        className="bg-gray-200"
        id="description"
        value={formData.description}
        onChange={handleChange}
        name="description"
        required
      />

      <div className="grid-cols-4 grid gap-2 grid-rows-2">
        <label htmlFor="latitude">Szerokość geograficzna:</label>
        <input
          className="bg-gray-200"
          id="latitude"
          type="number"
          step="any"
          value={formData.latitude}
          onChange={handleChange}
          name="latitude"
          required
        />

        <label htmlFor="longitude">Długość geograficzna:</label>
        <input
          className="bg-gray-200"
          id="longitude"
          type="number"
          step="any"
          value={formData.longitude}
          onChange={handleChange}
          name="longitude"
          required
        />

        <label htmlFor="eventDate">Data:</label>
        <input
          className="bg-gray-200"
          id="eventDate"
          type="date"
          value={formData.eventDate}
          onChange={handleChange}
          name="eventDate"
          required
        />

        <label htmlFor="eventTime">Godzina:</label>
        <input
          className="bg-gray-200"
          id="eventTime"
          type="time"
          value={formData.eventTime}
          onChange={handleChange}
          name="eventTime"
          required
        />
      </div>

      <label htmlFor="maxAttendees">Maksymalna liczba uczestników:</label>
      <input
        className="bg-gray-200"
        id="maxAttendees"
        type="number"
        min="0"
        value={formData.maxAttendees}
        onChange={handleChange}
        name="maxAttendees"
      />

      <button type="submit" className="bg-gray-200">
        Dodaj
      </button>
    </form>
  );
}
