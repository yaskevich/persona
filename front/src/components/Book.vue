<template>

  <MainTitle :title="'Издание ' + $route.params.id " :callback="confirm" :text="form.id? 'Сохранить': 'Добавить'"></MainTitle>

  <el-form :model="form" ref="formRef" label-width="100px" :rules="rules">
    <el-form-item prop="title" label="Название">
      <el-input placeholder="Название" v-model="form.title" class="text-input"></el-input>
    </el-form-item>

    <el-form-item prop="published" label="Год">
      <el-input placeholder="Год" v-model.number="form.published" class="text-input"></el-input>
    </el-form-item>

    <el-form-item label="Произведения">
      <el-select v-model="form.works" multiple filterable remote reserve-keyword
                 placeholder="Произведение"
                 :remote-method="getWorks"
                 :loading="loading">
        <el-option v-for="item in worksAll"
                   :key="item.id"
                   :label="item.title"
                   :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item label="Редакторы">
      <el-select v-model="form.editors" multiple filterable remote reserve-keyword
                 placeholder="Персона"
                 :remote-method="getEditors"
                 :loading="loading">
        <el-option v-for="item in editorsAll"
                   :key="item.id"
                   :label="item.value"
                   :value="item.id">
        </el-option>
      </el-select>
    </el-form-item>

    <el-form-item>
      <el-popconfirm v-if="form?.id"
                     title="Точно удалить?"
                     confirmButtonText="Да!"
                     cancelButtonText="Нет"
                     @confirm="deleteBook">
        <template #reference>
          <el-button type="danger">Удалить</el-button>
          </template>
      </el-popconfirm>
    </el-form-item>

    <!-- <el-button type="primary" @click="resetForm">Очистить</el-button>
      <el-button type="primary" @click="confirm">{{form.id? "Сохранить": "Добавить"}}</el-button> -->

  </el-form>

</template>

<script lang="ts">

  // import { ElForm } from 'element-plus';
  import { defineComponent, ref, onBeforeMount, ComponentPublicInstance } from 'vue';
  import { ElForm } from 'element-plus';
  import store from '../store';
  import router from '../router';
  import { useRoute } from 'vue-router';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      // const form  = reactive({ title: '', published: '', works: [], editors: [], selectedAuthors: []});
      const form = ref({ title: '', published: '', editors: [], works: [] });
      const worksAll = ref([]);
      let persons = [];
      const loading = ref(false);
      const editorsAll = ref([]);
      // const authors = ref([]);
      const vuerouter = useRoute();
      const id = vuerouter.params.id;

      onBeforeMount(async () => {
        console.log('router id', id);

        if (id) {
          const result = await store.getData('books', id);
          if ('data' in result) {
            form.value = result.data[0];
            // console.log("this book", form);
          }
        }

        const personsData = await store.getData('persons');
        persons = personsData.data.map(x => ({ ...x, value: x.firstname + ' ' + x.lastname }));
        editorsAll.value = persons;
        // authors.value  = persons;

        const worksData = await store.getData('works');
        worksAll.value = worksData.data;
      });

      const getWorks = async query => {
        console.log(query);
        const re = new RegExp(query, 'i');
        loading.value = true;

        const worksData = await store.getData('works');
        worksAll.value = worksData.data.filter(x => re.test(x.title));
        loading.value = false;
      };

      const getEditors = query => {
        console.log(query);
        const re = new RegExp(query, 'i');
        loading.value = true;
        editorsAll.value = persons.filter(x => re.test(x.value));
        loading.value = false;
      };

      // const getAuthors = (query) => {
      //   console.log(query);
      //   const re  = new RegExp(query, "i");
      //   loading.value = true;
      //   authors.value = persons.filter(x => re.test(x.value));
      //   loading.value = false;
      // };

      const resetForm = () => {
        formRef.value?.resetFields();
      };

      const deleteBook = async () => {
        const result = await store.deleteById('books', form.value.id);
        if ('data' in result && 'id' in result.data) {
          router.push('/books');
        }
      };

      const confirm = () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            console.log('form', form);
            const result = await store.postData('books', form.value);
            // console.log(result);
            if ('data' in result && 'id' in result.data) {
              router.push('/books');
            } else {
              console.log('error!');
            }
          } else {
            return false;
          }
        });
      };

      const rules = {
        title: [
          { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
          { min: 2, message: 'Не менее 2-х символов', trigger: 'blur' },
        ],
        published: [
          { required: true, message: 'Поле должно быть заполнено', trigger: 'blur' },
          { min: 2, type: 'integer', trigger: 'blur' },
        ],
      };

      return {
        // getAuthors,
        // authors,
        editorsAll,
        getEditors,
        getWorks,
        loading,
        resetForm,
        confirm,
        formRef,
        rules,
        form,
        worksAll,
        deleteBook,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
