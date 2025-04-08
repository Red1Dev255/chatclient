
export const getUrl = () => {
  const socketHost = import.meta.env.VITE_SOCKET_HOST;
  const socketPort = import.meta.env.VITE_SOCKET_PORT;
  let socketUrl = `http://${socketHost}`;  
  if (socketPort) {
    socketUrl = `http://${socketHost}:${socketPort}`;
  }
  return socketUrl
}

export const getUrlLogin = () => {
  return getUrl() + '/login';
}

export const getUrlDisconnect = () => {
  return getUrl() + '/disconnect';
}


export const getMessageInformation =()=>{
  return "Please note that refreshing the page will systematically result in the loss of all data. Similarly, any disconnection will also lead to the deletion of your current information. Therefore, it is important not to leave the page or disconnect if you wish to retain your data.";
}