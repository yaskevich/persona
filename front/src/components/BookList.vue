<template>
  Издания
  <el-button type="primary" @click="openForm">Добавить</el-button>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios';
import router from "../router";
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();

    const works = reactive([]);

    onBeforeMount(async() => {
      // axios.get('/api/get/works').then((response) => {
      //   console.log(response.data);
      //   works.push(...response.data);
      // })
      const result = await store.getData("works");
      if(result.hasOwnProperty("data")) {
        console.log(result.data);
        works.push(...result.data);
      }
    });


    const openForm = () => {
      router.push("/book/")
    };


    return {
      openForm,
      formRef,
      works
    };
  },
});
</script>
