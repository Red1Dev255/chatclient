
export const getUrl = () => {
  const socketHost = import.meta.env.VITE_SOCKET_HOST;
  const socketPort = import.meta.env.VITE_SOCKET_PORT;
  let socketUrl = `${socketHost}`;  
  if (socketPort) {
    socketUrl = `${socketHost}:${socketPort}`;
  }
  return socketUrl
}

export const getUrlLogin = () => {
  return getUrl() + '/login';
}

export const getUrlDisconnect = () => {
  return getUrl() + '/disconnect';
}