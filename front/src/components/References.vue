<template>
  <el-dialog
  title="Редактировать"
  v-model="bibliodata.visible"
  width="30%"
  :before-close="handleClose"
  @opened="onDialogOpened">

    <el-space>
      <el-radio-group v-model="bibliodata.reftype">
            <el-radio-button label="0">Сведения</el-radio-button>
            <el-radio-button label="1">Заглавие</el-radio-button>
            <el-radio-button label="2">Финаль</el-radio-button>
          </el-radio-group>
    </el-space>
    <div class="box">
    <el-select
        v-model="bibliodata.authors"
        v-if="bibliodata.reftype==1"
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
    <div v-if="bibliodata.reftype==2">
    <div>
    Страницы
    </div>
    <el-tag
      :key="entry"
      v-for="entry in bibliodata.pages"
      closable
      :disable-transitions="false"
      @close="removePage(entry)"
    >
    {{entry}}
  </el-tag>
  <el-input
    class="input-new-tag"
    v-if="inputVisible"
    v-model="page"
    ref="saveTagInput"
    size="mini"
    @keyup.enter="handleInputConfirm"
    @blur="handleInputConfirm"
  >
  </el-input>
<el-button v-else class="button-new-tag" size="small" @click="showInput">+ добавить</el-button>

    <el-space>

      <!-- <el-input v-model="bibliodata.text"><template #prepend>С</template></el-input>
      <el-input v-model="bibliodata.text"><template #prepend>По</template></el-input> -->
      <!-- <el-input v-model="bibliodata.text"></el-input>
      <el-button type="primary" icon="el-icon-plus"></el-button> -->
    </el-space>
    </div>


    <div class="box">
      <span v-if="bibliodata.reftype==0">Запись</span>
      <span v-if="bibliodata.reftype==1">Название</span>
      <span v-if="bibliodata.reftype==2">Название-описание</span>

    </div>
    <el-input
          placeholder=""
          v-model="bibliodata.title"
          @keyup.enter="handleClose(Boolean(bibliodata.title))"
          >
    </el-input>

    <div v-if="bibliodata.reftype==2">
          <div class="box">Цитата</div>
          <el-input v-model="bibliodata.content" type="textarea"></el-input>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Отмена</el-button>
        <el-button type="primary" v-if="bibliodata.title" @click="handleClose(true)">Сохранить</el-button>
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
    >
    <template #default="{ node, data }">
       <span class="custom-tree-node">
         <span>{{ node.label }}</span>
         <!-- <span v-if="isEmbedded">
           <el-checkbox v-if="!data?.children?.length"></el-checkbox>
         </span> -->
         <span v-if="!isEmbedded">
           <el-dropdown >
             <i class="el-icon-s-tools"></i>
             <template #dropdown>
               <el-dropdown-menu>
                 <!-- <el-dropdown-item @click="addItem(node, data)">Добавить соседний пункт</el-dropdown-item>
                 <el-dropdown-item @click="addItem(node, data, true)">Добавить вложенный пункт</el-dropdown-item> -->
                 <el-dropdown-item @click="renameItem(node, data)">Редактировать</el-dropdown-item>
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
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance, toRaw } from 'vue';
import { ElForm } from 'element-plus';
import store from "../store";

export default defineComponent({
  props: {
    isEmbedded: Boolean,
  },
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
    const bibliodata = reactive({ visible: false, title: "", content: "", id: 0 , reftype: 0, pages: [], authors: [], parent: null });
    const refs = reactive([]);
    const authors = ref([]);
    const loading = ref(false);
    let persons = [];
    const inputVisible = ref(false);
    const page = ref('');


    // const refs =  [
    //           {
    //              title: 'Полное собрание сочинений', id: 1,
    //              children: [
    //                { title: 'Том 8', id: 2, children: [
    //                  { title: 'Часть 1', id: 6,  children: [
    //                    { title: 'М.: СЛОВО/SLOVO, 2004 г.', id: 13, children: [
    //                       { title: 'C. 115', id: 14 }
    //                    ] }
    //                  ]
    //                }
    //                ]
    //                },
    //              ]
    //           },
    //           {
    //              title: 'Уч. зап. Тартус. гос. ун-та. Труды по рус. и слав. фил. IX. Литературоведение.', id: 4,
    //              children: [
    //                { title: 'Вып. 184', id: 6, children: [{ title: 'C. 284', id: 24 }] }
    //              ]
    //           },
    //
    //         ];

    // const loading = ref(false);

    const getAuthors = (query) => {
      console.log(query);
      const re  = new RegExp(query, "i");
      loading.value = true;
      authors.value = persons.filter(x => re.test(x.value));
      loading.value = false;
    };

    onBeforeMount(async() => {
      const result = await store.getData("refs");
      if("data" in result) {
        const nested = store.nest(result.data)
        // console.log("nest", nested);
        refs.push(...nested);
      }

      const personsData = await store.getData("persons");
      authors.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log("authors", authors);
    });

    const renameItem = (node, datum) => {
      // console.log(node, datum);
      bibliodata.visible = true;
      bibliodata.id = datum.id;
      bibliodata.title = datum.title;
    };

    const handleClose = (e) => {
      // console.log("close", e);
      bibliodata.visible = false;
      // authors: null
      // content: null
      // id: 1
      // pages: null
      // parent: null
      // reftype: 0
      // title: "Полное собрание сочинений. В 11 томах"
      if (e === true) {


        console.log("reftype", bibliodata.reftype);
        if (bibliodata.reftype == 0) {
          console.log("check 0");
          bibliodata.authors = null;
          bibliodata.content = null;
          bibliodata.pages = [];
        } else if (bibliodata.reftype == 1) {
          console.log("check 1");
          bibliodata.content = null;
          bibliodata.pages = [];
        }

        const datum = toRaw(bibliodata);
        console.log("result", datum);
      }
    };

    const onDialogOpened = () => {
    };

    const showInput = () => {
        inputVisible.value = true;
    };


    const removePage = (entry) => {
      bibliodata.pages.splice(bibliodata.pages.indexOf(entry), 1);
    };

    const handleInputConfirm = () => {
        if (page.value) {
          bibliodata.pages.push(page.value);
        }
        inputVisible.value = false;
        page.value = '';
    };

    return {
      handleInputConfirm,
      removePage,
      page,
      inputVisible,
      showInput,
      onDialogOpened,
      formRef,
      // addItem,
      renameItem,
      // removeItem,
      bibliodata,
      handleClose,
      refs,
      getAuthors,
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
</style>
