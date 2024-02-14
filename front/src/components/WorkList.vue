<template>
  <MainTitle :title="store.loc('works')" :callback="() => $router.push('/work/')"></MainTitle>

  <el-row type="flex" justify="center">

    <el-input :placeholder="store.loc('filtertitles')" v-model="filterString" style="max-width: 280px;" clearable>
    </el-input>

  </el-row>

  <el-row v-for="(value, key) in filtered()" :key="key">
    <router-link :to="'/work/' + value.id" style="text-decoration: none;">
      <span v-for="(id, index) in value.authors" :key="index" style="color: black">
        <span v-if="index">,</span> {{ data.persons[id] ? data.persons[id]["firstname"] + ' ' +
          data.persons[id]["lastname"] : '' }}
      </span>.
      <span style="font-weight: bold;">{{ value.title }}</span>
      <span style="color:gray;padding-left: 5px;">{{ data.genres[String(value.genre)]?.title }}</span>
    </router-link>
  </el-row>
</template>

<script setup lang="ts">

import { reactive, ref, onBeforeMount } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';

const data = reactive({ works: [] as Array<IWork>, persons: [] as Array<IPerson>, genres: [] as keyable });
const filterString = ref('');

onBeforeMount(async () => {
  await store.getDataMulti(data, { persons: 'id', genres: 'id' }, { works: 'id' });
});

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  return filterString.value ? data.works.filter((x: IWork) => x.title.search(re) !== -1) : data.works;
};

</script>
