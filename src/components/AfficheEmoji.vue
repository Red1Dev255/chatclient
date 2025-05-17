
<template>
        <Button 
        @click="toggle" 
        icon="pi pi-face-smile"
        v-tooltip.bottom="'Emojis'"
        variant="outlined"
        class="border-none p-3"
        />
        <Popover ref="op">
          <div>
              <EmojiPicker  theme="auto" :native="true" @select="onSelectEmoji" />
          </div>
        </Popover>
</template>

<script setup lang="ts">
import { ref } from "vue";


const message = defineModel<string>();
const op = ref();

function onSelectEmoji(emoji:any) {
  message.value += emoji.i;
  }


const toggle = (event :Event) => {
  op.value.toggle(event);
}

</script>
