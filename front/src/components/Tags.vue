<template>
  <el-tree
    :data="data"
    node-key="id"
    default-expand-all
    @node-drag-start="handleDragStart"
    @node-drag-enter="handleDragEnter"
    @node-drag-leave="handleDragLeave"
    @node-drag-over="handleDragOver"
    @node-drag-end="handleDragEnd"
    @node-drop="handleDrop"
    draggable
    :allow-drop="allowDrop"
    :allow-drag="allowDrag">
  </el-tree>
</template>


<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const form  = reactive({ title: '', year: '', selectedWorks: [], selectedEditors: [], selectedAuthors: []});
    // const works = ref([]);
    // let persons = [];
    // const loading = ref(false);
    // const editors = ref([]);
    // const authors = ref([]);

    onBeforeMount(async() => {
      // const personsData = await store.getData("persons");
      // persons = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      // editors.value  = persons;
      // authors.value  = persons;
      //
      // const worksData = await store.getData("works");
      // works.value  = worksData.data;
    });


    // const getWorks = async(query) => {
    //   console.log(query);
    //   const re  = new RegExp(query, "i");
    //   loading.value = true;
    //
    //   const worksData = await store.getData("works");
    //   works.value = worksData.data.filter(x => re.test(x.title));
    //   loading.value = false;
    // };


    return {
      formRef,
      form
    };
  },
});
</script>
