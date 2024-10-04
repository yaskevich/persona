<template>
  <MainTitle :title="loc('fact') + ' ' + vuerouter.params.id" :callback="confirm" :text="loc(fact.id ? 'save' : 'add')">
  </MainTitle>
  <el-form v-show="isLoaded" label-width="120px" ref="formRef" :model="fact" :rules="rules">

    <el-space direction="horizontal" style="display:flex;" wrap size="large">

      <el-tooltip class="item" placement="top-end">
        <template #content><span v-html="loc('techtimetip')"></span></template>
        <el-form-item prop="stamp">
          <el-date-picker v-model="(fact.stamp as any)" format="YYYY.MM.DD HH:mm" type="datetime"
            :placeholder="loc('techtime')" :shortcuts="shortcuts"></el-date-picker>
        </el-form-item>
      </el-tooltip>

      <el-form-item prop="acts">
        <el-cascader v-model="fact.acts" :options="db.acts" clearable filterable
          :props="{ emitPath: false, multiple: true, value: 'id', label: 'title' }"
          :placeholder="loc('acts')"></el-cascader>
      </el-form-item>

      <el-form-item :label="loc('agent')">
        <el-space :wrap="true">
          <el-select-v2 class="wide-select" v-model="(fact.agent as any)" filterable :placeholder="loc('agent')"
            :options="db.persons">
            <!-- <el-option v-for="item in db.persons" :key="item.id" :label="store.getLabel(item, true)" :value="item.id">
            </el-option> -->
          </el-select-v2>
          <el-button type="primary" @click="setDefaultAuthor" v-if="db.persons.length && mainperson">{{
    db.persons.find((x: any) => x.value === mainperson)?.label }}</el-button>
          <el-button type="info" @click="fact.agent = null">{{ loc('noagent') }}</el-button>
        </el-space>
      </el-form-item>

    </el-space>

    <el-form-item :label="loc('date')">
      <el-input placeholder="10.05.1928" v-model="fact.datedesc" class="text-input"></el-input>
    </el-form-item>

    <el-form-item :label="loc('place')">
      <el-input placeholder="..." v-model="fact.place"></el-input>
    </el-form-item>

    <el-form-item prop="title" :label="loc('desc')">
      <el-input type="textarea" autosize :placeholder="loc('desctip')" v-model="fact.title">
      </el-input>
    </el-form-item>

    <el-form-item :label="loc('rels')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-select-v2 v-model="fact.persons1" filterable multiple :placeholder="loc('prtcpnts')" class="wide-select"
          :options="db.persons">
          <!-- <el-option v-for="item in db.persons" :key="item.id" :label="store.getLabel(item, true)" :value="item.id"
            :disabled="item.disabled"> -->
          <!-- </el-option> -->
        </el-select-v2>
        <el-select-v2 v-model="fact.persons2" filterable multiple :placeholder="loc('ments')" class="wide-select"
          :options="db.persons">
          <!-- <el-option v-for="item in db.persons" :key="item.id" :label="store.getLabel(item, true)" :value="item.id"> -->
          <!-- </el-option> -->
        </el-select-v2>
        <el-select-v2 v-model="fact.works" multiple filterable :placeholder="loc('works')" class="wide-select"
          :props="{ 'value': 'id', 'label': 'title' }" :options="db.works">
          <!-- <el-option v-for="item in db.works" :key="item.id" :label="item.title" :value="item.id">
          </el-option> -->
        </el-select-v2>
        <el-select v-model="fact.books" multiple filterable :placeholder="loc('books')" class="wide-select">
          <el-option v-for="item in db.books" :key="item.id" :label="item.title" :value="item.id">
          </el-option>
        </el-select>
      </el-space>
    </el-form-item>

    <!-- <el-form-item :label="loc('fact')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-select v-model="(fact.relfact as any)" clearable filterable :placeholder="loc('fact')" class="wide-select">
          <el-option v-for="item in db.facts" :key="item.id" :label="item.id + ': ' + item.title.slice(0, 48)"
            :value="String(item!.id)" :disabled="item.disabled">
          </el-option>
        </el-select>
        <el-input :placeholder="loc('relfacttype')" v-model="fact.relfacttype" class="text-input"></el-input>
      </el-space>
    </el-form-item> -->

    <el-form-item :label="loc('note')">
      <el-input type="textarea" autosize placeholder="..." v-model="fact.comment">
      </el-input>
    </el-form-item>
    <el-form-item :label="loc('sources')">
      <el-space direction="horizontal" style="display:flex;" wrap size="large">
        <el-button type="primary" @click="dialogVisible = true;">{{ loc('select') }}</el-button>
        <div v-if="fact.refs?.length">{{ loc('seld') }}: {{ fact.refs.length }}</div>
      </el-space>
    </el-form-item>

    <!-- <el-button type="primary" @click="confirm">{{loc('save')}}</el-button> -->

    <el-popconfirm v-if="fact?.id" :title="loc('confirmdel')" :confirmButtonText="loc('yes')"
      :cancelButtonText="loc('no')" @confirm="deleteFact">

      <template #reference>
        <el-button type="danger">{{ loc('remove') }}</el-button>
      </template>
    </el-popconfirm>

  </el-form>
  <el-dialog :title="loc('sources')" v-model="dialogVisible" width="500px" :before-close="handleClose"
    @opened="dialogOpened">
    <References :isEmbedded="true" ref="bibRef"></References>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">{{ loc('cancel') }}</el-button>
        <el-button type="primary" @click="handleCloseBib(true)">{{ loc('confirm') }}</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">

