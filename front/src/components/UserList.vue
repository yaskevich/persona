<template>
  <div>
    Пользователи
  </div>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="firstname">
      <el-input placeholder="Имя" v-model="form.firstname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="lastname">
      <el-input placeholder="Фамилия" v-model="form.lastname" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="email">
      <el-input placeholder="Эл. почта" v-model="form.email" class="text-input"></el-input>
    </el-form-item>


    <el-form-item>
      <el-radio-group v-model="form.sex">
        <el-radio label="1">Мужчина</el-radio>
        <el-radio label="2">Женщина</el-radio>
      </el-radio-group>
    </el-form-item>

<el-form-item>
  <el-select v-model="form.privs" placeholder="Select" value-key>
  <el-option
    v-for="item in options"
    :key="item.value"
    :label="item.label"
    :value="item.value">
  </el-option>
</el-select>

</el-form-item>

    <el-button type="primary" @click="resetForm">Очистить</el-button>
    <el-button type="primary" @click="confirm">Добавить</el-button>
  </el-form>

  <el-row v-for="(value, key) in users"  :gutter="20" :key="key">
    {{value.firstname}} // {{value.lastname}}
  </el-row>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();

    const users = reactive([]);
    const firstRun = ref(true);


    onBeforeMount(async() => {
      axios.get('/api/get/users').then((response) => {
        console.log("data", response.data);
        if (response.data && Object.keys(response.data).length) {
        users.push(...response.data);
        firstRun = false;
        }
      })
    })

    const options = [{
          value: 1,
          label: 'Администратор (жрец)'
        }, {
          value: 3,
          label: 'Модератор (воин)'
        }, {
          value: 5,
          label: 'Редактор (крестьянин)'
        }
      ];


    const handleClick = (e) => {
      console.log(e);
    };
    const resetForm = () => {
      formRef.value?.resetFields();
    };
    const confirm = () => {
      formRef.value?.validate((valid) => {

        if (valid) {
          // do
          console.log("ok send", form);
          // return false;

          axios.post('/api/user/add', form)
            .then(function (response) {
              console.log("add user", response);
              // users.unshift({...form});
              // formRef.value?.resetFields();
            })
            .catch(function (error) {
              console.log(error);
            });

        }  else{
          return false;
        }
      });
    };
    const form  = reactive({ firstname: '', lastname: '', email: '', sex : '2', privs: firstRun.value ? 1 : 5});
    const  rules = {
      firstname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      lastname: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
       email: [
           { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
         { type: 'email', message: 'Please input correct email address', trigger: ['blur', 'change'] }
       ]
    };

    return {
      handleClick,
      options,
      resetForm,
      confirm,
      formRef,
      rules,
      form,
      users
    };
  },
});
</script>
