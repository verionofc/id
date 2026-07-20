"use client";

import { Tooltip } from "@heroui/react";
import { useEffect, useState } from "react";

import { getApiVersion } from "@/lib/api/version";

type Status = "online" | "development" | "warning" | "error";

export function ApiStatus() {
  const [status, setStatus] = useState<Status>("warning");

  const [api, setApi] = useState({
    name: "Loading...",
    version: "-",
    environment: "-",
    production: false,
  });

  useEffect(() => {
    getApiVersion().then((result) => {
      if (result.status === "online") {
        if (result.environment === "development") {
          setStatus("development");
        } else if (result.environment === "production") {
          setStatus("online");
        } else {
          setStatus("error");
        }

        setApi({
          name: result.name,
          version: result.version,
          environment: result.environment,
          production: result.production,
        });
      } else {
        setStatus("error");
      }
    });
  }, []);

  const dot =
    status === "online"
      ? "bg-emerald-400"
      : status === "development"
        ? "bg-purple-400"
        : status === "warning"
        ? "bg-amber-400"
        : "bg-red-400";

  const statusText =
    status === "online"
      ? "Online"
      : status === "development"
        ? "Online"
        : status === "warning"
        ? "Checking"
        : "Offline";

  return (
    <Tooltip delay={250} closeDelay={120}>
      <Tooltip.Trigger>
        <button
          type="button"
          aria-label="API Status"
          className="inline-flex cursor-help items-center justify-center rounded-full p-1"
        >
          <span className={`relative inline-flex size-2.5 rounded-full ${dot}`}>
            <span
              className={`absolute inset-0 animate-ping rounded-full ${dot} opacity-70`}
            />
          </span>
        </button>
      </Tooltip.Trigger>

      <Tooltip.Content
        showArrow
        placement="top"
        offset={12}
        className="
          w-56
          rounded-xl
          border
          border-border
          bg-background
          p-3
          shadow-lg
        "
      >
        <Tooltip.Arrow className="fill-background" />

        <div className="space-y-3">
          <div className="border-b border-border pb-2">
            <h3 className="text-sm font-semibold">{api.name}</h3>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-foreground/55">Version</span>

              <span className="font-medium">{api.version}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground/55">Environment</span>

              <span
                className={
                  api.production === true
                    ? "font-medium text-green-400"
                    : "font-medium text-purple-400"
                }
              >
                {api.environment}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-foreground/55">Status</span>

              <span
                className={
                  status === "online"
                    ? "font-medium text-green-400"
                    : status === "development"
                      ? "font-medium text-green-400"
                      : status === "warning"
                        ? "font-medium text-warning"
                        : "font-medium text-danger"
                }
              >
                {statusText}
              </span>
            </div>
          </div>
        </div>
      </Tooltip.Content>
    </Tooltip>
  );
}
