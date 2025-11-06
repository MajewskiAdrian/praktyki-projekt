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
    maxAttendees: "",
    creatorId: "",
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      // Build payload mapping local keys to API expectations
      const payload = {
        title: formData.title,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        eventDate: formData.eventDate + " " + formData.eventTime,
        maxAttendees: formData.maxAttendees,
        creatorId: formData.creatorId,
      };

      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Błąd przy dodawaniu wydarzenia");
      }

      const data = await res.json();
      console.log("Nowy event zapisany:", data);

      // Reset while preserving the same keys (keep controlled inputs)
      setFormData({
        title: "",
        description: "",
        latitude: "",
        longitude: "",
        eventDate: "",
        maxAttendees: "",
        creatorId: "",
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
      />

      <label htmlFor="description">Opis:</label>
      <textarea
        className="bg-gray-200"
        id="description"
        value={formData.description}
        onChange={handleChange}
        name="description"
      />
      <div className="grid-cols-4 grid gap-2 grid-rows-2">
        <label htmlFor="latitude">Szerokość geograficzna:</label>
        <input
          className="bg-gray-200"
          id="latitude"
          type="text"
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
          type="text"
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

      <label htmlFor="creatorId">Id twórcy (uuid):</label>
      <input
        className="bg-gray-200"
        id="creatorId"
        type="text"
        value={formData.creatorId}
        onChange={handleChange}
        name="creatorId"
        required
      />

      <button type="submit" className="bg-gray-200">
        Dodaj
      </button>
    </form>
  );
}
