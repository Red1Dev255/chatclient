
<template>
        <Button type="button" 
        @click="toggle" 
        label='😊'
        :disabled="disabled"
        class="bg-transparent p-3"
        />

        <Popover ref="op">
            <div class="p-2">
                 <span v-for="emoji in emojis"
                    :key="emoji"
                    @click="insertEmoji(emoji)"
                    class="p-1 cursor-pointer">
                {{ emoji }}
              </span>   
            </div>
        </Popover>
</template>

<script setup lang="ts">
import { ref } from "vue";
import  Popover  from "primevue/popover";
import  Button  from "primevue/button";
import  InputGroup  from "primevue/inputgroup";
import  InputText  from "primevue/inputtext";
import  InputGroupAddon  from "primevue/inputgroupaddon";

const message = defineModel<string>();
const op = ref();
const showEmojiPicker = ref(false);

defineProps<{ disabled: string }>();

// Fonction pour insérer un emoji dans le message
const insertEmoji = (emoji: string) => {
  message.value += emoji;
};

const toggle = (event: any) => {
    op.value.toggle(event);
}

const emojis = [
  // Emojis de message envoyé
  '📩', '✉️', '📤', '📬', '💌',
  // Émotions
  '😀', '😂', '😍', '😎', '😊', '😢', '😡', '😭', '😱', '😜', '😏', '😒', '😬', '😷', '🤩', '😤', '🥲', '🥺', '🤔', '😴', '🤮', '🥴',

  // Mains (gestes de la main)
  '👋', '🤚', '✋', '🤙', '👍', '👊', '✌️', '👏', '🙌', '🖐️', '🤲', '👐', '🤷', '🤦', '🤞',

  // Pieds et chaussures
  '👣', '🦶', '👠', '👡', '👢', '👞', '🥿', '🧦',

  // Drapeaux
  '🇺🇸', '🇫🇷', '🇵🇸', '🇩🇿', '🇬🇧', '🇮🇹', '🇪🇸', '🇩🇪', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇷🇺', '🇧🇷', '🇲🇽', '🇿🇦', '🇦🇺', '🇦🇷', '🇨🇦', '🇮🇩',

  // Animaux
  '🐶', '🐱', '🐰', '🐻', '🦁', '🐮', '🐨', '🐯', '🐸', '🦄', '🐒',

  // Nature et objets
  '🌳', '🌸', '🌺', '🌈', '🔥', '💥', '✨', '🌙', '⭐', '🌟', '💧', '🍃',

  // Activités et sports
  '⚽', '🏀', '🏈', '🎸', '🎮', '🎨', '🎤', '🎭', '🎬', '🎯',

  // Symboles et gestes
  '🙏', '💪', '👏', '🤝', '🖖', '👑', '💍', '💫', '❤️', '💖',

  // Nourriture et boisson
  '🍎', '🍉', '🍌', '🍔', '🍕', '🍣', '🍩', '🍪', '🍺', '🍻', '🍷',

  // Transport
  '🚗', '🚀', '✈️', '🚂', '🚢', '🚲', '🛵', '🛶',

  // Climat et météo
  '☀️', '🌧️', '⛈️', '🌨️', '🌪️', '🌤️', '🌈', '❄️', '🌊',

  // Autres symboles
  '💡', '🔒', '🔑', '🔔', '⚡', '🔋', '🛠️', '🖥️', '📱', '💻'
];



</script>
