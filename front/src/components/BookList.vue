<template>
  <MainTitle :title="store.loc('books')" :callback="() => $router.push('/book/')"></MainTitle>

  <div v-show="isLoaded">
    <el-row type="flex" justify="center">

      <el-input :placeholder="store.loc('filtertitles')" v-model="filterString" clearable>
      </el-input>

    </el-row>

    <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

      <el-space wrap>
        <el-tag size="large" disable-transitions type="warning" v-for="(id, index) in value.editors" :key="index">
          {{ store.getLabel(data.persons?.[id]) }}
        </el-tag>

        <el-tooltip placement="top-end">
          <template #content>{{ value.title }}</template>
          <el-button @click="$router.push('/book/' + value.id)">
            {{ value.title.length > 42 ? value.title.slice(0, 40) + '...' : value.title }}
          </el-button>
        </el-tooltip>


        <el-tag size="large" disable-transitions type="info">{{ value.published }}</el-tag>
      </el-space>

    </el-row>
  </div>
</template>

<script setup lang="ts">

import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import store from '../store';
import MainTitle from './MainTitle.vue';

const data = reactive({ books: [] as Array<IBook>, persons: [] as Array<IPerson> });
const filterString = ref('');
const isLoaded = ref(false);

onBeforeMount(async () => {
  await store.getDataMulti(data, { persons: 'id' }, { books: 'id' });
  isLoaded.value = true;
});

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  return filterString.value ? data.books.filter(x => x.title.search(re) !== -1) : data.books;
};

</script>
