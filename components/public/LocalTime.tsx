"use client";

import { useEffect, useState } from "react";

const utcFormat = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

/** Server renders UTC; the browser swaps in the viewer's own time zone after mount. */
export function LocalTime({ iso }: { iso: string }) {
  const [text, setText] = useState(`${utcFormat.format(new Date(iso))} UTC`);

  useEffect(() => {
    setText(
      new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso)),
    );
  }, [iso]);

  return <time dateTime={iso}>{text}</time>;
}
