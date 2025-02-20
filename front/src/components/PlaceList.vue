<template>
Places
{{ places }}
</template>

<script setup lang="ts">

import { ElForm } from 'element-plus';
import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';
import router from '../router';

const isLoaded = ref(false);
const places = reactive([] as Array<IPlace>);

onBeforeMount(async () => {
  const { data } = await store.getData('places');
  if (data) {
    places.push(...data.sort((a: IPlace, b: IPlace) => b.id - a.id));
  }

  isLoaded.value = true;
});

</script>
