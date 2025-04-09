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
                  @keydown.enter="connexion"
                  maxlength="20"
                  v-tooltip.focus.top="'Room (max 20 characters)'"
                  class="p-3 border-round-sm font-bold col-12 lg:col-6 sm:col-12 md:col-12"
                />
               
            </div>
            <div class="col-12 text-center">
                  <InputText
                    v-model="username"
                    :disabled='isConnected'
                    placeholder="Username"
                    v-tooltip.focus.top="'username (max 20 characters)'"
                    maxlength="20"
                    @keydown.enter="connexion"
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
                    label="Join"
                    class="p-3 text-black-alpha-90 border-round-sm font-bold col-3 col-12 lg:col-6 sm:col-12 md:col-12"
                    :disabled='isConnected'
                    :class="{ 'text-gray-500 surface-500': isConnected, 
                    'p-button-click' : !isConnected 
                    }"
                  />
                </div>
           </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { defineEmits } from 'vue';
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";


const confirm = useConfirm();
const toast = useToast();
const room = ref('');
const username = ref('');

defineProps<{ isConnected: boolean }>();

const connexion = () => {
  if (room.value && username.value) {

    if(room.value.length > 20 || username.value.length > 20) {
      toast.add({ severity: 'error', summary: 'Too long', detail: 'Username/Room too long (max 20 characters)', life: 3000 });
    } else {
      confirm1();
    }

  } else {
    toast.add({ severity: 'error', summary: 'Empty Username/Room', detail: 'Please enter your username/room', life: 3000 });}
};


const emit = defineEmits(['joinRoomEmit']);

const confirm1 = () => {
    confirm.require({
        message: 'Username  :  ' + username.value + '  ||  Room :  ' + room.value,
        header: 'Confirmation',
        icon: 'pi pi-exclamation-circle',
        rejectProps: {
            label: 'Cancel',
            severity: 'danger',
            outlined: true
        },
        acceptProps: {
            label: 'Connect',
            severity: 'success'
        },
        accept: () => {  
          confirm.close();
          emit('joinRoomEmit', { username: username.value, room: room.value });  
        },
        reject: () => {
            toast.add({ severity: 'error', summary: 'Cancelled', detail: 'Connection cancelled', life: 3000 });
        }
    });
};
</script>

