import { defineStore } from 'pinia'


interface UserKey {
  username: string;
  publicKey: string;
}

interface MessageUserDecrypted {
  username: string;
  message: string;
}

export const ChatStore = defineStore('counter', {
  // State : les données partagées dans ton store
  state: () => ({
    connectedUsers: Array<string>(),
    privateKey: '',
    username: '',
    room: '',
    usersPublicKeys: Array<UserKey>(),
    messages: Array<MessageUserDecrypted>(),
    status:true,
    aesKey: null as CryptoKey | null,  // Clé AES stockée directement
    iv: null as Uint8Array | null,     // IV stocké tel quel
  }),
  
  // Getters : pour récupérer des informations dérivées
  getters: {
    
  },
  
  // Actions : pour modifier l'état ou effectuer des tâches asynchrones
  actions: {
    resetSession() {
      this.username = "";
      this.room = "";
      this.privateKey = "";
      this.connectedUsers = [];
      this.usersPublicKeys = [];
      this.messages = [];
      this.status = true;
      this.aesKey = null; // Réinitialiser la clé AES
      this.iv = null;    // Réinitialiser l'IV
    }
  },
})
