<template>
   <MainTitle :title="'Факт ' + $route.params.id"  :callback="confirm" :text="fact.id? 'Сохранить': 'Добавить'"></MainTitle>
   <el-form label-width="120px" ref="formRef" :model="fact" :rules="rules">

         <el-space  direction="horizontal" style="display:flex;" wrap size="large">
           <el-tooltip class="item" placement="top-end">
           <template #content>
             Примерные дата и время события,<br/> которые необходимы, чтобы<br/> сортировать факты друг за другом
           </template>
            <el-form-item prop="stamp">
               <el-date-picker v-model="fact.stamp" format="YYYY.MM.DD HH:mm" type="datetime" placeholder="Техническое время" :shortcuts="shortcuts"></el-date-picker>
            </el-form-item>
            </el-tooltip>

            <el-form-item prop="acts">
               <el-cascader v-model="fact.acts"  :options="db.acts" clearable filterable :props="{ emitPath: false, multiple: true, value: 'id', label: 'title' }" placeholder="Вид(ы) деятельности"></el-cascader>
            </el-form-item>

            <el-form-item label="Деятель">
               <el-select
                   v-model="fact.agent"
                   filterable
                   placeholder="Деятель"
                   >
                   <el-option
                     v-for="item in db.persons"
                     :key="item.id"
                     :label="item.value"
                     :value="item.id">
                   </el-option>
                 </el-select>
              </el-form-item>
         </el-space>

      <el-form-item label="Дата">
         <el-input placeholder="10.05.1928" v-model="fact.datedesc" class="text-input"></el-input>
      </el-form-item>
      <el-form-item label="Место">
         <el-input placeholder="Пекин" v-model="fact.place"></el-input>
      </el-form-item>
      <el-form-item prop="title" label="Описание">
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
                  v-for="item in db.persons"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id"
                  :disabled="item.disabled"
                  >
               </el-option>
            </el-select>
            <el-select v-model="fact.persons2" filterable multiple placeholder="Упомянуты">
               <el-option
                  v-for="item in db.persons"
                  :key="item.id"
                  :label="item.value"
                  :value="item.id"
                  :disabled="item.disabled"
                  >
               </el-option>
            </el-select>
            <el-select v-model="fact.works" multiple filterable placeholder="Произведения">
               <el-option
                  v-for="item in db.works"
                  :key="item.id"
                  :label="item.title"
                  :value="item.id">
               </el-option>
            </el-select>
            <el-select v-model="fact.books" multiple filterable placeholder="Издания">
               <el-option
                  v-for="item in db.books"
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
      <el-form-item label="Медиафайл">
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

      <!-- <el-button type="primary" @click="confirm">Сохранить</el-button> -->
      <!-- v-if="timestamp" -->
      <!-- <div v-else>
         <el-alert
           title="Сохранение недоступно, если пункт «Техническое время» не заполнен"
           type="info"
           effect="dark">
         </el-alert>
      </div> -->
   <el-button type="danger" v-if="fact?.id" @click="deleteFact">Удалить</el-button>
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
<script lang="ts">
import { ElForm } from 'element-plus';
import { defineComponent, onBeforeMount, ref, reactive } from 'vue';
import store from "../store";
import References from "./References.vue";
import { useRoute } from 'vue-router';
import router from "../router";
import MainTitle from './MainTitle.vue';

export default defineComponent({
  setup() {
   const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
   const vuerouter = useRoute();
   const id = vuerouter.params.id;
   const fact = reactive({ works: [], persons1: [], persons2: [], books: [], acts: [], datedesc: '', title: '', stamp: null, agent: null, media: null, refs: [] });
   const db = reactive({persons: [], works: [], books: [], acts: []});
   const dialogVisible = ref(false);
   const bibRef = ref(null);

   const shortcuts = [{
      text: '1920',
      value: (() => new Date(1920, 1, 1, 12, 0, 0))(),
   }, {
      text: '1940',
      value: (() => new Date(1940, 1, 1, 12, 0, 0))(),
   }, {
      text: '1960',
      value: (() => new Date(1960, 1, 1, 12, 0, 0))(),
   }];

    onBeforeMount(async() => {
      console.log("router id", id);
      if(id) {
        const {data} = await store.getData("facts", id);
        if(data?.length) {
          Object.assign(fact, data[0]);
          // const dt  = new Date(fact.stamp);
          // dt.setMinutes( dt.getMinutes() - dt.getTimezoneOffset() );
         // fact.stamp = dt.toISOString();
          console.log("stamp", fact.stamp);
          // timestamp = fact.stamp;
        }
      }

      const names  = Object.keys(db);
      await Promise
         .all(names.map(async(x) => store.getData(x)))
         .then(v => v.forEach((x, i) => db[names[i]] = x.data));

      fact.agent = store.state.user.settings.persona;
      db.persons = db.persons.map (x => ({...x, value: x.firstname + ' ' + x.lastname, disabled: Boolean(x.id == fact.agent)}));
      console.log(db.persons);
      db.acts  = store.nest(db.acts);

      console.log("DATA", db);
    });

    const handleClose = () => {
      // console.log("close", e);
      fact.refs  = bibRef.value.getCheckedItems();
      console.log("keys", fact.refs);
      dialogVisible.value = false;

    };

    const deleteFact = async(id, key) => {
      const {data} = await store.deleteById('facts', fact.id);
      if (data?.id) {
       router.push('/facts')
      }
    };

    const dialogOpened = () => {
      bibRef.value.setCheckedItems(fact.refs);
    };

    const  rules = {
      acts: [{ required: true, message: 'Выберите виды деятельности', trigger: 'change' }],
      stamp: [ { required: true, message: 'Выставьте примерные дату и время', trigger: 'change' }],
      title: [ { required: true, message: 'Заполните описание', trigger: 'blur' } ],
   };

   const confirm = async() => {
     formRef.value?.validate(async(valid) => {
        console.log("valid", valid);
     if (valid) {
        const datum = {...fact};
        if(datum.stamp && typeof datum.stamp === 'object') {
           datum.stamp = store.dateDropTimeZone(fact.stamp);
           console.log("DROPPED", datum.stamp);
        }
         console.log('save:', datum);
         const {data} = await store.postData("facts", datum);
         if(fact.id != data?.id) {
             router.replace("/fact/"+data.id);
             fact.id = data.id;
         }


     //   if(!("data" in result && "id" in result.data)) {
     //    console.log("error!");
     //   } else {
     //    router.push("/facts");
     //   }
        }
     })

   };

    return { db, bibRef, confirm, fact, shortcuts, dialogVisible, handleClose, dialogOpened, rules, formRef, deleteFact, };
  },
  components: {
   MainTitle,
   References,
  }
});
</script>
