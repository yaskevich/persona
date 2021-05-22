<template>
   <el-form label-width="120px" v-model="fact">
      <el-form-item prop="stamp" label="">
         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
            <el-date-picker v-model="timestamp" format="YYYY.MM.DD HH:mm" type="datetime" placeholder="Техническое время" :shortcuts="shortcuts"></el-date-picker>
            <!-- <el-input placeholder="переписка (БП_отправитель)" v-model="fact.firstname"></el-input> -->
            <el-cascader v-model="fact.acts"  :options="acts" clearable filterable :props="{ emitPath: false, multiple: true, value: 'id', label: 'title' }" placeholder="Вид(ы) деятельности"></el-cascader>
            <el-select
                v-model="fact.agent"
                filterable
                placeholder="Деятель"
                >
                <el-option
                  v-for="item in persons"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id">
                </el-option>
              </el-select>
         </el-space>
      </el-form-item>
      <el-form-item prop="datedesc" label="Дата">
         <el-input placeholder="10.05.1928" v-model="fact.datedesc" class="text-input" prop="datedesc"></el-input>
      </el-form-item>
      <el-form-item label="Место">
         <el-input placeholder="Пекин" v-model="fact.place"></el-input>
      </el-form-item>
      <el-form-item label="Описание">
         <el-input
            type="textarea"
            autosize
            placeholder="Пастернак пишет письмо Маяковскому"
            v-model="fact.title">
         </el-input>
      </el-form-item>
      <el-form-item label="Связи">
         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
            <el-select
               v-model="fact.persons1"
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
            <el-select v-model="fact.persons2" filterable multiple placeholder="Упомянуты">
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
            v-model="fact.comment">
         </el-input>
      </el-form-item>
      <el-form-item label="Источники">
         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
            <el-button type="primary" @click="dialogVisible=true;">Выбрать</el-button>
            <div v-if="fact.refs?.length">Выбрано: {{fact.refs.length}}</div>
         </el-space>
      </el-form-item>
      <!-- :on-preview="handlePreview"
         :on-remove="handleRemove"
         :file-list="fileList" -->
      <el-form-item prop="file" label="Медиафайл">
         <!-- <el-upload
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
         </el-upload> -->
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
      <el-button type="primary" @click="onSubmit" v-if="timestamp">Сохранить</el-button>
      <div v-else>
         <el-alert
           title="Сохранение недоступно, если пункт «Техническое время» не заполнен"
           type="info"
           effect="dark">
         </el-alert>
      </div>
   </el-form>
   <el-dialog
   title="Источники"
   v-model="dialogVisible"
   width="30%"
   :before-close="handleClose"
   @opened="dialogOpened"
   >
     <References :isEmbedded="true" ref="bibRef"></References>
     <template #footer>
      <span class="dialog-footer">
         <el-button @click="handleClose">Отмена</el-button>
         <el-button type="primary" @click="handleClose(true)">Подтвердить</el-button>
      </span>
     </template>
   </el-dialog>
</template>
<script>
import { ref, reactive, toRaw } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import References from "./References.vue";
import { useRoute } from 'vue-router';
import router from "../router";

export default {
  name: "Fact",
  props: {
    // datum: Object,
  },
  setup() {
   const vuerouter = useRoute();
   const id = vuerouter.params.id;
   const timestamp = ref();
   const fact = reactive({ works: [], persons1: [], persons2: [], books: [], acts: [], datedesc: '', title: '', stamp: null, agent: null, media: null, refs: [] });
   const persons  = ref([]);
   const works    = ref([]);
   const books    = ref([]);
   const acts     = ref([]);
   const dialogVisible = ref(false);
   const bibRef = ref(null);

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

      console.log("router id", id);
      if(id) {
        const result = await store.getData("facts", id);
        if("data" in result) {
           const data = result.data[0];
          Object.assign(fact, data);
          timestamp.value = fact.stamp;
          console.log("fact", fact);
        }
      }

      const resultSettings = await store.getData("settings");
      if("data" in resultSettings) {
          fact.agent = resultSettings.data[0]["persona_id"];
      }

      const result = await store.getData("facts", id);
      if("data" in result) {
        console.log("ok");
      }
      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      // console.log(persons);

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
        acts.value = toRaw(nested);
      }

    });

    const onSubmit = async() => {
      // form.validate();
      // console.log(typeof fact.stamp === "string" ? fact.stamp: fact.stamp.toISOString().replace('T',' ').replace('Z',''));
      // console.log('val:', typeof timestamp.value);

      if(timestamp.value && typeof timestamp.value === 'object') {
         console.log("process date");
         const dt  = timestamp.value;
         dt.setMinutes( dt.getMinutes() - dt.getTimezoneOffset() );
         fact.stamp = dt.toISOString();
      }
      console.log('save:', toRaw(fact));
      const result = await store.postData("facts", fact);
      console.log(result);

      if(!("data" in result && "id" in result.data)) {
       console.log("error!");
      } else {
       router.push("/facts")
      }
    };

    const handleClose = () => {
      // console.log("close", e);
      fact.refs  = bibRef.value.getCheckedItems();
      console.log("keys", fact.refs);
      dialogVisible.value = false;

    };

    const dialogOpened = () => {
      bibRef.value.setCheckedItems(fact.refs);
    };

    return { timestamp, bibRef, onSubmit, fact, persons, works, books, acts, shortcuts, dialogVisible, handleClose, dialogOpened, };
  },
  components: {
     References
  }
};
</script>
