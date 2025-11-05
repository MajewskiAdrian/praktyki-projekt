"use client";
import { useState } from "react";

export default function AddEventForm() {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        latitude: "",
        longitude: "",
        date: "",
        maxAtendants: "",
        creatorId: ""
    });

    // 1. aktualizowanie stanu formularza
    function handleChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    // 2️. wysyłanie do endpointa /api/events metodą POST
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error("Błąd przy dodawaniu wydarzenia");

            const data = await res.json();
            console.log("Nowy event zapisany:", data);

            // Wyczyść formularz po zapisaniu
            setFormData({
                name: "",
                date: "",
                location: "",
                description: "",
            });
        } catch (err) {
            console.error(err);
        }
    }



    return (
        
        <form className="flex flex-col gap-3 bg-gray-400 p-4 rounded-lg text-gray-950" onSubmit={handleSubmit}>
            <label htmlFor="title">Tytuł:</label>
            <input className="bg-gray-300" id="title" type="text" value={formData.title} onChange={handleChange} name="title" />

            <label htmlFor="description">Opis:</label>
            <input className="bg-gray-300" id="description" type="text" value={formData.description} onChange={handleChange} name="description" />

            <label htmlFor="latitude">Szerokość geograficzna:</label>
            <input className="bg-gray-300" id="latitude" type="text" value={formData.latitude} onChange={handleChange} name="latitude" />

            <label htmlFor="longitude">Długość geograficzna:</label>
            <input className="bg-gray-300" id="longitude" type="text" value={formData.longitude} onChange={handleChange} name="longitude" />

            <label htmlFor="date">Data:</label>
            <input className="bg-gray-300" id="date" type="date" value={formData.date} onChange={handleChange} name="date" />

            <label htmlFor="maxAtendants">Maksymalna liczba uczestników:</label>
            <input className="bg-gray-300" id="maxAtendants" type="number" value={formData.maxAtendants} onChange={handleChange} name="maxAtendants" />

            <label htmlFor="creatorId">Id twórcy:</label>
            <input className="bg-gray-300" id="creatorId" type="tex" value={formData.creatorId} onChange={handleChange} name="creatorId" />

            <button type="submit" className="bg-gray-300">Dodaj</button>
        </form>

    );

}