"use client";

import { useState } from "react";
import AttributionSidebar from "@/components/AttributionSidebar";

export default function Footer() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <footer className="py-6">
        <div className="max-w-[960px] mx-auto text-[color:var(--color-text-muted)] text-sm text-center px-6 space-y-2">
          <p>
            &copy; {new Date().getFullYear()} Saan Tayo Next? &#x2022; made by{" "}
            <a
              href="https://gelorosel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              Gelo Rosel
            </a>{" "}
            &#x2022; not affiliated with the DOT
          </p>
          {/* <div className="text-xs space-y-1">
            <p>
              Inspired by{" "}
              <a
                href="https://github.com/bchiang7/time-to-have-more-fun/tree/main"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-styled"
              >
                bchiang7/time-to-have-more-fun
              </a>
            </p>
            <p>
              Font used:{" "}
              <a
                href="https://www.ffonts.net/BARABARA-FINAL.font"
                target="_blank"
                rel="noopener noreferrer"
                className="uppercase text-styled"
              >
                Barabara
              </a>
            </p>
          </div> */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="mt-4 text-xs underline cursor-pointer hover:text-foreground transition-colors"
          >
            View all attributions
          </button>
        </div>
      </footer>
      <AttributionSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}
