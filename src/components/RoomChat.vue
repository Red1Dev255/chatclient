<template>
  <ConfirmDialog></ConfirmDialog>
  <Toast />
  <AfficheRoom v-model:roomStatus="piniaStore.status" :userCount="userCount" :room="piniaStore.room" :username="piniaStore.username" />
  <div class="mt-2">
    <Card>
      <template #title>
        <div class="grid">
         <i class="col-9 inline-block p-4 pi pi-comments"><b class="ml-2">MESSAGES</b></i>
         <span class="text-right col-3">
           <Button icon="pi pi-sign-out" style="font-size: 1rem" v-tooltip.left="'Disconnect'" rounded variant="outlined"  @click="confirmDisconnect"  />
         </span>
         
        </div>

      </template>

      <template #content>
        <div class="mt-2">
          <InputGroup>
            <InputText
              v-model="message"
              placeholder="Votre message"
              @keydown.enter="sendMessage"
               class="border-none p-3"
            />
            <InputGroupAddon class="border-none">
              <Button
                @click="sendMessage"
                icon="pi pi-send"
                variant="outlined"
                class="border-none p-3"
                v-tooltip.bottom="'Send'"
              />
            </InputGroupAddon>

            <InputGroupAddon class="border-none">
              <AfficheEmoji  v-model="message"/>
            </InputGroupAddon>

          </InputGroup>
        </div>
        <MessageUser/>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import axios from "axios";
import socket from "../services/SocketIO";
import MessageUser from "./MessageUser.vue";
import AfficheRoom from "./AfficheRoom.vue";
import AfficheEmoji from "./AfficheEmoji.vue";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import {
  decryptMessage,
  encryptMessage,
} from "../services/rsaService";
import { useRouter } from "vue-router";
import {getUrlDisconnect} from "../services/UtilsFunctions";

import {ChatStore} from '../stores/chatStore'

import {decryptAES , encryptAES, exportAESKey, exportIV, getDecryptedAesValue} from '../services/AesService'

const piniaStore = ChatStore() 


const confirm = useConfirm();
const toast = useToast();
const router = useRouter();
const message = ref("");
const userCount = computed(() => piniaStore.connectedUsers.length);

interface MessageUser {
  username: string;
  encryptedMessage: string;
  encryptedAesKey?: string; 
  encryptedIV: string;
}

//////////////////////////////////////////////////// send de message

const sendMessage = async () => {


  if (message.value.trim() !== "") {

    let encryptedMessagesRoom = ref<Array<MessageUser>>([]);

      
    for (const userKey of piniaStore.usersPublicKeys) {

      
      if (!piniaStore.aesKey || !piniaStore.iv) {
        toast.add({
          severity: "error",
            summary: "Key Missing",
            detail: "Key or IV is missing(Error in AES key generation)",
            life: 3000,
          });
          return;
        }

        //generer AES key and IV
      const aesKeyString = await exportAESKey(piniaStore.aesKey);
      const ivString = exportIV(piniaStore.iv);

      //encrypt AES key and IV with RSA public key
      const encryptedAesKey = encryptMessage(userKey.publicKey, aesKeyString); 
      const encryptedIV = encryptMessage(userKey.publicKey, ivString);
      
      //encrypt message with AES
      const encrypteAesMessage = await encryptAES(message.value.trim(), piniaStore.aesKey, piniaStore.iv);

      encryptedMessagesRoom.value.push({
        username: userKey.username,
        encryptedAesKey: encryptedAesKey,
        encryptedIV: encryptedIV,
        encryptedMessage: encrypteAesMessage,
      });
    }

    socket.value?.emit("newMessageSend", {
      room: piniaStore.room,
      username: piniaStore.username,
      encryptedMessagesRoom: encryptedMessagesRoom.value,
    });
  }
  message.value = "";
};

//////////////////////////////////////////////////// get public keys


socket.value?.on("newListKey", (data) => {
  const { usersKeys } = data;
  if (Array.isArray(usersKeys)) {
    // usersPublicKeys.value = usersKeys;
    piniaStore.usersPublicKeys = usersKeys;
    const connectedUsers = usersKeys.map((userKey) => userKey.username);
    piniaStore.connectedUsers = connectedUsers;

  } else {
    console.error("Error : userKeys is not an array", usersKeys);
  }
});

//////////////////////////////////////////////////// Receive message

socket.value?.off("newMessage");

socket.value?.on("newMessage", async ({ username, encryptedMessagesRoom }) => {


  for (let coupleMessUser of encryptedMessagesRoom) {   
    if (coupleMessUser.username === piniaStore.username) {

      // Decrypt the AES key and IV using the private RSA key
      const decryptedAesKey = decryptMessage(
        piniaStore.privateKey,
        coupleMessUser.encryptedAesKey
      );

      // Decrypt the AES IV using the private RSA key
      const decryptedIV = decryptMessage(
        piniaStore.privateKey,
        coupleMessUser.encryptedIV
      );


      const receivedAesKey = await getDecryptedAesValue(decryptedAesKey, decryptedIV);

      // Decrypt the message using the decrypted AES key and IV
      const decryptedMessage = await decryptAES(
        coupleMessUser.encryptedMessage,
        await receivedAesKey.cryptoKey,
        receivedAesKey.iv
      );
 
      // Add the message 
      piniaStore.messages.push({
        username: username,
        message: decryptedMessage,
      });
    }
  }

});


/////////////////////////// change new Status room

socket.value?.on("changeRoomStatus", ({status}) => {
  piniaStore.status = status;
});


//////////////////////////////////////////////////// disconnect

const disConnect = () => {

  axios.post(getUrlDisconnect(), {
    username: piniaStore.username,
    room: piniaStore.room,
  })
  .then(function (response) {
    if(response.status === 200){
      piniaStore.resetSession(); // méthode dans le store
      message.value = ""; // si message est une variable réactive locale

      router.push("/closed");
      toast.add({
        severity: "success",
        summary: "Disconnected",
        detail: response.data,
        life: 3000,
      });
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: response.data,
        life: 3000,
      });
    }
   
  })
  .catch(function (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response ? error.response.data : error,
      life: 3000,
    });
  });
};

const confirmDisconnect = () => {
  confirm.require({
    message: "All your data will be lost. Are you sure?",
    header: "Disconnect",
    icon: "pi pi-exclamation-circle",
    rejectProps: {
      label: "Cancel",
      severity: "danger",
      outlined: true,
    },
    acceptProps: {
      label: "Confirm",
      severity: "success",
    },
    accept: () => {
      disConnect();
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Cancelled",
        detail: "Disconnection cancelled",
        life: 3000,
      });
    },
  });
};


window.addEventListener("beforeunload", (event) => {
    event.preventDefault();
});

</script>
