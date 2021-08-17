<template>

  <MainTitle :title="loc('settings')" :callback="confirm" :text="loc('save')"></MainTitle>
  <el-form label-width="220px" :model="settings" ref="formRef" :rules="rules">

    <el-form-item :label="loc('mainperson')">
      <el-select v-model="settings.mainperson" filterable :placeholder="loc('persons')">
        <el-option v-for="item in persons"
                   :key="item.id"
                   :label="item.value"
                   :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item prop="title" :label="loc('projtitle')">
      <el-input placeholder="..." v-model="settings.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lang" :label="loc('lang')">
      <el-select v-model="settings.lang" :placeholder="loc('lang')">
        <el-option v-for="(item, key) in langs"
                   :key="key"
                   :label="item"
                   :value="key">
        </el-option>
      </el-select>
    </el-form-item>

  </el-form>

</template>

<script lang="ts">

  import { onBeforeMount, ref, reactive } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default {
    name: 'Settings',

    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      let persons = ref([]);
      const settings = reactive({});

      onBeforeMount(async () => {
        const personsData = await store.getData('persons');
        persons.value = personsData.data.map(x => ({ ...x, value: x.firstname + ' ' + x.lastname }));
        // console.log(persons);
        Object.assign(settings, store.state.user.settings);
      });

      const confirm = () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            // console.log('save:', settings.value);
            Object.assign(store.state.user.settings, settings);
            const result = await store.postData('settings', settings);
            if (!('data' in result && 'id' in result.data)) {
              console.log('error', result);
            }
          } else {
            console.log('form not valid');
            return false;
          }
        });
      };

      const rules = {
        title: [{ required: true, message: store.loc('fieldnonempty'), trigger: 'blur' }],
      };

      return { confirm, settings, persons, rules, formRef, loc: store.loc, langs: store.langs };
    },
    components: {
      MainTitle,
    },
  };

</script>
