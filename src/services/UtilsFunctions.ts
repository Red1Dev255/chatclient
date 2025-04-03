export const checkoutInterval = () => {
  return import.meta.env.CHECKOUT_INTERVAL || 5000;
}


export const checkIfServerDown =(lastCheckoutServer : number) => {
  return (Date.now() - lastCheckoutServer) > checkoutInterval();
}