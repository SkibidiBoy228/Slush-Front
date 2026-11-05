import { useSignalR } from "../context/SignalRContext";

export function useFriendPresence() {
  const {
    friendPresenceEvents,
    clearFriendPresenceEvent,
    isConnected,
  } = useSignalR();

  return {
    events: friendPresenceEvents,
    clearEvent: clearFriendPresenceEvent,
    isConnected,
  };
}