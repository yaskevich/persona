<template>
  <MainTitle :title="store.loc('works')" :callback="() => $router.push('/work/')"></MainTitle>
  <div v-show="isLoaded">

    <el-row type="flex" justify="center">

      <el-input :placeholder="store.loc('filtertitles')" v-model="filterString" style="max-width: 280px;" clearable>
      </el-input>

    </el-row>

    <el-row v-for="(value, key) in filtered()" :key="key">

      <el-space :wrap="true">
        <el-tag disable-transitions v-for="(id, index) in value.authors" type="warning" size="large" :key="index">
          {{ store.getLabel(data.persons?.[id]) }}
        </el-tag>
        <el-button type="primary" plain @click="$router.push('/work/' + value.id)">
          {{ value.title }}
        </el-button>
        <el-tag disable-transitions v-if="value?.genre" type="info" size="large">{{
    data.genres[String(value.genre)]?.title }}</el-tag>
      </el-space>

    </el-row>

    <el-row type="flex" justify="center">
      <el-pagination layout="prev, pager, next" :total="data.works.length" hide-on-single-page background
        @update:current-page="updatePage" />
    </el-row>
  </div>
</template>

<script setup lang="ts">

import { reactive, ref, onBeforeMount } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';

const itemsPerPage = 20;
const pageRange = ref([0, itemsPerPage]);
const updatePage = (page: number) => {
  // console.log(page);
  const last = page * itemsPerPage;
  pageRange.value = [last - itemsPerPage, last];
}

const data = reactive({ works: [] as Array<IWork>, persons: [] as Array<IPerson>, genres: [] as keyable });
const filterString = ref('');
const isLoaded = ref(false);

onBeforeMount(async () => {
  await store.getDataMulti(data, { persons: 'id', genres: 'id' }, { works: 'id' });
  isLoaded.value = true;
});

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  const results = filterString.value ? data.works.filter((x: IWork) => x.title.search(re) !== -1) : data.works;
  return results.slice(...pageRange.value);
};

</script>
