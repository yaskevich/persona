<template>
  Факты
  <el-button type="primary" @click="openForm">Добавить</el-button>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import router from "../router";
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

    const facts = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("facts");
      console.log(result);
      if("data" in result && !("error" in result.data)) {
        if(Object.keys(result.data).length) {
          facts.push(...result.data);
        } else {
          console.log("table is empty");
        }
      }
    });


    const openForm = () => {
      router.push("/fact/")
    };


    return {
      openForm,
      formRef,
      facts
    };
  },
});
</script>
