<template>
  <MainTitle :title="loc('books')" :callback="() => $router.push('/book/')"></MainTitle>

  <el-row type="flex" justify="center">

    <el-input :placeholder="loc('filtertitles')" v-model="filterString" style="max-width: 280px;" clearable>
    </el-input>

  </el-row>

  <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

    <el-col :span="16">
      <div class="grid-content bg-purple">
        <span v-for="(id, index) in value.editors" :key="index" style="font-style:italic;font-size: .7rem;">
          <span v-if="index">,</span> {{ persons[id]?.["name"] }}
        </span>
        {{ value.title }}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        {{ value.published }}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/book/' + value.id">
          <el-button type="" link size="small" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

  </el-row>
</template>

<script setup lang="ts">

import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from '../store';
import MainTitle from './MainTitle.vue';

const books = reactive([] as Array<IBook>);
const persons = reactive({} as keyable);
const filterString = ref('');

onBeforeMount(async () => {
  const result = await store.getData('books');
  // console.log(result);
  if ('data' in result && !('error' in result.data)) {
    if (Object.keys(result.data).length) {
      books.push(...result.data.sort((a: IBook, b: IBook) => b.id - a.id));
    } else {
      console.log('table is empty');
    }
  }

  const personsData = await store.getData('persons');
  Object.assign(
    persons,
    ...personsData.data.map((x: IPerson) => ({ [x.id]: { ...x, name: x.firstname + ' ' + x.lastname } }))
  );
});

const filtered = () => {
  const re = new RegExp(filterString.value, 'i');
  return filterString.value ? books.filter(x => x.title.search(re) !== -1) : books;
};

const loc = store.loc;

</script>
