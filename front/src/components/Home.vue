<template>
<div class="box">
  <div>
      Персоналии: {{data.persons}}
  </div>
  <div>
    Произведения: {{data.works}}
  </div>
  <div>
    Издания: {{data.books}}
  </div>

  <el-divider></el-divider>
  <div>
    <small>Версия: {{version}}</small>
  </div>

</div>
</template>

<script lang="ts">
import { reactive, defineComponent, onBeforeMount } from 'vue'
import store from "../store";

export default defineComponent({
  name: 'Home',
  setup: () => {
    const data = reactive({});

    onBeforeMount(async() => {
      [data["persons"], data["works"], data["books"]] = (await Promise.all(
        [ store.getData("persons"),
          store.getData("works"),
          store.getData("books"),
        ])
      ).map(x => x.data.length);

    });

    return { data, version: store.version }
  }
})
</script>

<style scoped>

</style>
