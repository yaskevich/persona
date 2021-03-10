<template>
  Издания
  <el-button type="primary" @click="openForm">Добавить</el-button>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import router from "../router";
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

    const books = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("books");
      if("data" in result) {
        if(Object.keys(result.data).length) {
          books.push(...result.data);
        } else {
          console.log("table is empty");
        }
      }
    });


    const openForm = () => {
      router.push("/book/")
    };


    return {
      openForm,
      formRef,
      books
    };
  },
});
</script>
