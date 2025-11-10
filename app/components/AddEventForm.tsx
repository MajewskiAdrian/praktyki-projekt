"use client";
import { useEffect, useState } from "react";

export default function AddEventForm({
  lat,
  lng,
}: {
  lat?: number;
  lng?: number;
}) {
  // Jeden stan — całe formData (wszystkie pola kontrolowane)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    latitude: lat !== undefined ? String(lat) : "",
    longitude: lng !== undefined ? String(lng) : "",
    eventDate: "",
    eventTime: "",
    maxAttendees: "",
  });

  // Synchronizujemy formData z propami lat/lng gdy one się zmienią.
  // Robimy to *tylko* jeśli prop naprawdę się różni od wartości w formData,
  // żeby nie nadpisać tego co użytkownik już zaczął wpisywać.
  useEffect(() => {
    setFormData((prev) => {
      const next = { ...prev };
      const latStr = lat !== undefined ? String(lat) : "";
      const lngStr = lng !== undefined ? String(lng) : "";

      // jeśli różni się od aktualnego -> podmień
      if (latStr !== prev.latitude || lngStr !== prev.longitude) {
        next.latitude = latStr;
        next.longitude = lngStr;
        return next;
      }
      return prev;
    });
  }, [lat, lng]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

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

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      console.error("Szerokość/długość muszą być liczbami");
      return;
    }

    const dateTime = new Date(`${eventDate}T${eventTime}`);
    if (Number.isNaN(dateTime.getTime())) {
      console.error("Nieprawidłowa data/godzina");
      return;
    }
    const eventDateIso = dateTime.toISOString();

    const payload = {
      title,
      description,
      latitude: latNum,
      longitude: lngNum,
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

      // Zresetuj formularz, ale zachowaj najnowsze współrzędne (z propów)
      setFormData({
        title: "",
        description: "",
        latitude: lat !== undefined ? String(lat) : "",
        longitude: lng !== undefined ? String(lng) : "",
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
      className="flex flex-col gap-3 bg-gray-300 p-4 rounded-lg text-gray-950 w-[300px] max-w-[90vw]"
      onSubmit={handleSubmit}
    >
      <label htmlFor="title">Tytuł:</label>
      <input
        className="bg-gray-200 p-2 rounded"
        id="title"
        type="text"
        value={formData.title}
        onChange={handleChange}
        name="title"
        required
      />

      <label htmlFor="description">Opis:</label>
      <textarea
        className="bg-gray-200 p-2 rounded"
        id="description"
        value={formData.description}
        onChange={handleChange}
        name="description"
        required
      />

      <div className="grid grid-cols-2 gap-2">
        {/* <div>
          <label htmlFor="latitude">Szerokość geograficzna:</label>
          <input
            className="bg-gray-200 p-2 rounded w-full"
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={handleChange}
            name="latitude"
            required
          />
        </div>

        <div>
          <label htmlFor="longitude">Długość geograficzna:</label>
          <input
            className="bg-gray-200 p-2 rounded w-full"
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={handleChange}
            name="longitude"
            required
          />
        </div> */}

        <div>
          <label htmlFor="eventDate">Data:</label>
          <input
            className="bg-gray-200 p-2 rounded w-full"
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={handleChange}
            name="eventDate"
            required
          />
        </div>

        <div>
          <label htmlFor="eventTime">Godzina:</label>
          <input
            className="bg-gray-200 p-2 rounded w-full"
            id="eventTime"
            type="time"
            value={formData.eventTime}
            onChange={handleChange}
            name="eventTime"
            required
          />
        </div>
      </div>

      <label htmlFor="maxAttendees">Maksymalna liczba uczestników:</label>
      <input
        className="bg-gray-200 p-2 rounded"
        id="maxAttendees"
        type="number"
        min="0"
        value={formData.maxAttendees}
        onChange={handleChange}
        name="maxAttendees"
      />

      <button type="submit" className="bg-blue-600 text-white p-2 rounded">
        Dodaj
      </button>
    </form>
  );
}
