<template>
  <el-dialog
  title="Редактировать"
  v-model="dialogVisible"
  width="30%">

    <el-space>

      <el-radio-group v-model="bib.reftype">
        <el-radio-button label="0">Сведения</el-radio-button>
        <el-radio-button label="1">Заглавие</el-radio-button>
        <el-radio-button label="2">Финаль</el-radio-button>
      </el-radio-group>

    </el-space>

    <div class="box">

      <el-select
        v-model="bib.authors"
        v-if="bib.reftype==1"
        multiple
        filterable
        reserve-keyword
        placeholder="Авторы"
        >
        <el-option
          v-for="item in authors"
          :key="item.id"
          :label="item.value"
          :value="item.id">
        </el-option>
      </el-select>

    </div>

    <div v-if="bib.reftype==2">

      <div>Страницы</div>
      <el-tag
        :key="entry"
        v-for="entry in pages"
        closable
        :disable-transitions="false"
        @close="removePage(entry)">
      {{entry}}
      </el-tag>
      <el-input
        class="input-new-tag"
        v-if="inputVisible"
        v-model="page"
        ref="saveTagInput"
        size="mini"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm">
      </el-input>
      <el-button v-else class="button-new-tag" size="small" @click="showInput">+ добавить</el-button>
      <el-space>
        <!-- <el-input v-model="bib.text"><template #prepend>С</template></el-input>
        <el-input v-model="bib.text"><template #prepend>По</template></el-input> -->
        <!-- <el-input v-model="bib.text"></el-input>
        <el-button type="primary" icon="el-icon-plus"></el-button> -->
      </el-space>

    </div>

    <div class="box">

      <span v-if="bib.reftype==0">Запись</span>
      <span v-if="bib.reftype==1">Название</span>
      <span v-if="bib.reftype==2">Название-описание</span>

    </div>

    <el-input v-model="bib.title"></el-input>

    <div v-if="bib.reftype==2">
      <div class="box">Цитата</div>
      <el-input v-model="bib.content" type="textarea"></el-input>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false;">Отмена</el-button>
        <el-button type="primary" v-if="bib.title" @click="handleClose(true)">Сохранить</el-button>
      </span>
    </template>

  </el-dialog>

  <div v-if="!isEmbedded">
    Библиографические записи
  </div>

  <el-tree
    :data="refs"
    node-key="id"
    :props="{ label: 'title', disabled: 'children'}"
    default-expand-all
    :expand-on-click-node="false"
    style="max-width:500px;"
    empty-text="..."
    :show-checkbox="isEmbedded"
    :check-on-click-node="true"
    :check-strictly="true"
    :render-content="renderNode"
    >
    <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span>{{node.label}}</span>
         <!-- <span v-html="( node?.data?.pages?.length ? 'С. ' + node?.data?.pages?.join(', ') + ' • ' : '' ) + node.label + ( node?.data?.content ? '&nbsp;<i class=el-icon-s-comment></i>' : '' )"></span> -->
         <span v-if="!isEmbedded">
           <el-dropdown >
             <i class="el-icon-s-tools"></i>
             <template #dropdown>
               <el-dropdown-menu>
                 <el-dropdown-item @click="buildDialog(node, data, 1)">Добавить соседний пункт</el-dropdown-item>
                 <el-dropdown-item v-if="data.reftype != 2" @click="buildDialog(node, data, 2)">Добавить вложенный пункт</el-dropdown-item>
                 <el-dropdown-item @click="buildDialog(node, data)">Редактировать</el-dropdown-item>
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
import { defineComponent, ref, reactive, onBeforeMount, toRaw } from 'vue';
import store from "../store";
import { ElDropdown,  ElDropdownMenu, ElDropdownItem, } from 'element-plus';

