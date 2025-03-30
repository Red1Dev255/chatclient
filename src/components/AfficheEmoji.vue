
<template>
        <Button type="button" 
        @click="toggle" 
        label='😊'
        :disabled="disabled"
        v-tooltip.bottom="'Emojis'"
        class="bg-transparent border-none p-3"
        :class="{'p-button-click' : isConnected}"
        />
        <Popover ref="op">
          <div>
              <EmojiPicker  theme="auto" :native="true" @select="onSelectEmoji" />
          </div>
        </Popover>
</template>

<script setup lang="ts">
import { ref } from "vue";
import EmojiPicker from 'vue3-emoji-picker';
import 'vue3-emoji-picker/css'


const message = defineModel<string>();
const op = ref();

function onSelectEmoji(emoji:any) {
  message.value += emoji.i;
  }


const toggle = (event :Event) => {
  op.value.toggle(event);
}

defineProps<{ disabled: boolean, isConnected : boolean}>();

</script>
