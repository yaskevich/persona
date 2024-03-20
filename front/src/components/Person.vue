<template>
  <MainTitle :title="store.loc('person') + ' ' + $route.params.id" :callback="confirm" :text="store.loc('save')">
  </MainTitle>

  <el-form label-width="120px" v-model="person" v-if="isLoaded">
    <el-form-item prop="firstname" :label="store.loc('firstname')">
      <el-input :placeholder="store.loc('firstname')" v-model="person.firstname" class="text-input"
        prop="firstName"></el-input>
    </el-form-item>
    <el-form-item prop="patroname" :label="store.loc('patroname')">
      <el-input :placeholder="store.loc('patroname')" v-model="person.patroname" class="text-input"></el-input>
    </el-form-item>
    <el-form-item prop="lastname" :label="store.loc('lastname')">
      <el-input :placeholder="store.loc('lastname')" v-model="person.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="wikidata" :label="store.loc('wikidata')">
      <el-input :placeholder="store.loc('wikidata')" v-model="person.wikidata" class="text-input"></el-input>
    </el-form-item>

    <el-form-item :label="store.loc('relations')">
      <el-col :span="24">
        <el-dropdown @command="handleCommand">
          <el-button type="primary" plain>
            {{ store.loc('add') }}<el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu v-for="(rel, index) in rels.reltypes">
              <el-dropdown-item :command="rel.id">{{ rel?.name1 }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </el-col>
      <el-col>
        <el-tooltip placement="top-end" v-if="newRel?.rel_id">
          <template #content>{{ store.loc('flip') }}</template>
          <el-button icon="el-icon-switchfilled" style="margin-top: 1rem;margin-bottom: 1rem;" type="success"
            @click="addRelation"> {{
    store.renderRelations(rels.reltypes[newRel.rel_id]) }}
          </el-button>
        </el-tooltip>

        <template v-if="newRel?.rel_id">
          <el-select-v2 v-model="relatedPerson" filterable :placeholder="store.loc('person')" :options="persons" />
          <el-tag effect="plain" type="info" v-if="relatedPerson">
            {{ rels.persons[relatedPerson].firstname }} {{ rels.persons[relatedPerson].lastname }} &ndash; {{
    rels.reltypes[newRel?.rel_id]?.name2 }}</el-tag> <el-tag effect="plain" type="info"> {{ person.firstname }}
            {{ person.lastname }} &ndash; {{
    rels.reltypes[newRel?.rel_id]?.name1 }}
          </el-tag>
        </template>
      </el-col>
      <el-col>
        <el-button size="small" type="warning" plain v-if="relatedPerson" @click="addRelation">Confirm</el-button>
        <el-button size="small" type="primary" plain v-if="relatedPerson" @click="addRelation">Cancel</el-button>
      </el-col>
    </el-form-item>


    <el-form-item prop="note" :label="store.loc('note')">
      <el-input :placeholder="store.loc('note')" v-model="person.note" class="text-input"></el-input>
    </el-form-item>
    <!-- <el-form-item :label="loc('sex')"> -->
    <el-form-item>
      <el-radio-group v-model="person.sex">
        <el-radio :value="1">{{ store.loc('man') }}</el-radio>
        <el-radio :value="2">{{ store.loc('woman') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item>
      <el-popconfirm :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
        :cancelButtonText="store.loc('no')" @confirm="deletePerson(person.id)">
        <template #reference>
          <el-button type="danger">{{ store.loc('remove') }}</el-button>
        </template>
      </el-popconfirm>
      <el-button type="primary" @click="confirm">{{ store.loc('save') }}</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { onBeforeMount } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';

let person = ref({} as IPerson);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const rels = reactive({ 'reltypes': {} as keyable, persons: {} as keyable });
const relatedPerson = ref<number>();
const persons = ref<Array<IPerson>>([]);
const newRel = ref<IRelship>();
const isLoaded = ref(false);

const handleCommand = (command: string | number | object) => {
  console.log(`click on item ${command}`)
  newRel.value = { rel_id: Number(command), persons: [Number(id)], main: Number(id) };
};

const addRelation = () => {
  if (relatedPerson.value) {
    newRel.value?.persons.push(relatedPerson.value);
  }
  console.log(newRel.value);
};

onBeforeMount(async () => {
  await store.getDataMulti(rels, { 'reltypes': 'id', persons: 'id' }, {}, {});

  if (id) {
    person.value = rels.persons[id];
  }

  const idNum = Number(id);
  persons.value = Object.values(rels.persons).map((x: IPerson) => ({
    label: store.getLabel(x, true),
    value: x.id,
    disabled: x.id == idNum,
  })) as any;

  isLoaded.value = true;

});

const confirm = async () => {
  // form.validate();
  // console.log('save:', person.value);
  const result = await store.postData('persons', person.value);
  if (!('data' in result && 'id' in result.data)) {
    console.log("error", result);
  }
  router.push('/persons');
};

const deletePerson = async (id: number) => {
  const { data } = await store.deleteById('persons', id);
  if (data && 'id' in data) {
    console.log('deleted', id);
    router.push('/persons');
    // persons.splice(key, 1);
  }
};


</script>
