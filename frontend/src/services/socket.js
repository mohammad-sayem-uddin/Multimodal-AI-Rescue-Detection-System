const WS_URL = "ws://localhost:8000/ws/detect";

export function connectToMonitor(onMessage) {
  let socket;
  let reconnectTimer = null;
  let reconnectAttempts = 0;
  let isClosedManually = false;

  const clearReconnectTimer = () => {
    if (reconnectTimer !== null) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const scheduleReconnect = () => {
    if (isClosedManually) {
      return;
    }

    clearReconnectTimer();
    reconnectAttempts += 1;
    const delay = Math.min(5000, 800 * reconnectAttempts);

    onMessage({
      type: "status",
      status: "reconnecting",
      message: `Reconnecting to detection stream in ${Math.ceil(delay / 1000)}s.`,
    });

    reconnectTimer = window.setTimeout(() => {
      connect();
    }, delay);
  };

  const connect = () => {
    socket = new WebSocket(WS_URL);

    socket.onopen = () => {
      reconnectAttempts = 0;
      onMessage({
        type: "connection",
        message: "Connected to detection stream.",
      });
    };

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        onMessage(parsed);
      } catch {
        onMessage({ type: "raw", message: event.data });
      }
    };

    socket.onerror = () => {
      onMessage({
        type: "error",
        message: "Unable to connect to detection stream.",
      });
    };

    socket.onclose = () => {
      if (isClosedManually) {
        return;
      }

      onMessage({
        type: "status",
        status: "offline",
        message: "Detection stream disconnected.",
      });
      scheduleReconnect();
    };
  };

  connect();

  return {
    close() {
      isClosedManually = true;
      clearReconnectTimer();
      socket?.close();
    },
  };
}
