<template>
  <div>
    Произведения
  </div>

  <div style="margin-bottom: 1rem;">
    <el-button type="primary" @click="openForm">Добавить</el-button>
  </div>

  <el-row v-for="(value, key) in works"  :gutter="20" :key="key">
    <el-col :span="16"><div class="grid-content bg-purple">
      {{value.title}}
    </div></el-col>
    <el-col :span="4"><div class="grid-content bg-purple-light">
      {{value.genre}}
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

export default defineComponent({
  setup() {

    const works = reactive([]);
    const persons = ref([]);

    onBeforeMount(async() => {
      const result = await store.getData("works");
      if("data" in result) {
        works.push(...result.data);
      }

      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

    });

    const openForm = () => {
      router.push("/work/")
    };

    return {
      works,
      persons,
      openForm
    };
  },
});
</script>

<style>
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-dark {
    background: #99a9bf;
  }
  .bg-purple {
    background: #d3dce6;
  }
  .bg-purple-light {
    background: #e5e9f2;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
  }
</style>
