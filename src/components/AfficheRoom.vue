<template>    
        <div class="mt-2">
            <Card>
                 <template #content>
                    <div class="grid">
                        <div class="col-12 text-center"><i class="pi pi-home"></i>  Room: {{ room }}</div>
                        <div class="col-12 text-center"><i class="pi pi-user"></i> Username: {{ username }}</div>
                        <div class="col-12 text-center">
                        <i class="pi pi-home"></i> Connected Users: 
                            <Select placeholder="connected user" :options="connectedUser">
                                <template #empty>
                                   No connected user
                                </template>
                            </Select>
                        </div>
                    </div>
                </template>
            </Card>
        </div>
</template>

<script setup lang="ts">

defineProps<{
  room: string;
  username: string;
  connectedUser :string[];
}>();

const test = ['test1', 'test2', 'test3'];

</script>
