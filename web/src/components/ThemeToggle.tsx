import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      className="pill text-bright"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {mounted ? (
        <>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
          <span className="hidden text-xs uppercase tracking-wide sm:inline">
            {isDark ? "Light" : "Dark"}
          </span>
        </>
      ) : (
        <span className="text-xs uppercase tracking-wide">Theme</span>
      )}
    </button>
  );
}
