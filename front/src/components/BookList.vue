<template>
  <MainTitle :title="loc('books')" :callback="() => $router.push('/book/')"></MainTitle>

  <div v-show="isLoaded">
    <el-row type="flex" justify="center">

      <el-input :placeholder="loc('filtertitles')" v-model="filterString" style="max-width: 280px;" clearable>
      </el-input>

    </el-row>

    <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

      <!-- <el-col :span="16">
      <div class="grid-content bg-purple"> -->
      <el-space>
        <el-tag type="warning" size="large" v-for="(id, index) in value.editors" :key="index">
          {{ store.getLabel(data.persons?.[id]) }}
        </el-tag>
        <el-button type="primary" plain @click="$router.push('/book/' + value.id)">
          {{ value.title }}
        </el-button>
        <el-tag type="info" size="large">{{ value.published }}</el-tag>
      </el-space>
      <!-- <router-link :to="'/book/' + value.id">
      <el-button type="" link size="small" icon="el-icon-edit" plain class="full-width"></el-button>
    </router-link> -->
      <!-- </div>
    </el-col> -->

      <!-- <el-col :span="4">
      <div class="grid-content bg-purple-light">
        {{ value.published }}
      </div>
    </el-col> -->

      <!-- <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/book/' + value.id">
          <el-button type="" link size="small" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col> -->

    </el-row>
  </div>
</template>

<script setup lang="ts">

import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const data = reactive({ books: [] as Array<IBook>, persons: [] as Array<IPerson> });
const filterString = ref('');
const isLoaded = ref(false);

onBeforeMount(async () => {
  const result = await store.getData('books');
  // console.log(result);
  await store.getDataMulti(data, { persons: 'id' }, { books: 'id' });
  isLoaded.value = true;
});

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  return filterString.value ? data.books.filter(x => x.title.search(re) !== -1) : data.books;
};

const loc = store.loc;

</script>
