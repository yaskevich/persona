<template>
  Типы событий
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
    <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span>{{ node.label }}</span>
         <span>
           <el-dropdown>
             <i class="el-icon-link"></i>
             <template #dropdown>
               <el-dropdown-menu>
                   <el-dropdown-item>Добавить соседний пункт</el-dropdown-item>
                   <el-dropdown-item>Удалить данный пункт</el-dropdown-item>
               </el-dropdown-menu>
             </template>
           </el-dropdown>
         </span>
       </span>
     </template>
  </el-tree>
  <el-button type="primary" @click="confirm">Сохранить</el-button>
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


    const handleDragStart = (node, ev) => {
        console.log('drag start', node);
    };

    const handleDragEnter = (draggingNode, dropNode, ev) => {
        console.log('tree drag enter: ', dropNode.label);
    };
    const handleDragLeave = (draggingNode, dropNode, ev) => {
        console.log('tree drag leave: ', dropNode.label);
    };
    const handleDragOver = (draggingNode, dropNode, ev) => {
        console.log('tree drag over: ', dropNode.label);
    };
    const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
        console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    };
    const handleDrop = (draggingNode, dropNode, dropType, ev) => {
        console.log('tree drop: ', dropNode.label, dropType);
    };
    const allowDrop = (draggingNode, dropNode, type) => {
        if (dropNode.data.label === 'Level two 3-1') {
          return type !== 'inner';
        } else {
          return true;
        }
    };
    const allowDrag = (draggingNode) => {
        return draggingNode.data.label.indexOf('Level three 3-1-1') === -1;
    };
    const confirm =() => {
      console.log("data", data);
      console.log(JSON.stringify(data));
    };

    const data = [
      {
         label: 'Корреспонденция', id: 1,
         children: [
           { label: 'Исходящая', id: 2 },
           { label: 'Входящая', id: 3 }
         ]
      },
      {
         label: 'Личная жизнь', id: 4,
         children: [
           { label: 'Путешествия', id: 5 },
           { label: 'Семья', id: 6 }
         ]
      },

    ];


    return {
      confirm,
      handleDragStart,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDragEnd,
      handleDrop,
      allowDrop,
      allowDrag,
      data,
      defaultProps: {
          children: 'children',
          label: 'label'
        },
      formRef,
      form
    };
  },
});
</script>

<style>
  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>
