<template>
    <el-form label-width="120px" v-model="fact">
      <el-form-item prop="date" label="Дата">
        <el-input placeholder="10.05.1928" v-model="fact.firstname" class="text-input" prop="firstName"></el-input>
      </el-form-item>
      <el-form-item prop="tags" label="Деятельность">
        <el-input placeholder="переписка (БП_отправитель)" v-model="fact.firstname"></el-input>
      </el-form-item>

      <el-form-item label="Источники">
        <el-input placeholder="■" v-model="fact.firstname"></el-input>
      </el-form-item>

    <el-form-item label="Описание">
      <el-input
        type="textarea"
        autosize
        placeholder="Пастернак пишет письмо Маяковскому"
        v-model="fact.firstname">
      </el-input>
    </el-form-item>

    <el-form-item label="Место">
      <el-input placeholder="Пекин" v-model="fact.firstname"></el-input>
    </el-form-item>

    <el-form-item label="Примечание">
      <el-input
        type="textarea"
        autosize
        placeholder="Был солнечный день"
        v-model="fact.firstname">
      </el-input>
    </el-form-item>

    <el-form-item label="Связи">
        <el-space  direction="horizontal" style="display:flex;" wrap size="large">
      <el-select
          v-model="fact.participants"
          filterable
          multiple
          placeholder="Участники"
          >
          <el-option
            v-for="item in persons"
            :key="item.id"
            :label="item.value"
            :value="item.id">
          </el-option>
        </el-select>

        <el-select v-model="fact.mentions" filterable multiple placeholder="Упомянуты">
            <el-option
              v-for="item in persons"
              :key="item.id"
              :label="item.value"
              :value="item.id">
            </el-option>
          </el-select>

        <el-select v-model="fact.works" multiple filterable placeholder="Произведения">
            <el-option
              v-for="item in works"
              :key="item.id"
              :label="item.title"
              :value="item.id">
            </el-option>
          </el-select>

        <el-select v-model="fact.books" multiple filterable placeholder="Издания">
            <el-option
              v-for="item in books"
              :key="item.id"
              :label="item.title"
              :value="item.id">
            </el-option>
          </el-select>
      </el-space>
    </el-form-item>

    <!-- :on-preview="handlePreview"
    :on-remove="handleRemove"
    :file-list="fileList" -->

    <el-form-item prop="file" label="Медиафайл">
      <el-upload
        class="upload-demo"
        drag
        action="https://jsonplaceholder.typicode.com/posts/"
        multiple
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Перетащите файл сюда или <em>нажмите, чтобы загрузить</em></div>
        <template #tip>
          <div class="el-upload__tip">
            Размер файла не больше 500кб
          </div>
        </template>
      </el-upload>
    </el-form-item>

    <!-- <el-form-item>
      <el-select v-model="user.privs" placeholder="Select" value-key>
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value">
        </el-option>
      </el-select>
    </el-form-item> -->

     <el-button type="primary" @click="onSubmit">Сохранить</el-button>
    </el-form>
</template>
<script>
import { ref } from 'vue';
import { onBeforeMount } from 'vue';
import store from "../store";
import { useRoute } from 'vue-router';

export default {
  name: "User",
  props: {
    // datum: Object,
  },
  setup() {

    let fact = ref({works: [], participants: [], mentions: [], books: []});
    const vuerouter = useRoute();
    const id = vuerouter.params.id;
    const persons = ref([]);
    const works = ref([]);
    const books = ref([]);

    onBeforeMount(async() => {
      const result = await store.getData("facts", id);
      if("data" in result) {
        console.log("ok");
      }
      const personsData = await store.getData("persons");
      persons.value = personsData.data.map (x => ({...x, value: x.firstname + ' ' + x.lastname}) );
      console.log(persons);

      const resultWorks = await store.getData("works");
      if("data" in resultWorks) {
        works.value = resultWorks.data;
      }

      const resultBooks = await store.getData("books");
      if("data" in resultBooks) {
        books.value = resultBooks.data;
      }

    });

    const onSubmit = async() => {
      // form.validate();
        console.log('save:', fact.value);
        const result = await store.postData("facts", fact.value);
        console.log(result);
    };

    return {onSubmit, fact, options: store.state.options, persons, works, books, };
  },
  components: {

  }
};
</script>
