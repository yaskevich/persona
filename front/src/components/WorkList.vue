<template>

  <MainTitle title="Произведения" :callback="() => $router.push('/work/')"></MainTitle>

  <el-row type="flex" justify="center">

    <el-input placeholder="Фильтр по названиям"
              v-model="filterString"
              style="max-width: 280px;"
              clearable>
    </el-input>

  </el-row>

  <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

    <el-col :span="16">
      <div class="grid-content bg-purple">
        <span v-for="(id, index) in value.authors" :key="index" style="font-style:italic;font-size: .7rem;">
              <span v-if="index">,</span> {{data.persons[id]? data.persons[id]["firstname"] + ' '+ data.persons[id]["lastname"]:
        ''}}
        </span>
        {{value.title}}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        {{data.genres[value.genre]?.title}}
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/work/' + value.id">
          <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

  </el-row>

</template>

<script>

  import { defineComponent, reactive, ref, onBeforeMount } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const data = reactive({ works: [], persons: [], genres: [] });
      const filterString = ref('');

      onBeforeMount(async () => {
        await store.getDataMulti(data, { persons: 'id', genres: 'id' }, { works: 'id' });
      });

      const filtered = () => {
        const re = new RegExp(filterString.value, 'i');
        return filterString.value ? data.works.filter(x => x.title.search(re) !== -1) : data.works;
      };

      return {
        data,
        filtered,
        filterString,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
