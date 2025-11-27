"use client";
import React, { useState, useEffect } from "react";
import LocationSearch from "../LocationSearch";

type UserDto = {
  id: string;
  name: string;
  email: string;
  trueName: string | null;
  bio: string | null;
  avatarUrl?: string | null; // NEW
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
  // store the original location when entering edit mode so Cancel can restore it
  const [backupLocation, setBackupLocation] = useState<{
    city: string | null;
    latitude: number | null;
    longitude: number | null;
  } | null>(null);
  // a candidate selection while editing (shows confirmation before apply)
  const [editingCandidate, setEditingCandidate] = useState<{
    city: string;
    latitude: number;
    longitude: number;
  } | null>(null);

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

        console.log("🔍 Raw avatarUrl from API:", user.avatarUrl); // DODAJ TO

        const fullAvatarUrl = user.avatarUrl
          ? (user.avatarUrl.startsWith('/') ? user.avatarUrl : `/${user.avatarUrl}`)
          : null;

        console.log("✅ Final avatarUrl:", fullAvatarUrl); // I TO

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
        body: formData, // BEZ Content-Type - przeglądarka ustawi z boundary
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

      // If location was changed (we keep it on client), send to separate endpoint
      try {
        if (city && typeof latitude === 'number' && typeof longitude === 'number') {
          const locRes = await fetch('/api/users/location', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ city, latitude, longitude }),
          });
          // ignore failure for now but log
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
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">Profile</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Update your public profile information.</p>
      </div>

      {/* Ujednolicone: karta ma max-w-2xl (jak w Account) */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/60 dark:bg-gray-900/40 shadow-sm backdrop-blur p-6 max-w-2xl">
        {loading && <div className="mb-3 text-sm rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">Loading...</div>}
        {error && <div className="mb-3 text-sm rounded-md border border-red-200 bg-red-50 px-3 py-2 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">{error}</div>}
        {ok && <div className="mb-3 text-sm rounded-md border border-green-200 bg-green-50 px-3 py-2 text-green-700 dark:border-green-900/40 dark:bg-green-950/30 dark:text-green-300">Saved.</div>}

        {/* Siatka bez max-w-2xl, bo szerokość ogranicza karta */}
        <div className="grid gap-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Username</span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading || saving}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
              placeholder="your_username"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Allowed: letters, numbers, ., _, - (3–32)</p>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Your name</span>
            <input
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              disabled={loading || saving}
              className="mt-1 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
              placeholder="name"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bio</span>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              disabled={loading || saving}
              className="mt-1 w-full h-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-60"
              placeholder="Few words about you…"
            />
          </label>
          {/* do zrobienia */}

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">City</span>
            <div className="mt-2">
              <div className="mt-2">
                {!cityEditing ? (
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700 dark:text-gray-300">{city || <span className="text-gray-500">Not set</span>}</div>
                    <button
                      type="button"
                      onClick={() => {
                        // keep a backup so user can cancel
                        setBackupLocation({ city, latitude, longitude });
                        // reset candidate (user will choose)
                        setEditingCandidate(null);
                        setCityEditing(true);
                      }}
                      className="text-sm px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Edit
                    </button>
                  </div>
                ) : (
                  <div>
                    <LocationSearch
                      onSelectLocation={(loc) => {
                        // set candidate selection but do not auto-close — show visual confirmation
                        setEditingCandidate({ city: loc.label, latitude: loc.lat, longitude: loc.lng });
                      }}
                    />

                    {/* show selected candidate and actions */}
                    <div className="mt-2">
                      {editingCandidate ? (
                        <div className="flex items-center gap-3">
                          <div className="text-sm text-gray-700 dark:text-gray-300">Selected: {editingCandidate.city}</div>
                          <button
                            type="button"
                            onClick={() => {
                              // apply candidate to main state and close editor
                              setCity(editingCandidate.city);
                              setLatitude(editingCandidate.latitude);
                              setLongitude(editingCandidate.longitude);
                              setCityEditing(false);
                              setBackupLocation(null);
                              setEditingCandidate(null);
                            }}
                            className="px-3 py-1 rounded border bg-amber-600 text-white text-sm hover:bg-amber-700"
                          >
                            Apply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // cancel editing and restore backup
                              setCityEditing(false);
                              if (backupLocation) {
                                setCity(backupLocation.city);
                                setLatitude(backupLocation.latitude);
                                setLongitude(backupLocation.longitude);
                              }
                              setBackupLocation(null);
                              setEditingCandidate(null);
                            }}
                            className="px-3 py-1 rounded border text-sm bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Choose from results to select a location</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</span>
            <div className="mt-2 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 dark:text-gray-400">No image</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={onFileChange}
                  disabled={loading || saving}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onRemoveAvatar}
                    disabled={loading || saving || (!avatarPreview && !initial?.avatarUrl)}
                    className="px-2 py-1 rounded border text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG/JPG max 2MB.</p>
              </div>
            </div>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-800 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </section>
  );
}
