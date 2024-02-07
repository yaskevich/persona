<template>
  <el-row type="flex" justify="center" v-if="rights">
    {{ form.firstname }} {{ form.lastname }} ● {{ rights }}
  </el-row>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="firstname" :label="store.loc('firstname')">
      <el-input :placeholder="store.loc('firstname')" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname" :label="store.loc('lastname')">
      <el-input :placeholder="store.loc('lastname')" v-model="form.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="email" :label="store.loc('email')">
      <el-input :placeholder="store.loc('email')" v-model="form.email" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="sex">
      <el-radio-group v-model="form.sex">
        <el-radio :label="1">{{ store.loc('man') }}</el-radio>
        <el-radio :label="2">{{ store.loc('woman') }}</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-alert v-if="infoAlert" :title="infoAlert" :center="true" type="error" effect="dark">
    </el-alert>
    <el-button v-else type="primary" @click="confirm">{{ store.loc(isRegistered ? 'save' : 'subreq') }}</el-button>

  </el-form>
</template>

<script setup lang="ts">

import { ElForm, ElMessageBox } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { ref, reactive, onBeforeMount, h } from 'vue';
import store from '../store';

const formRef = ref<FormInstance>();
const users = ref([]);
const form = reactive({} as IUser);
const isRegistered = ref(Boolean(Object.keys(store?.state?.user as any)?.length));
let rights: string;
const infoAlert = ref('');

if (isRegistered.value) {
  Object.assign(form, store.state.user);
  const level = String(form.privs);
  if (['1', '3', '5'].includes(level) && store.privs?.[level as keyof typeof store.privs]) {
    rights = store.loc(store.privs[level as keyof typeof store.privs]);
  }
}

onBeforeMount(async () => {
  // console.log(store.state.user);
  if (isRegistered.value) {
    const result = await store.getData('users');
    if ('data' in result) {
      // console.log(result.data);
      users.value = result.data;
    }
  }
});

const confirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      if (isRegistered.value) {
        const result = await store.postData('users', form);
        if ('data' in result && 'id' in result.data) {
          Object.assign(store.state.user as any, form);
        }
      } else {
        const result = await store.initUser(form);
        if ('data' in result) {
          if ('error' in result.data) {
            infoAlert.value = result.data.error;
          } else if ('message' in result.data) {
            ElMessageBox({
              message: h('div', null, [
                h('p', null, [h('span', null, store.loc('regmsg'))]),
                h('p', null, [h('b', { style: 'color: teal' }, result.data.message)]),
              ]),
              title: store.loc('subreqd'),
              type: 'success',
              showClose: true,
              center: true,
            });
            formRef.value?.resetFields();
          }
        }
      }
    } else {
      console.log('form not valid');
      return false;
    }
  });
};

const rules = <FormRules<IRuleFormProfile>>{
  firstname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  lastname: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
  ],
  email: [
    { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
    { type: 'email', message: store.loc('fieldemail'), trigger: ['blur', 'change'] },
  ],
  sex: [{ required: true, message: store.loc('fieldsex'), trigger: 'change' }],
};

</script>
