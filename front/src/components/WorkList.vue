<template>
  <MainTitle :title="`${store.loc('works')} (${itemsCount})`" :callback="() => router.push('/work/')"></MainTitle>
  <div v-show="isLoaded">

    <el-row type="flex" justify="center">
      <el-input :placeholder="store.loc('filtertitles')" v-model="filterString" style="max-width: 280px;"
        clearable></el-input>
    </el-row>

    <el-row v-for="(value, key) in filtered" :key="key">
      <el-space :wrap="true">
        <el-tag disable-transitions v-for="(id, index) in value.authors" type="warning" size="large" :key="index">
          {{ store.getLabel(data.persons?.[id]) }}
        </el-tag>
        <el-button type="primary" plain @click="router.push('/work/' + value.id)">
          {{ value.title }}
        </el-button>

        <el-tag disable-transitions v-if="value?.genre" type="info" size="large">{{
          data.genres[String(value.genre)]?.title }}</el-tag>
        <el-tag disable-transitions v-if="value?.yeardate" type="info" size="large">{{
          value.yeardate }}</el-tag>
        <!-- <el-tag       effect="plain" disable-transitions v-if="value?.hash" type="info" size="large"> -->
        <el-tooltip v-if="value?.tokens" class="box-item" :content="String(value.tokens)" placement="right"
          effect="light">
          <el-icon><el-icon-grid /></el-icon>
        </el-tooltip>
        <el-icon v-else><el-icon-document v-if="value?.hash" /></el-icon>

        <!-- </el-tag> -->
      </el-space>
    </el-row>

    <el-row type="flex" justify="center">
      <el-pagination :current-page="page" layout="prev, pager, next" :total="itemsCount" hide-on-single-page background
        :page-size="itemsPerPage" @update:current-page="updatePage" />
    </el-row>

  </div>
</template>

<script setup lang="ts">

import { reactive, ref, onBeforeMount, computed } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';
import router from '../router';
import { useRoute } from 'vue-router';

const vuerouter = useRoute();

const page = ref(1);
const pageIn = Number(vuerouter.params.page);
if (pageIn) {
  page.value = pageIn;
}

console.log(page.value);


const itemsPerPage = 15;
const itemsCount = ref(0);
const pageRange = ref([(page.value - 1) * itemsPerPage, page.value * itemsPerPage]);
const updatePage = (newPage: number) => {
  // console.log(page);
  page.value = newPage;
  const last = page.value * itemsPerPage;
  pageRange.value = [last - itemsPerPage, last];
  router.push(`/works/${page.value || '1'}`);
}

const filtered = computed(() => {
  const re = new RegExp(filterString.value, 'i');
  const results = filterString.value ? data.works.filter((x: IWork) => x.title.search(re) !== -1) : data.works;
  itemsCount.value = results.length;
  return results.slice(...pageRange.value);
});

const data = reactive({ works: [] as Array<IWork>, persons: [] as Array<IPerson>, genres: [] as keyable });
const filterString = ref('');
const isLoaded = ref(false);

onBeforeMount(async () => {
  await store.getDataMulti(data, { persons: 'id', genres: 'id' }, { works: 'id' });
  isLoaded.value = true;
});

</script>
