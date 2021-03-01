<template>
  <div>
    Пользователи
  </div>
  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="title">
      <el-input placeholder="Имя" v-model="form.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="genre">
      <el-input placeholder="Фамилия" v-model="form.genre" class="text-input"></el-input>
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

<el-form-item prop="privs">
  <el-select v-model="form.priv" placeholder="Select" value-key>
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

  <el-row v-for="(value, key) in works"  :gutter="20" :key="key">
    {{value.title}} // {{value.genre}}
  </el-row>
</template>

<script lang="ts">
// import { ElForm } from 'element-plus';
import { defineComponent, ref, reactive, onBeforeMount } from 'vue';
import axios from 'axios';

export default defineComponent({
  setup() {
    const formRef = ref<InstanceType<typeof ElForm>>();

    const works = reactive([]);


    onBeforeMount(async() => {
      axios.get('/api/get/works').then((response) => {
        console.log(response.data);
        works.push(...response.data);
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
        console.log("here", priv.value);
        if (valid) {
          // do

          // return false;

          // axios.post('/api/work/add', form)
          //   .then(function (response) {
          //     console.log(response);
          //     works.unshift({...form});
          //     formRef.value?.resetFields();
          //   })
          //   .catch(function (error) {
          //     console.log(error);
          //   });

        }  else{
          return false;
        }
      });
    };
    const form  = reactive({ title: '', genre: '', email: '', sex : '2', priv: 5});
    const  rules = {
      title: [
        { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
        { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' }
      ],
      genre: [
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
      works
    };
  },
});
</script>
