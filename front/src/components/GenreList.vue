<template>

  <MainTitle title="Жанры" :callback="showDialog"></MainTitle>

  <el-row v-for="(value, key) in genres" :gutter="20" :key="key">
    <el-col :span="12">
      <div class="grid-content bg-purple">
        {{value.title}}
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width" @click="showDialog(value.title, value.id)"></el-button>
      </div>
    </el-col>
    <el-col :span="6">
      <div class="grid-content bg-purple">
        <el-popconfirm title="Точно удалить?"
                       confirmButtonText="Да!"
                       cancelButtonText="Нет"
                       @confirm="deleteGenre(value.id, key)">
          <template #reference>
          <el-button type="text" size="mini" icon="el-icon-delete" plain class="full-width"></el-button>
          </template>
        </el-popconfirm>
      </div>
    </el-col>
  </el-row>

  <el-dialog title="Жанр"
             v-model="dialogVisible"
             width="30%">
    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" :inline="true">
      <el-form-item prop="title">
        <el-input placeholder="Название" v-model="form.title" class="text-input" ref="formInputRef"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">Отмена</el-button>
          <el-button type="primary" @click="confirmDialog">Сохранить</el-button>
        </span>
      </template>
  </el-dialog>

</template>

<script lang="ts">

  import { defineComponent, reactive, ref, onBeforeMount, ComponentPublicInstance, nextTick } from 'vue';
  import store from '../store';
  import MainTitle from './MainTitle.vue';

  export default defineComponent({
    setup() {
      const genres = reactive([]);
      const form = reactive({ title: '' });
      const dialogVisible = ref(false);
      const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
      const formInputRef = ref(null);

      onBeforeMount(async () => {
        const result = await store.getData('genres');
        if ('data' in result) {
          genres.push(...result.data.sort((a, b) => b.id - a.id));
        }
      });

      const showDialog = (text, id) => {
        dialogVisible.value = true;
        form.title = typeof text === 'string' ? text : '';
        form.id = id;
        nextTick(() => {
          formInputRef.value.focus();
        });
      };

      const deleteGenre = async(id, key) => {
        const result = await store.deleteById("genres", id);
        // console.log(result);
        if("data" in result && "id" in result.data) {
          console.log("deleted", id);
          genres.splice(key, 1);
        }
      };

      const confirmDialog = () => {
        formRef.value?.validate(async valid => {
          if (valid) {
            console.log('form', form);
            const result = await store.postData('genres', form);
            console.log(result);
            if (!('data' in result && 'id' in result.data)) {
              console.log('error!');
            } else {
              console.log('ok');
              if (form.id) {
                genres.filter(x => x.id === form.id)[0]['title'] = form.title;
                delete form.id;
              } else {
                genres.unshift({ ...form });
              }
              form.title = '';

              dialogVisible.value = false;
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
      };

      return {
        genres,
        confirm,
        form,
        rules,
        formRef,
        dialogVisible,
        showDialog,
        confirmDialog,
        formInputRef,
        deleteGenre,
      };
    },
    components: {
      MainTitle,
    },
  });

</script>
