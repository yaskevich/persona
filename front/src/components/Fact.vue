<template>
   <el-form label-width="120px" v-model="fact">
      <el-form-item prop="timestamp" label="">
         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
            <el-date-picker v-model="fact.timestamp" type="datetime" placeholder="Техническое время" :shortcuts="shortcuts"></el-date-picker>
            <!-- <el-input placeholder="переписка (БП_отправитель)" v-model="fact.firstname"></el-input> -->
            <el-cascader :options="acts" clearable filterable :props="{ multiple: true, value: 'id', label: 'title' }" placeholder="Вид(ы) деятельности"></el-cascader>
            <el-button type="danger" @click="dialogVisible=true">Выбрать источники</el-button>
         </el-space>
      </el-form-item>
      <el-form-item prop="date" label="Дата">
         <el-input placeholder="10.05.1928" v-model="fact.date" class="text-input" prop="date"></el-input>
      </el-form-item>
      <el-form-item label="Деятель">
         <el-input placeholder="■" v-model="fact.firstname"></el-input>
      </el-form-item>
      <el-form-item label="Место">
         <el-input placeholder="Пекин" v-model="fact.firstname"></el-input>
      </el-form-item>
      <el-form-item label="Описание">
         <el-input
            type="textarea"
            autosize
            placeholder="Пастернак пишет письмо Маяковскому"
            v-model="fact.firstname">
         </el-input>
      </el-form-item>
      <el-form-item label="Связи">
         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
            <el-select
               v-model="fact.participants"
               filterable
               multiple
               placeholder="Участники"
               >
               <el-option
                  v-for="item in persons"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id">
               </el-option>
            </el-select>
            <el-select v-model="fact.mentions" filterable multiple placeholder="Упомянуты">
               <el-option
                  v-for="item in persons"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id">
               </el-option>
            </el-select>
            <el-select v-model="fact.works" multiple filterable placeholder="Произведения">
               <el-option
                  v-for="item in works"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id">
               </el-option>
            </el-select>
            <el-select v-model="fact.books" multiple filterable placeholder="Издания">
               <el-option
                  v-for="item in books"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id">
               </el-option>
            </el-select>
         </el-space>
      </el-form-item>
      <el-form-item label="Примечание">
         <el-input
            type="textarea"
            autosize
            placeholder="Был солнечный день"
            v-model="fact.firstname">
         </el-input>
      </el-form-item>
      <!-- :on-preview="handlePreview"
         :on-remove="handleRemove"
         :file-list="fileList" -->
      <el-form-item prop="file" label="Медиафайл">
         <el-upload
            class="upload-demo"
            drag
            action="https://jsonplaceholder.typicode.com/posts/"
            multiple
            >
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">Перетащите файл сюда или <em>нажмите, чтобы загрузить</em></div>
            <template #tip>
               <div class="el-upload__tip">
                  Размер файла не больше 500кб
               </div>
            </template>
         </el-upload>
      </el-form-item>
      <!-- <el-form-item>
         <el-select v-model="user.privs" placeholder="Select" value-key>
           <el-option
             v-for="item in options"
             :key="item.value"
             :label="item.label"
             :value="item.value">
           </el-option>
         </el-select>
         </el-form-item> -->
      <el-button type="primary" @click="onSubmit">Сохранить</el-button>
   </el-form>
   <el-dialog
   title="Источники"
   v-model="dialogVisible"
   width="30%"
   :before-close="handleClose"
   >
     <References :isEmbedded="true"/>
     <template #footer>
      <span class="dialog-footer">

         <el-button @click="handleClose">Отмена</el-button>
         <el-button type="primary" @click="handleClose(true)">Сохранить</el-button>
      </span>
     </template>
   </el-dialog>
</template>
<script>
import { ref, reactive } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import References from "./References.vue";
import { useRoute } from 'vue-router';

export default {
  name: "User",
  props: {
    // datum: Object,
  },
  setup() {
    let fact = ref({ works: [], participants: [], mentions: [], books: [], date: '', timestamp: null, });
    const vuerouter = useRoute();
    const id = vuerouter.params.id;
    const persons = ref([]);
    const works = ref([]);
    const books = ref([]);
    const acts = reactive([]);

    const dialogVisible = ref(false);

    const shortcuts = [{
         text: '1920',
         value: (() => new Date(1920, 1, 1, 9, 0, 0))(),
      }, {
         text: '1940',
         value: (() => new Date(1940, 1, 1, 9, 0, 0))(),
      }, {
         text: '1960',
         value: (() => new Date(1960, 1, 1, 9, 0, 0))(),
      }];

    onBeforeMount(async() => {
      const result = await store.getData("facts", id);
      if("data" in result) {
        console.log("ok");
      }
      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const resultWorks = await store.getData("works");
      if("data" in resultWorks) {
        works.value = resultWorks.data;
      }

      const resultBooks = await store.getData("books");
      if("data" in resultBooks) {
        books.value = resultBooks.data;
      }

      const resultActs = await store.getData("acts");
      if("data" in result) {
        const nested = store.nest(resultActs.data)
        console.log("nest", nested);
        acts.push(...nested);
      }

    });

    const onSubmit = async() => {
      // form.validate();
        console.log('save:', fact.value);
        const result = await store.postData("facts", fact.value);
        console.log(result);
    };

    const handleClose = () => {
      // console.log("close", e);
      dialogVisible.value = false;

    };



    return {onSubmit, fact, options: store.state.options, persons, works, books, acts, shortcuts, dialogVisible, handleClose,  };
  },
  components: {
     References
  }
};
</script>
