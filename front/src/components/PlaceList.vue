<template>
  <div v-if="isLoaded">
    <MainTitle :title="store.loc('places')" :callback="() => router.push('/place/')"></MainTitle>
    <el-row v-for="(value, key) in places" :gutter="20" :key="key">
      <el-space>
          <el-button :type="value.wikidata ? 'primary' : 'info'" plain
             @click="router.push('/place/' + value.id)">
          {{ value.name }}
          </el-button>
      </el-space>
    </el-row>
  </div>
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
