"use client";
import React, { useState, useEffect } from "react";
import LocationSearch from "../LocationSearch";
import { setLocation } from '@/lib/locationStore';

type UserDto = {
  id: string;
  name: string;
  email: string;
  trueName: string | null;
  bio: string | null;
  avatarUrl?: string | null;
  city?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

export default function ProfileForm() {
  const [username, setUsername] = useState("");
  const [realName, setRealName] = useState("");
  const [bio, setBio] = useState("");

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const [city, setCity] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [cityEditing, setCityEditing] = useState(false);
  const [backupLocation, setBackupLocation] = useState<{
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null>(null);
  const [searchKey, setSearchKey] = useState<number | null>(null);

  const [initial, setInitial] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/users/profile", { cache: "no-store", credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Error loading profile");
        const user: UserDto = json.user;
        if (!active) return;

        const fullAvatarUrl = user.avatarUrl
          ? (user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`)
          : null;

        setInitial({ ...user, avatarUrl: fullAvatarUrl });
        setUsername(user.name || "");
        setRealName(user.trueName || "");
        setBio(user.bio || "");
        setAvatarPreview(fullAvatarUrl);
        setCity(user.city || null);
        setLatitude(typeof user.latitude === 'number' ? user.latitude : null);
        setLongitude(typeof user.longitude === 'number' ? user.longitude : null);
      } catch (e: any) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setRemoveAvatar(false);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
  };

  const onSave = async () => {
    setSaving(true);
    setError(null);
    setOk(false);
    try {
      const formData = new FormData();
      formData.append("name", username);
      formData.append("trueName", realName || "");
      formData.append("bio", bio || "");

      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }
      if (removeAvatar) {
        formData.append("removeAvatar", "true");
      }

      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        credentials: "include",
        body: formData,
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.error || "Failed to save profile");
      const updated = json.user;

      const fullAvatarUrl = updated.avatarUrl
        ? (updated.avatarUrl.startsWith('/') ? updated.avatarUrl : `/${updated.avatarUrl}`)
        : null;

      setInitial({ ...updated, avatarUrl: fullAvatarUrl });
      setUsername(updated.name || "");
      setRealName(updated.trueName || "");
      setBio(updated.bio || "");
      setAvatarPreview(fullAvatarUrl);
      setAvatarFile(null);
      setRemoveAvatar(false);

      try {
        if (city && typeof latitude === 'number' && typeof longitude === 'number') {
          const locRes = await fetch('/api/users/location', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, latitude, longitude }),
          });
          if (!locRes.ok) {
            const errJson = await locRes.json().catch(() => ({}));
            console.error('Failed to save location', errJson);
          }
        }
      } catch (err) {
        console.error('Location save error', err);
      }
      setOk(true);
      setTimeout(() => setOk(false), 2000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onCancel = () => {
    if (!initial) return;
    setUsername(initial.name || "");
    setRealName(initial.trueName || "");
    setBio(initial.bio || "");
    setAvatarPreview(initial.avatarUrl || null);
    setCity(initial.city || null);
    setLatitude(typeof initial.latitude === 'number' ? initial.latitude : null);
    setLongitude(typeof initial.longitude === 'number' ? initial.longitude : null);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setError(null);
    setOk(false);
  };

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Update your public profile information
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm">Loading...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-900/40">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error}</span>
        </div>
      )}

      {ok && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-900/40">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">Profile saved successfully!</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Avatar
          </label>
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center border-4 border-white dark:border-gray-800 shadow-lg">
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar preview" className="h-full w-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={onFileChange}
                disabled={loading || saving}
                className="block w-full text-sm text-gray-600 dark:text-gray-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-medium
                  file:bg-amber-50 file:text-amber-700
                  hover:file:bg-amber-100
                  dark:file:bg-amber-900/20 dark:file:text-amber-400
                  dark:hover:file:bg-amber-900/30
                  disabled:opacity-50"
              />
              <button
                type="button"
                onClick={onRemoveAvatar}
                disabled={loading || saving || (!avatarPreview && !initial?.avatarUrl)}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
              >
                Remove avatar
              </button>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG up to 2MB
              </p>
            </div>
          </div>
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading || saving}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
            placeholder="your_username"
          />
          <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
            Letters, numbers, dots, underscores, hyphens (3-32 characters)
          </p>
        </div>

        {/* Real Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your name
          </label>
          <input
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            disabled={loading || saving}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
            placeholder="John Doe"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            disabled={loading || saving}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60 resize-none"
            placeholder="Tell us about yourself..."
          />
        </div>

        {/* City */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            City
          </label>
          {!cityEditing ? (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">
                {city || <span className="text-gray-500">Not set</span>}
              </span>
              <button
                type="button"
                onClick={() => {
                  setBackupLocation({ city, latitude, longitude });
                  setSearchKey(Date.now());
                  setCityEditing(true);
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <LocationSearch
                key={searchKey ?? undefined}
                initialQuery={city || ''}
                onSelectLocation={(loc) => {
                  setCity(loc.label);
                  setLatitude(loc.lat);
                  setLongitude(loc.lng);
                  try {
                    setLocation({ lat: loc.lat, lng: loc.lng });
                  } catch (err) { }
                  setCityEditing(false);
                  setBackupLocation(null);
                  setSearchKey(null);
                }}
              />
              <button
                type="button"
                onClick={() => {
                  setCityEditing(false);
                  setSearchKey(null);
                  if (backupLocation) {
                    setCity(backupLocation.city);
                    setLatitude(backupLocation.latitude);
                    setLongitude(backupLocation.longitude);
                  }
                  setBackupLocation(null);
                }}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving || loading}
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-60 font-medium"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={saving || loading}
          className="px-6 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60 font-medium flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </div>
    </section>
  );
}
