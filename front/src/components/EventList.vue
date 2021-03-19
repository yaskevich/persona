<template>
  События
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

    const events = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("events");
      console.log(result);
      if("data" in result && !("error" in result.data)) {
        if(Object.keys(result.data).length) {
          events.push(...result.data);
        } else {
          console.log("table is empty");
        }
      }
    });


    const openForm = () => {
      router.push("/event/")
    };


    return {
      openForm,
      formRef,
      events
    };
  },
});
</script>