export default defineComponent({
  props: {
    isEmbedded: Boolean,
  },
  setup(props) {
    const scheme  = { title: "", content: "", id: null, reftype: 0, pages: [], authors: [], parent: null, mode: 0 };
    const bib = reactive({});
    Object.assign(bib, scheme);
    const dialogVisible  = ref(false);
    const refs = reactive([]);
    const authors = ref([]);
    const loading = ref(false);
    const inputVisible = ref(false);
    const page = ref('');
    const pages = reactive([]);
    let nodeRef = {};

    onBeforeMount(async() => {
      const result = await store.getData("refs");
      if("data" in result) {
        const nested = store.nest(result.data)
        // console.log("nest", nested);
        refs.push(...nested);
      }

      const personsData = await store.getData("persons");
      authors.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      // console.log("authors", authors);
    });

    const buildDialog = (node, datum, mode) => {
      console.log("node", node);
      nodeRef = node;
      Object.assign(bib, mode ? scheme: datum, { mode: mode });
      Object.assign(pages, bib.pages);
      dialogVisible.value = true;
    };

    const handleClose = async(e) => {
      console.log("close", e);
      dialogVisible.value = false;


      if (bib.reftype == 0) {
        console.log("check 0");
        bib.authors = null;
        bib.content = null;
        bib.pages = [];
      } else if (bib.reftype == 1) {
        console.log("check 1");
        bib.content = null;
        bib.pages = [];
      } else {
        bib.pages = pages;
      }

        const datum = toRaw(bib);
        delete datum['children'];
        delete datum['mode'];

        if (datum.id) {
          console.log("UPDATE NODE", datum);
          for (let prop in datum) {
            nodeRef.data[prop] = datum[prop];
          }
          const result = await store.postData("refs", datum);
          console.log(result);

        } else {
          // take id from server
          console.log("mode", (bib.mode == 2 ? "child": "neighbor"));
          console.log("node ref", nodeRef);
        }

        console.log("result", nodeRef);
    };

    const showInput = () => {
        inputVisible.value = true;
    };

    const removePage = (entry) => {
      bib.pages.splice(bib.pages.indexOf(entry), 1);
    };

    const handleInputConfirm = () => {
        if (page.value) {
          pages.push(page.value);
        }
        inputVisible.value = false;
        page.value = '';
    };

    const renderNode = (h, x) => {
      // console.log(x.data);
      // Because of "Non-function value encountered for default slot" warning, I wrapped everything in slot in a function
      // However, it might be not a proper way of handling slots
      let label  = x.data.title;
      if(x.node?.data?.pages?.length){
        label = 'С. ' + x.node?.data?.pages?.join(', ') + ' • ' + label;
      }
      if (x.node?.data?.content) {
          label = h('span', { class: "label" ,  }, [label, h('i',  {class: "el-icon-s-comment indent"})])
      }
      const spans  = [label];

      if (!props.isEmbedded) {
        const dropitems = [
          h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data)}, () => 'Редактировать'),
          h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data, 1)}, () => 'Добавить соседний пункт')
        ];

        if (x.data.reftype != 2) {
          dropitems.push(h(ElDropdownItem, {onClick: () => buildDialog(x.node, x.data, 2)}, () => 'Добавить вложенный пункт'))
        }

        const dropdown =  h(ElDropdown, null, {
          default:  () =>  [ h('i',  {class: "el-icon-s-tools"}) ],
          dropdown: () =>  [ h(ElDropdownMenu,  () => dropitems ) ]
        });
        spans.push(dropdown)
      }

      return h('span', { class: "custom-tree-node" ,  }, spans)
    };

    return {
      renderNode,
      dialogVisible,
      handleInputConfirm,
      removePage,
      page,
      pages,
      inputVisible,
      showInput,
      buildDialog,
      bib,
      handleClose,
      refs,
      authors,
      loading,
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
  .box{
    margin-top: 1rem;
  }
  .el-tag + .el-tag {
   margin-left: 10px;
 }
 .button-new-tag {
   margin-left: 10px;
   height: 32px;
   line-height: 30px;
   padding-top: 0;
   padding-bottom: 0;
 }
 .input-new-tag {
   width: 90px;
   margin-left: 10px;
   vertical-align: bottom;
 }
 .indent{
   margin-left: .25rem;
 }
</style>
