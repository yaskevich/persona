<template>
  <MainTitle title="Факты" :callback="confirm"></MainTitle>

  <el-row v-for="(value, key) in facts"  :gutter="20" :key="key">

    <el-col :span="4"><div class="grid-content bg-purple-light">
      {{value.datedesc}}
    </div></el-col>

    <el-col :span="16"><div class="grid-content bg-purple">
      {{value.title}}
      <span v-for="(id, index) in value.editors" :key="index" style="font-style:italic;font-size: .7rem;">
        <span v-if="index">,</span>
        {{persons.filter(x=>x.id === id).map(x=>x.value).shift() }}
      </span>
    </div></el-col>

    <el-col :span="4"><div class="grid-content bg-purple">
      <router-link :to="'/fact/' + value.id">
      <el-button type="text" size="mini" icon="el-icon-edit" plain class="full-width"></el-button>
    </router-link>
    </div></el-col>

  </el-row>

</template>

<script lang="ts">
import { defineComponent, ref, reactive, onBeforeMount, ComponentPublicInstance, h } from 'vue';
import { ElForm } from 'element-plus';
import router from "../router";
import store from "../store";
import MainTitle from './MainTitle.vue';

export default defineComponent({
  setup() {
    const formRef = ref<ComponentPublicInstance<typeof ElForm>>();

    const facts = reactive([]);

    onBeforeMount(async() => {
      const result = await store.getData("facts");
      console.log(result);
      if("data" in result && !("error" in result.data)) {
        if(Object.keys(result.data).length) {
          facts.push(...result.data);
        } else {
          console.log("table is empty");
        }
      }
    });

    const confirm = () => {
      router.push("/fact")
    };

    return {
      confirm,
      formRef,
      facts,
    };
  },
  components: {
    MainTitle,
  }
});
</script>
