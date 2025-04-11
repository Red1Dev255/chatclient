<template>    
        <div class="mt-2">
            <Panel collapsed toggleable>

            <template #header>
                <div class="text-center">
                    <i class="pi pi-book"><b class="ml-2">ROOM</b></i>
                    
                </div>
            </template>
            <Card >
                 <template #content>
                    <div class="grid">
                        <div class="col-12 text-center"><i class="pi pi-home"></i>  Room: {{ room }}</div>
                        <div class="col-12 text-center"><i class="pi pi-user"></i> Username: {{ username }}</div>
                        <div class="col-12 text-center"><i class="pi pi-headphones"></i> Connected : {{ userCount }}</div>

                    </div>
                </template>
            </Card>
        </Panel>
        </div>
</template>

<script setup lang="ts">

defineProps<{
  room: string;
  username: string;
  userCount: number;
}>();

</script>
