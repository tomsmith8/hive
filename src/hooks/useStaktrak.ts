import { useEffect, useState } from "react";

interface StaktrakMessageData {
  type:
    | "staktrak-setup"
    | "staktrak-results"
    | "staktrak-selection"
    | "staktrak-popup"
    | "staktrak-page-navigation";
  data?: unknown;
}

interface StaktrakMessageEvent extends MessageEvent {
  data: StaktrakMessageData;
}

export const useStaktrak = (initialUrl?: string) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(
    initialUrl || null
  );

  const clearSelectedTextDisplay = () => {
    // TODO: Implement text selection clearing logic
    console.log("Clearing selected text display");
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // console.log("****** message received:", event.data);
      if (event.data && event.data.type) {
        const staktrakEvent = event as StaktrakMessageEvent;

        switch (staktrakEvent.data.type) {
          case "staktrak-setup":
            // TODO: Handle staktrak setup
            console.log("Staktrak setup:", staktrakEvent.data.data);
            break;
          case "staktrak-results":
            // TODO: Handle staktrak results
            console.log("Staktrak results:", staktrakEvent.data.data);
            break;
          case "staktrak-selection":
            // TODO: Handle staktrak selection
            console.log("Staktrak selection:", staktrakEvent.data.data);
            break;
          case "staktrak-popup":
            // TODO: Handle staktrak popup
            console.log("Staktrak popup:", staktrakEvent.data.data);
            break;
          case "staktrak-page-navigation":
            console.log("Staktrak page navigation:", staktrakEvent.data.data);
            const newUrl = staktrakEvent.data.data as string;
            if (newUrl) {
              setCurrentUrl(newUrl);
            }
            break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      clearSelectedTextDisplay();
    };
  }, []);

  return {
    currentUrl,
    clearSelectedTextDisplay,
  };
};
