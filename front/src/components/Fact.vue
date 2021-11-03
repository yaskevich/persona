<template>

  <MainTitle :title="loc('fact') + ' ' + $route.params.id" :callback="confirm" :text="loc(fact.id ? 'save': 'add')"></MainTitle>
  <el-form label-width="120px" ref="formRef" :model="fact" :rules="rules">

    <el-space direction="horizontal" style="display:flex;" wrap size="large">
      <el-tooltip class="item" placement="top-end">
        <template #content><span v-html="loc('techtimetip')"></span></template>
        <el-form-item prop="stamp">
          <el-date-picker v-model="fact.stamp" format="YYYY.MM.DD HH:mm" type="datetime" :placeholder="loc('techtime')" :shortcuts="shortcuts"></el-date-picker>
        </el-form-item>
      </el-tooltip>

      <el-form-item prop="acts">
        <el-cascader v-model="fact.acts"
                     :options="db.acts"
                     clearable
                     filterable
                     :props="{ emitPath: false, multiple: true, value: 'id', label: 'title' }"
                     :placeholder="loc('acts')"></el-cascader>
      </el-form-item>

      <el-form-item :label="loc('agent')">
        <el-select v-model="fact.agent" filterable :placeholder="loc('agent')">
          <el-option v-for="item in db.persons"
                     :key="item.id"
                     :label="item.value"
                     :value="item.id">
          </el-option>
        </el-select>
        <el-button type="primary"
                   @click="setDefaultAuthor"
                   v-if="db.persons.length && mainperson">{{db.persons.filter(x=>x.id === mainperson)[0].value}}</el-button>
        <el-button type="primary" @click="fact.agent = null">{{loc('noagent')}}</el-button>
      </el-form-item>

    </el-space>

    <el-form-item :label="loc('date')">
      <el-input placeholder="10.05.1928" v-model="fact.datedesc" class="text-input"></el-input>
    </el-form-item>

    <el-form-item :label="loc('place')">
      <el-input placeholder="..." v-model="fact.place"></el-input>
    </el-form-item>

    <el-form-item prop="title" :label="loc('desc')">
      <el-input type="textarea" autosize
                :placeholder="loc('desctip')"
                v-model="fact.title">
      </el-input>
    </el-form-item>

    <el-form-item :label="loc('rels')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-select v-model="fact.persons1" filterable multiple :placeholder="loc('prtcpnts')">
          <el-option v-for="item in db.persons"
                     :key="item.id"
                     :label="item.value"
                     :value="item.id"
                     :disabled="item.disabled">
          </el-option>
        </el-select>
        <el-select v-model="fact.persons2" filterable multiple :placeholder="loc('ments')">
          <el-option v-for="item in db.persons"
                     :key="item.id"
                     :label="item.value"
                     :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="fact.works" multiple filterable :placeholder="loc('works')">
          <el-option v-for="item in db.works"
                     :key="item.id"
                     :label="item.title"
                     :value="item.id">
          </el-option>
        </el-select>
        <el-select v-model="fact.books" multiple filterable :placeholder="loc('books')">
          <el-option v-for="item in db.books"
                     :key="item.id"
                     :label="item.title"
                     :value="item.id">
          </el-option>
        </el-select>
      </el-space>
    </el-form-item>

    <el-form-item :label="loc('fact')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-select v-model="fact.relfact" clearable filterable :placeholder="loc('fact')">
          <el-option v-for="item in db.facts"
                     :key="item.id"
                     :label="item.title"
                     :value="item.id"
                     :disabled="item.disabled">
          </el-option>
        </el-select>
        <el-input :placeholder="loc('relfacttype')" v-model="fact.relfacttype" class="text-input"></el-input>
      </el-space>
    </el-form-item>

    <el-form-item :label="loc('note')">
      <el-input type="textarea" autosize
                placeholder="..."
                v-model="fact.comment">
      </el-input>
    </el-form-item>
    <el-form-item :label="loc('sources')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-button type="primary" @click="dialogVisible=true;">{{loc('select')}}</el-button>
        <div v-if="fact.refs?.length">{{loc('seld')}}: {{fact.refs.length}}</div>
      </el-space>
    </el-form-item>
    <!-- :on-preview="handlePreview"
                 :on-remove="handleRemove"
                 :file-list="fileList" -->
    <!--
        <el-form-item :label="loc('medfile')">
          <el-upload
                    class="upload-demo"
                    drag
                    action="https://jsonplaceholder.typicode.com/posts/"
                    multiple
                    >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">{{loc('dragfile')}} {{loc('or')}} <em>{{loc('clickload')}}</em></div>
                    <template #tip>
                       <div class="el-upload__tip">
                          {{loc('uploadtip')}}
                       </div>
                    </template>
                 </el-upload>
        </el-form-item>
         -->
    <!-- <el-button type="primary" @click="confirm">{{loc('save')}}</el-button> -->

    <el-popconfirm v-if="fact?.id"
                   :title="loc('confirmdel')"
                   :confirmButtonText="loc('yes')"
                   :cancelButtonText="loc('no')"
                   @confirm="deleteFact">
      <template #reference>
                <el-button type="danger">{{loc('remove')}}</el-button>
                </template>
    </el-popconfirm>

  </el-form>
  <el-dialog :title="loc('sources')"
             v-model="dialogVisible"
             width="500px"
             :before-close="handleClose"
             @opened="dialogOpened">
    <References :isEmbedded="true" ref="bibRef"></References>
    <template #footer>
              <span class="dialog-footer">
                 <el-button @click="handleClose">{{loc('cancel')}}</el-button>
                 <el-button type="primary" @click="handleClose(true)">{{loc('confirm')}}</el-button>
              </span>
             </template>
  </el-dialog>

