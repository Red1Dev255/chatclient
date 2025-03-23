<template>
<Toast />
<ConfirmDialog></ConfirmDialog>
  <div class="m-5">
    <Card>
      <template #content>
        <div class="grid">
          <div class="col-12 text-center ">
            <InputText
              v-model="room"
              placeholder="room"
              class="p-3 border-round-sm font-bold col-6"
            />
          </div>
          <div class="col-12 text-center">
            <InputText
              v-model="username"
              placeholder="username"
              class=" p-3 border-round-sm font-bold col-6"
            />
          </div>
          <div class="col-12 text-center">
            <Button
              @click="connexion"
              icon="pi pi-user"
              iconPos="left"
              label="Rejoindre"
              class="p-3 border-round-sm font-bold col-3"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Card from 'primevue/card';
import { ref } from 'vue';
import { defineEmits } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from 'primevue/confirmdialog';
import Toast from 'primevue/toast';


const confirm = useConfirm();
const toast = useToast();
const room = ref('');
const username = ref('');


const connexion = () => {
  if (room.value && username.value) {
     confirm1();
  } else {
    toast.add({ severity: 'error', summary: 'error', detail: 'Champs vides', life: 3000 });
  }
};

const emit = defineEmits(['joinRoomEmit']);

const confirm1 = () => {
    confirm.require({
        message: 'Username  :  ' + username.value + '  ||  Room :  ' + room.value,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
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
