<template>
  <el-dialog
  :title="dialogData.caption"
  v-model="dialogData.visible"
  width="30%"
  :before-close="handleClose"
  @opened="onDialogOpened">
    <!-- <span>This is a message</span> -->
    <el-input
          ref="dialogInputRef"
          placeholder=""
          v-model="dialogData.text"
          @keyup.enter="handleClose(Boolean(dialogData.text))"
          >
       </el-input>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Отмена</el-button>
        <el-button type="primary" v-if="dialogData.text" @click="handleClose(true)">Сохранить</el-button>
      </span>
    </template>
  </el-dialog>

  Типы событий
  <!--
  @node-drag-start="handleDragStart"
  @node-drag-enter="handleDragEnter"
  @node-drag-leave="handleDragLeave"
  @node-drag-over="handleDragOver"
  @node-drag-end="handleDragEnd"
  :allow-drop="allowDrop"
  :allow-drag="allowDrag"
 -->
  <el-tree
    :data="acts"
    node-key="id"
    :props="{ label: 'title', }"
    default-expand-all
    @node-drop="handleDrop"
    draggable

    :expand-on-click-node="false"
    style="max-width:350px;"
    >
    <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span>{{ node.label }}</span>
         <span>
           <el-dropdown >
             <i class="el-icon-s-tools"></i>
             <template #dropdown>
               <el-dropdown-menu>
                 <el-dropdown-item @click="addItem(node, data)">Добавить соседний пункт</el-dropdown-item>
                 <el-dropdown-item @click="addItem(node, data, true)">Добавить вложенный пункт</el-dropdown-item>
                 <el-dropdown-item @click="renameItem(node, data)">Переименовать</el-dropdown-item>
                 <!-- <el-dropdown-item v-if="!data?.children?.length" @click="removeItem(node, data)"><strong>Удалить этот пункт</strong></el-dropdown-item> -->
               </el-dropdown-menu>
             </template>
           </el-dropdown>
         </span>
       </span>
     </template>
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
    const form  = reactive({ title: '', year: '', selectedWorks: [], selectedEditors: [], selectedAuthors: [] });
    const dialogData = reactive({ visible: false, text: "", caption: "", func: null, id: 0 });
    const dialogInputRef = ref(null);
    const acts = reactive([]);

    // const loading = ref(false);


    onBeforeMount(async() => {
      const result = await store.getData("acts");
      if("data" in result) {
        const nested = store.nest(result.data)
        // console.log("nest", nested);
        acts.push(...nested);
      }
    });

    // const handleDragStart = (node, ev) => {
    //     console.log('drag start', node);
    // };
    // const handleDragEnter = (draggingNode, dropNode, ev) => {
    //     console.log('tree drag enter: ', dropNode.label);
    // };
    // const handleDragLeave = (draggingNode, dropNode, ev) => {
    //     console.log('tree drag leave: ', dropNode.label);
    // };
    // const handleDragOver = (draggingNode, dropNode, ev) => {
    //     console.log('tree drag over: ', dropNode.label);
    // };
    // const handleDragEnd = (draggingNode, dropNode, dropType, ev) => {
    //     console.log('tree drag end: ', dropNode && dropNode.label, dropType);
    // };
    const handleDrop = async(draggingNode, dropNode, dropType, ev) => {
        // console.log('tree drop: ', dropNode.label, dropNode.data.id);
        // console.log("dropType", dropType);
        // console.log("dropNode", dropNode);
        // console.log("draggingNode", draggingNode.label, draggingNode.data.id);
        console.log(`${draggingNode.label}  ${draggingNode.data.id} ${dropType} ${dropNode.label} ${dropNode.data.id}`);

        const parent_id = dropType === "inner" ? dropNode.data.id : dropNode.data.parent;
        const result = await store.postData("acts", { "id":  draggingNode.data.id, "parent": parent_id });
        // console.log(result);
        if(!("data" in result && "id" in result.data)) {
          console.log("error!");
        }

    };
    // const allowDrop = (draggingNode, dropNode, type) => {
    //     if (dropNode.data.label === 'Level two 3-1') {
    //       return type !== 'inner';
    //     } else {
    //       return true;
    //     }
    // };
    // const allowDrag = (draggingNode) => {
        // return draggingNode.data.label.indexOf('Level three 3-1-1') === -1;
        // return true;
    // };

    const addItem = (node, datum, childmode) => {
      console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = `Добавить ${childmode? 'вложенный' : 'соседний'} пункт`;
      dialogData.id = datum.id;
      dialogData.func = async function() {
        console.log("!!", node, datum);
        const parent_id = node?.parent?.data?.id || null;
        console.log("parent", node?.parent?.data?.id, parent_id);
        console.log(("acts", { "title":  dialogData.text, "parent": parent_id }));
        const result = await store.postData("acts", { "title":  dialogData.text, "parent": childmode? datum.id : parent_id });
        console.log(result);
        if(!("data" in result && "id" in result.data)) {
          console.log("error!");
        } else {
          const newChild = { id: result.data.id, title: dialogData.text, children: [] };
          if(childmode){
            console.log("childmode");
            if(!datum.children) {
              datum.children = [];
            }
            datum.children.push(newChild);
          } else{
            if(parent_id) {
              console.log("push1");
              node.parent.data.children.push(newChild);
            } else{
              console.log("push2", newChild);
              acts.push(newChild);
            }
          }
          dialogData.text = "";
        }
      };
    };

    const renameItem = (node, datum) => {
      // console.log(node, datum);
      dialogData.visible = true;
      dialogData.caption = `Переименовать «${datum.title}»`;
      dialogData.id = datum.id;
      dialogData.func = async() =>  {
        const parent = node.parent;
        const children = parent.data.children || parent.data;
        const index = children.findIndex(d => d.id === datum.id);
        children[index].title = dialogData.text;
        const result = await store.postData("acts", { "title": dialogData.text, "id": datum.id, });
        console.log(result);

        if(("data" in result && "id" in result.data)) {
          dialogData.text = "";
        } else {
          console.log("error!");
        }
      };
    };

    const removeItem = async(node, datum) => {
      // console.log(node, datum);
      if(datum.children.length) {
        console.log("cannot delete non-empty slot!");
      } else {
        const result = await store.deleteById("acts", datum.id);
        if("data" in result && "id" in result.data){
          const parent = node.parent;
          const children = parent.data.children || parent.data;
          const index = children.findIndex(d => d.id === datum.id);
          children.splice(index, 1);
        }
      }
    };

    const handleClose = (e) => {
      // console.log("close", e);
      dialogData.visible = false;
      if (e === true) {
        dialogData.func();
      }
    };

    const onDialogOpened = () => {
      dialogInputRef.value.focus();
    };

    return {
      onDialogOpened,
      // handleDragStart,
      // handleDragEnter,
      // handleDragLeave,
      // handleDragOver,
      // handleDragEnd,
      handleDrop,
      // allowDrop,
      // allowDrag,
      formRef,
      form,
      addItem,
      renameItem,
      removeItem,
      dialogData,
      handleClose,
      dialogInputRef,
      acts,
    };
  }
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
