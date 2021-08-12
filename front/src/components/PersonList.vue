<template>

  <MainTitle :title="loc('persons')" :callback="confirm"></MainTitle>

  <el-form label-width="120px" ref="formRef" :model="form" :inline="true" :rules="rules">

    <el-form-item prop="firstname">
      <el-input :placeholder="loc('firstname')" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="patroname">
      <el-input :placeholder="loc('patroname')" v-model="form.patroname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname">
      <el-input :placeholder="loc('lastname')" v-model="form.lastname"></el-input>
    </el-form-item>

    <el-form-item prop="wikidata">
      <el-input :placeholder="loc('wikidata')" prop="wikidata" v-model="form.wikidata" class="text-input" style="max-width:110px;"></el-input>
    </el-form-item>

    <el-form-item>
      <el-radio-group v-model="form.sex">
        <el-radio label="1">{{loc('man')}}</el-radio>
        <el-radio label="2">{{loc('woman')}}</el-radio>
      </el-radio-group>
    </el-form-item>

  </el-form>

  <el-row type="flex" justify="center">

    <el-input :placeholder="loc('filternames')"
              v-model="filterString"
              style="max-width: 280px;"
              clearable>
    </el-input>

  </el-row>

  <el-row v-for="(value, key) in filtered()" :gutter="20" :key="key">

    <el-col :span="4">
      <div class="grid-content bg-purple"><i :class="value.sex === 1 ? 'el-icon-male' : 'el-icon-female'"></i> {{value.firstname}}</div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple-light">{{value.patroname}}</div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">{{value.lastname}}</div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple-light">{{value.wikidata||'&nbsp;'}}</div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple">
        <router-link :to="'/person/' + value.id">
          <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
        </router-link>
      </div>
    </el-col>

    <el-col :span="4">
      <div class="grid-content bg-purple-light">
        <!-- <el-button type="primary" @click="confirm">{{loc('remove')}}</el-button> -->
        <el-popconfirm :title="loc('confirmdel')"
                       :confirmButtonText="loc('yes')"
                       :cancelButtonText="loc('no')"
                       @confirm="deletePerson(value.id, key)">
          <template #reference>
                    <el-button>{{loc('remove')}}</el-button>
                    </template>
        </el-popconfirm>
      </div>
    </el-col>

  </el-row>

</template>

<script lang="ts">

  import { ElForm } from 'element-plus';
  import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const form = reactive({ firstname: '', lastname: '', patroname: '', sex: '1', wikidata: '' });
      const persons = reactive([]);
      const filterString = ref('');

      onBeforeMount(async () => {
        const { data } = await store.getData('persons');
        if (data) {
          persons.push(...data.sort((a, b) => b.id - a.id));
        }
      });

      const deletePerson = async (id, key) => {
        const { data } = await store.deleteById('persons', id);
        if (data && 'id' in data) {
          // console.log('deleted', id);
          persons.splice(key, 1);
        }
      };

      const resetForm = () => {
        formRef.value?.resetFields();
      };

      const confirm = () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            const { data } = await store.postData('persons', form);
            // console.log(result);
            if (data && 'id' in data) {
              persons.unshift({ ...form });
              // console.log('success', persons);
              formRef.value?.resetFields();
            }
          } else {
            // console.log('form not valid');
            return false;
          }
        });
      };

      const rules = {
        firstname: [
          { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
          { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
        ],
        lastname: [
          { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
          { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
        ],
        patroname: [
          { required: false, message: store.loc('fieldnonempty'), trigger: 'blur' },
          { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
        ],
      };

      const filtered = () => {
        const re = new RegExp(filterString.value, 'i');
        return filterString.value
          ? persons.filter(
              x => x.firstname.search(re) !== -1 || x.lastname.search(re) !== -1 || x.patroname.search(re) !== -1
            )
          : persons;
      };

      return {
        deletePerson,
        resetForm,
        confirm,
        formRef,
        form,
        persons,
        rules,
        filterString,
        filtered,
        loc: store.loc,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
