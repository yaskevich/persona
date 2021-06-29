<template>

  <MainTitle title="Жанры" :callback="confirm"></MainTitle>

  <el-row v-for="(value, key) in genres" :gutter="20" :key="key">
    <el-col :span="24">
      <div class="grid-content bg-purple">
        {{value.title}}
      </div>
    </el-col>
  </el-row>

</template>

<script lang="ts">

  import { defineComponent, reactive, onBeforeMount } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const genres = reactive([]);

      onBeforeMount(async () => {
        const result = await store.getData('genres');
        if ('data' in result) {
          genres.push(...result.data);
        }
      });

      const confirm = () => {
        console.log("confirm");
      };

      return {
        genres,
        confirm,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
