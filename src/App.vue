<template>
  <div id="app">
    <HomePage />
    <RouterView />
  </div> 
  <div>

    <footer>
        <div class="text-right mr-4">
            <p>&copy; 2025 Online-Chat. All rights reserved</p>
        </div>
    </footer>

  </div>

  
</template>

<script setup lang="ts">
import HomePage from './components/HomePage.vue';
</script>
