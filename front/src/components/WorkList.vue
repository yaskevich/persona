<template>
  <MainTitle title="Произведения" :callback="confirm"></MainTitle>

  <el-row v-for="(value, key) in works"  :gutter="20" :key="key">
    <el-col :span="16"><div class="grid-content bg-purple">
      <span v-for="(id, index) in value.authors" :key="index" style="font-style:italic;font-size: .7rem;">
        <span v-if="index">,</span>
        {{persons.filter(x=>x.id === id).map(x=>x.value).shift() }}
      </span>
      {{value.title}}
    </div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple-light">
      {{genres.filter(x=>x.id === value.genre)?.[0]?.["title"] }}
    </div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple">
      <router-link :to="'/work/' + value.id">
      <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
    </router-link>
    </div></el-col>

  </el-row>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount } from 'vue';
import store from "../store";
import router from "../router";
import MainTitle from './MainTitle.vue';

export default defineComponent({
  setup() {

    const works = reactive([]);
    const persons = ref([]);
    const genres = ref([]);

    onBeforeMount(async() => {
      const result = await store.getData("works");
      if("data" in result) {
        works.push(...result.data.sort((a, b) => b.id - a.id));
      }

      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const genresData = await store.getData("genres");
      if("data" in genresData) {
        genres.value = genresData.data;
      }

    });

    const confirm = () => {
      router.push("/work/")
    };

    return {
      works,
      persons,
      genres,
      confirm,
    };
  },
  components: {
    MainTitle,
  }
});
</script>
