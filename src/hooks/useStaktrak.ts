import { useEffect, useState, useRef } from "react";

type StaktrakMessageType =
  | "staktrak-setup"
  | "staktrak-results"
  | "staktrak-selection"
  | "staktrak-popup"
  | "staktrak-page-navigation";

interface StaktrakMessageData {
  type: StaktrakMessageType;
  data?: unknown;
}

interface StaktrakMessageEvent extends MessageEvent {
  data: StaktrakMessageData;
}

type StaktrakCommandType =
  | "staktrak-start"
  | "staktrak-stop"
  | "staktrak-enable-selection"
  | "staktrak-disable-selection";

function sendCommand(
  iframeRef: React.RefObject<HTMLIFrameElement | null>,
  command: StaktrakCommandType
) {
  if (iframeRef?.current && iframeRef.current.contentWindow) {
    iframeRef.current.contentWindow.postMessage({ type: command }, "*");
  }
}

export const useStaktrak = (initialUrl?: string) => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(
    initialUrl || null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isAssertionMode, setIsAssertionMode] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const startRecording = () => {
    sendCommand(iframeRef, "staktrak-start");
    setIsRecording(true);
    setIsAssertionMode(false);
  };

  const stopRecording = () => {
    sendCommand(iframeRef, "staktrak-stop");
    setIsRecording(false);
    setIsAssertionMode(false);
  };

  const enableAssertionMode = () => {
    setIsAssertionMode(true);
    sendCommand(iframeRef, "staktrak-enable-selection");
  };

  const disableAssertionMode = () => {
    setIsAssertionMode(false);
    sendCommand(iframeRef, "staktrak-disable-selection");
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
    };
  }, []);

  return {
    currentUrl,
    isRecording,
    isAssertionMode,
    iframeRef,
    startRecording,
    stopRecording,
    enableAssertionMode,
    disableAssertionMode,
  };
};
