<template>
<Toast />
<ConfirmDialog></ConfirmDialog>
  <div class="m-5">
    <Card>
      <template #content>
        <div class="grid">
            <div class="col-12 text-center">
                <InputText
                  v-model="room"
                  :disabled='isConnected'
                  placeholder = "Room"
                  class="p-3 border-round-sm font-bold col-12 lg:col-6 sm:col-12 md:col-12"
                />
            </div>
            <div class="col-12 text-center">
                  <InputText
                    v-model="username"
                    :disabled='isConnected'
                    placeholder="Username"
                    class=" p-3 border-round-sm font-bold col-12 lg:col-6 sm:col-12 md:col-12"
                  />
            </div>
          </div>

           <div class="grid">
                <div class="col-12 text-center">
                  <Button
                    @click="connexion"
                    icon="pi pi-user"
                    iconPos="left"
                    label="Rejoindre"
                    class="p-3 border-round-sm font-bold col-3 col-12 lg:col-6 sm:col-12 md:col-12"
                    :disabled='isConnected'
                    :class="{ 'text-gray-500 surface-500': isConnected }"
                  />
                </div>
           </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { defineEmits } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";


const confirm = useConfirm();
const toast = useToast();
const room = ref('');
const username = ref('');

const props = defineProps<{ isConnected: boolean }>();

const connexion = () => {
  if (room.value && username.value) {
     confirm1();
  } else {
    toast.add({ severity: 'error', summary: 'Username/Room vides', detail: 'Veuillez saisir votre username/room', life: 3000 });
  }
};


const emit = defineEmits(['joinRoomEmit']);

const confirm1 = () => {
    confirm.require({
        message: 'Username  :  ' + username.value + '  ||  Room :  ' + room.value,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Annuler',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: 'Confirmer',
            severity: 'success'
        },
        accept: () => {  
          confirm.close();
          toast.add({ severity: 'info', summary: 'Connecté', detail: 'Vous êtes connecté(e)', life: 3000 });
          emit('joinRoomEmit', { username: username.value, room: room.value });  
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Annulé', detail: 'Connexion annulée', life: 3000 });
        }
    });
};
</script>

