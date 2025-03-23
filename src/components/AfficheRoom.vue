<template>    
        <div class="m-5">
            <Card>
                 <template #content>
                    <div class="grid">
                        <div class="col-12 text-center"><i class="pi pi-home"></i>  Room: {{ room }}</div>
                        <div class="col-12 text-center"><i class="pi pi-user"></i> Username: {{ username }}</div>
                    </div>
                </template>
            </Card>
        </div>
</template>

<script setup lang="ts">

defineProps<{
  room: string;
  username: string;
}>();


</script>