import { ElForm, ElTooltip, FormInstance, FormRules } from 'element-plus';
import { onBeforeMount, ref, reactive } from 'vue';
import store from '../store';
import References from './References.vue';
import { useRoute } from 'vue-router';
import router from '../router';
import MainTitle from './MainTitle.vue';

const formRef = ref<FormInstance>();
const vuerouter = useRoute();
const id = Number(vuerouter.params.id);
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
  place: '',
  comment: ''
} as IFact);
const db = reactive({ persons: [] as Array<IPerson>, works: [] as Array<IWork>, books: [] as Array<IBook>, acts: [] as Array<IAct>, }) as keyable; // facts: [] as Array<IFact>
const dialogVisible = ref(false);
const bibRef = ref<InstanceType<typeof References>>();
const mainperson = store?.state?.user?.settings?.mainperson;
const loc = store.loc;
const isLoaded = ref(false);

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
  db.persons = db.persons.map((x: IPerson) => ({
    label: store.getLabel(x, true),
    value: x.id,
    disabled: Boolean(x.id == store?.state?.user?.settings.mainperson),
  }));

  // if (id) {
  //   db.facts = db.facts.map((x: IFact) => ({ ...x, disabled: x.id == id, }));
  // }
  db.acts = store.nest(db.acts);
  isLoaded.value = true;
});

const handleClose = () => {
  dialogVisible.value = false;
};

const handleCloseBib = (val?: boolean) => {
  // console.log("close", e);
  if (val) {
    fact.refs = bibRef.value!.getCheckedItems() as number[];
  }
  handleClose();
};


const deleteFact = async () => {
  const { data } = await store.deleteById('facts', String(fact.id));
  if (data?.id) {
    router.push('/facts');
  }
};

const dialogOpened = () => bibRef.value?.setCheckedItems(fact.refs || []);

const rules = {
  acts: [{ required: true, message: store.loc('selact'), trigger: 'change' }],
  stamp: [{ required: true, message: store.loc('setts'), trigger: 'change' }],
  title: [{ required: true, message: store.loc('filldesc'), trigger: 'blur' }],
};

const confirm = async () => {
  formRef.value?.validate(async (valid: boolean) => {
    // console.log('valid', valid);
    if (valid) {
      const datum = { ...fact } as any;
      if (datum.stamp && typeof datum.stamp === 'object' && fact?.stamp) {
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
  if (mainperson) {
    fact.agent = mainperson;
  }
};

</script>