</template>
<script lang="ts">

  import { ElForm } from 'element-plus';
  import { defineComponent, onBeforeMount, ref, reactive } from 'vue';
  import store from '../store';
  import References from './References.vue';
  import { useRoute } from 'vue-router';
  import router from '../router';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const vuerouter = useRoute();
      const id = vuerouter.params.id;
      const fact = reactive({
        works: [],
        persons1: [],
        persons2: [],
        books: [],
        acts: [],
        datedesc: '',
        title: '',
        stamp: null,
        agent: null,
        media: null,
        refs: [],
        relfact: null,
        relfacttype: '',
      });
      const db = reactive({ persons: [], works: [], books: [], acts: [], facts: [] });
      const dialogVisible = ref(false);
      const bibRef = ref(null);

      const shortcuts = [
        {
          text: '1920',
          value: (() => new Date(1920, 1, 1, 12, 0, 0))(),
        },
        {
          text: '1940',
          value: (() => new Date(1940, 1, 1, 12, 0, 0))(),
        },
        {
          text: '1960',
          value: (() => new Date(1960, 1, 1, 12, 0, 0))(),
        },
      ];

      onBeforeMount(async () => {
        // console.log('router id', id);
        if (id) {
          const { data } = await store.getData('facts', id);
          if (data?.length) {
            Object.assign(fact, data[0]);
            // const dt  = new Date(fact.stamp);
            // dt.setMinutes( dt.getMinutes() - dt.getTimezoneOffset() );
            // fact.stamp = dt.toISOString();
            // console.log('stamp', fact.stamp);
            // timestamp = fact.stamp;
          }
        }

        const names = Object.keys(db);
        await Promise.all(names.map(async x => store.getData(x))).then(v => v.forEach((x, i) => (db[names[i]] = x.data)));

        // fact.agent = fact.agent || store.state.user.settings.persona;
        db.persons = db.persons.map(x => ({
          ...x,
          value: x.firstname + ' ' + x.lastname,
          disabled: Boolean(x.id == store.state.user.settings.persona),
        }));
        // console.log(db.persons);
        if (id) {
          db.facts = db.facts.map(x => ({
            title: x.title,
            id: x.id,
            disabled: Boolean(x.id == id),
          }));
          // console.log('id', id, db.facts);
        }
        db.acts = store.nest(db.acts);

        // console.log('DATA', db);
      });

      const handleClose = () => {
        // console.log("close", e);
        fact.refs = bibRef.value.getCheckedItems();
        // console.log('keys', fact.refs);
        dialogVisible.value = false;
      };

      const deleteFact = async (id, key) => {
        const { data } = await store.deleteById('facts', fact.id);
        if (data?.id) {
          router.push('/facts');
        }
      };

      const dialogOpened = () => {
        bibRef.value.setCheckedItems(fact.refs);
      };

      const rules = {
        acts: [{ required: true, message: store.loc('selact'), trigger: 'change' }],
        stamp: [{ required: true, message: store.loc('setts'), trigger: 'change' }],
        title: [{ required: true, message: store.loc('filldesc'), trigger: 'blur' }],
      };

      const confirm = async () => {
        formRef.value?.validate(async valid => {
          // console.log('valid', valid);
          if (valid) {
            const datum = { ...fact };
            if (datum.stamp && typeof datum.stamp === 'object') {
              datum.stamp = store.dateDropTimeZone(fact.stamp);
              // console.log('DROPPED', datum.stamp);
            }
            // console.log('save:', datum);
            const { data } = await store.postData('facts', datum);

            // if(fact.id != data?.id) {
            //    router.replace("/fact/"+data.id);
            //    fact.id = data.id;
            // }

            if (data?.id) {
              // console.log("ajax save ok", data.id);
              router.push('/facts');
            } else {
              console.log('error!');
            }
          }
        });
      };

      const setDefaultAuthor = () => {
        fact.agent = store.state.user.settings.persona;
      };

      return {
        db,
        bibRef,
        confirm,
        fact,
        shortcuts,
        dialogVisible,
        handleClose,
        dialogOpened,
        rules,
        formRef,
        deleteFact,
        mainperson: store.state.user.settings.persona,
        setDefaultAuthor,
        loc: store.loc,
      };
    },
    components: {
      MainTitle,
      References,
    },
  });

</script>
