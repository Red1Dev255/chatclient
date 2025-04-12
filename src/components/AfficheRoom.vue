<template>    
        <div class="mt-2">
            <Panel collapsed toggleable>

            <template #header>
                <div class="text-center">
                    <i class="pi pi-book"><b class="ml-2">ROOM</b></i>
                    <Button :icon="roomStatus ? 'pi pi-unlock' : 'pi pi-lock'" 
                             v-tooltip.top="roomStatus ? 'Close the room' : 'Open the room'"
                             rounded variant="outlined" 
                             class="border-none"  
                             :class="roomStatus ? 'text-green-500' : 'text-red-500'"
                             @click="closeOpenRoom"  />
                </div>
            </template>
            <Card >
                 <template #content>
                  <div class="text-center">
                        <div class="m-2"><i class="pi pi-home"></i> 
                             Room: {{ room }} 
                        </div>
                        <div class="m-2">
                          <i class="pi pi-user"></i> Username: {{ username }}
                        </div>
                        <div class="m-2">
                          <i class="pi pi-headphones"></i> Connected : {{ userCount }}
                        </div>
                    </div>                   
                </template>
            </Card>
        </Panel>
        </div>
</template>

<script setup lang="ts">

import { useToast } from "primevue/usetoast";
import {getUrlCloseRoom} from "../services/UtilsFunctions";
import axios from "axios";
const toast = useToast();

const props = defineProps<{
  room: string;
  username: string;
  userCount: number;
}>();

const roomStatus = defineModel("roomStatus", {
  type: Boolean,
  default: true,
});

const closeOpenRoom = ()=>{
    axios.post(getUrlCloseRoom() , {
    username: props.username,
    room: props.room
  })
  .then(function (response) {

    if(response.status === 200){
      roomStatus.value = response.data.status;
      toast.add({
        severity: response.data.status ===true ? "success" : "error",
        summary: response.data.status === true ? "Room Opened" : "Room Closed",
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

  }).catch(function (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: error.response ? error.response.data : error,
      life: 3000,
    });
  });
}




</script>
