import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useAppState } from "@/state/app/state";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth, useUpdateCurrentUser } from "@/api/auth/queries";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
];

export default function Settings() {
  const { settings, updateSettings, resetSettings } = useAppState();
  const { setTheme } = useTheme();
  const { user } = useAuth();
  const updateUser = useUpdateCurrentUser();

  // no timezone selection in this layout

  const [form, setForm] = useState({
    theme: settings.theme,
    language: settings.language,
    email: user?.email ?? "",
    profileDisplayName: settings.profileDisplayName ?? user?.name ?? "",
    notificationsInApp: settings.notificationsInApp ?? true,
    notificationsEmail: settings.notificationsEmail ?? false,
    notificationsPush: settings.notificationsPush ?? false,
    notificationsDigest: settings.notificationsDigest ?? "off",
  });
  const handleSaveProfile = async () => {
    try {
      const payload: { name?: string; email?: string } = {};
      if (form.profileDisplayName !== (user?.name ?? ""))
        payload.name = String(form.profileDisplayName || "");
      if (form.email !== (user?.email ?? ""))
        payload.email = String(form.email || "");
      if (Object.keys(payload).length === 0) {
        toast.message("No changes to update");
        return;
      }
      await updateUser.mutateAsync(payload);
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e?.message || "Failed to update profile");
    }
  };

  const handleChange = (
    field: keyof typeof form,
    value: string | boolean | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSettings(form);
    if (form.theme) setTheme(form.theme as "light" | "dark" | "system");
    toast.success("Settings saved");
  };

  const handleReset = () => {
    resetSettings();
    toast.info("Settings reset to defaults");
  };

  return (
    <ErrorBoundary>
      <div className="p-4 md:p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-foreground text-xl md:text-2xl">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your profile, notifications, and app preferences
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-4 md:p-6 space-y-6 shadow-sm">
          <section className="space-y-4">
            <h2 className="text-foreground text-base md:text-lg">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  value={form.profileDisplayName}
                  onChange={(e) =>
                    handleChange("profileDisplayName", e.target.value)
                  }
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                onClick={handleSaveProfile}
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-foreground text-base md:text-lg">
              Preferences
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  value={form.language}
                  onValueChange={(value) => handleChange("language", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((l) => (
                      <SelectItem key={l.value} value={l.value}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-foreground text-base md:text-lg">Appearance</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={form.theme === "light"}
                  onChange={() => handleChange("theme", "light")}
                />
                <span className="text-foreground">Light</span>
              </label>
              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={form.theme === "dark"}
                  onChange={() => handleChange("theme", "dark")}
                />
                <span className="text-foreground">Dark</span>
              </label>
              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="system"
                  checked={form.theme === "system"}
                  onChange={() => handleChange("theme", "system")}
                />
                <span className="text-foreground">System</span>
              </label>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-foreground text-base md:text-lg">
              Notifications
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.notificationsInApp}
                  onChange={(e) =>
                    handleChange("notificationsInApp", e.target.checked)
                  }
                />
                <span className="text-foreground">In-app notifications</span>
              </label>

              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.notificationsEmail}
                  onChange={(e) =>
                    handleChange("notificationsEmail", e.target.checked)
                  }
                />
                <span className="text-foreground">Email notifications</span>
              </label>

              <label className="flex items-center gap-3 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={form.notificationsPush}
                  onChange={(e) =>
                    handleChange("notificationsPush", e.target.checked)
                  }
                />
                <span className="text-foreground">Push notifications</span>
              </label>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h2 className="text-foreground text-base md:text-lg">
              Email Digest
            </h2>
            <p className="text-muted-foreground text-sm">
              Get a summary of activity delivered on a schedule.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="digest">Digest Frequency</Label>
                <Select
                  value={form.notificationsDigest}
                  onValueChange={(value) =>
                    handleChange("notificationsDigest", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="off">Off</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={handleReset}>
              Reset
            </Button>
            <Button type="button" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
