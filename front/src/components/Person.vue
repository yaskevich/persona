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
            <el-dropdown-menu v-for="rel in data.reltypes">
              <el-dropdown-item :command="rel.id">{{ rel?.name1 }}</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button-group style="margin-left:10px" v-for="(item, index) in relships">
          <el-tooltip placement="top-end">
            <template #content>
              {{ getRelation(data.reltypes[item.rel_id], data.persons?.[item.member1],
    data.persons?.[item.member2]) }}</template>
            <el-button type="primary" link icon="el-icon-share" />
          </el-tooltip>
          <el-popconfirm :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
            :cancelButtonText="store.loc('no')" @confirm="removeRelation(item, index)">
            <template #reference>
              <el-button type="danger" link icon="el-icon-delete" />
            </template>
          </el-popconfirm>
        </el-button-group>
        <!-- <el-button icon="el-icon-share" link type="primary" style="margin-left: 5px;"></el-button> -->
        <!-- <el-button type="danger" v-if="relships.length" plain>
            {{ store.loc('remove') }}<el-icon class="el-icon--right"><el-icon-arrow-down /></el-icon>
          </el-button> -->
      </el-col>
      <el-col>
        <el-tooltip placement="top-end" v-if="newRel?.rel_id">
          <template #content>{{ store.loc('flip') }}</template>
          <el-button :plain="isFlipped" icon="el-icon-switchfilled" style="margin-top: 1rem;margin-bottom: 1rem;"
            type="success" @click="swapMembers"> {{
    store.renderRelations(data.reltypes[newRel.rel_id], isFlipped) }}
          </el-button>
        </el-tooltip>

        <template v-if="newRel?.rel_id">
          <el-select-v2 v-model="relatedPerson" filterable :placeholder="store.loc('person')" :options="persons"
            @change="selectPerson" />
          <el-tag effect="plain" type="info" v-if="relatedPerson">
            {{ data.persons[relatedPerson].firstname }} {{ data.persons[relatedPerson].lastname }} &ndash; {{
    data.reltypes[newRel?.rel_id]?.[isFlipped ? 'name1' : 'name2'] }}</el-tag> <el-tag effect="plain"
            type="info"> {{ person.firstname }}
            {{ person.lastname }} &ndash; {{
    data.reltypes[newRel?.rel_id]?.[isFlipped ? 'name2' : 'name1'] }}
          </el-tag>
        </template>
      </el-col>
      <el-col>
        <el-button size="small" type="warning" plain v-if="relatedPerson" @click="addRelation">Confirm</el-button>
        <el-button size="small" type="primary" plain v-if="relatedPerson" @click="clearRelation">Cancel</el-button>
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
import { onBeforeMount, ref, reactive } from 'vue';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';

let person = ref({} as IPerson);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const idNum = Number(id);

const data = reactive({ 'reltypes': {} as keyable, persons: {} as keyable });
const relatedPerson = ref<number>();
const persons = ref<Array<IPerson>>([]);
const relships = ref<Array<IRelship>>([]);
const newRel = ref<IRelship>();
const isLoaded = ref(false);
const isFlipped = ref(false);

const getRelation = (rel: IRelation, person1: IPerson, person2: IPerson) => `${store.getLabel(person1)} (${rel.name1}) ${rel.bilateral ? '⟺' : '⟹'} ${store.getLabel(person2)} (${rel.name2})`;

const selectPerson = () => {
  // console.log('select!', relatedPerson.value);
  if (relatedPerson.value) {
    const member = isFlipped.value ? 'member1' : 'member2';
    if (newRel?.value) {
      newRel.value[member] = relatedPerson.value;
    }
  }
};

const removeRelation = async (relship: IRelship, num: number) => {
  const result = await store.deleteRelation(relship);
  console.log('RM', relship, num, result?.data);
  if (result?.data === 1) {
    relships.value.splice(num, 1);
  }
};

const swapMembers = () => {
  isFlipped.value = !isFlipped.value;
  if (newRel?.value) {
    newRel.value.member2 = [newRel.value.member1, newRel.value.member1 = newRel.value.member2][0];
  }
  // console.log('flip', newRel.value);
};

const handleCommand = (command: string | number | object) => {
  newRel.value = {
    rel_id: Number(command),
    member1: isFlipped.value ? relatedPerson.value : idNum,
    member2: isFlipped.value ? idNum : relatedPerson.value,
  } as any;
  // console.log(`relation type ${command}`, newRel.value, isFlipped.value, relatedPerson.value);
};

const clearRelation = () => {
  (relatedPerson.value as any) = null;
  (newRel.value as any) = {} as IRelship;
};

const addRelation = async () => {
  // console.log(newRel.value);
  if (newRel?.value) {
    relships.value.push(newRel.value);
    const result = await store.postData('relations', newRel.value);
    if (result?.data === 1) {
      clearRelation();
    } else {
      console.log("error", result);
    }
  }
};

onBeforeMount(async () => {
  await store.getDataMulti(data, { 'reltypes': 'id', persons: 'id' }, {}, {});

  if (id) {
    person.value = data.persons[id];

    const result = await store.getData('relations', id);
    relships.value = result.data;
  }

  persons.value = Object.values(data.persons).map((x: IPerson) => ({
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
  // router.push('/persons');
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
