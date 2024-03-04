<template>
    <MainTitle :title="store.loc('genre') + ' ' + $route.params.id" :callback="confirm"
        :text="store.loc(form.id ? 'save' : 'add')">
    </MainTitle>

    <el-form :model="form" ref="formRef" label-width="100px" :rules="rules" v-show="isLoaded">
        <el-form-item prop="title" :label="store.loc('title')">
            <el-input :placeholder="store.loc('title')" v-model="form.title" class="text-input"></el-input>
        </el-form-item>

        <el-form-item :label="store.loc('works')" v-if="relWorks?.length">
            <el-space wrap>
                <el-button size="small" type="warning" v-for="(value, key) in relWorks" :key="key"
                    @click="$router.push('/work/' + value.id)">{{ value.title }}</el-button>
            </el-space>
        </el-form-item>

        <el-form-item v-else>
            <el-popconfirm v-if="form?.id" :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
                :cancelButtonText="store.loc('no')" @confirm="deleteGenre">
                <template #reference>
                    <el-button type="danger">{{ store.loc('remove') }}</el-button>
                </template>
            </el-popconfirm>
        </el-form-item>

    </el-form>

</template>

<script setup lang="ts">

import { ref, onBeforeMount } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElForm } from 'element-plus';
import store from '../store';
import router from '../router';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';

const formRef = ref<FormInstance>();
const form = ref({ title: '', published: '', editors: [], works: [], id: null });
const relWorks = ref([] as Array<IWork>);
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const isLoaded = ref(false);

onBeforeMount(async () => {

    if (id) {
        const result = await store.getData('genres', id);
        if ('data' in result) {
            form.value = result.data[0];
        }
        const worksData = await store.getData('works', { 'genre': id });
        relWorks.value = worksData.data;
    }

    isLoaded.value = true;
});

const deleteGenre = async () => {
    if (form?.value?.id) {
        const result = await store.deleteById('genres', form.value.id);
        if ('data' in result && 'id' in result.data) {
            router.push('/genres');
        }
    }
};

const confirm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            // console.log('form', form);
            const result = await store.postData('genres', form.value);
            // console.log(result);
            if ('data' in result && 'id' in result.data) {
                router.push('/genres');
            } else {
                console.log('error!');
            }
        } else {
            return false;
        }
    });
};

const rules = <FormRules<IRuleFormBook>>{
    title: [
        { required: true, message: store.loc('fieldnonempty'), trigger: 'blur' },
        { min: 2, message: store.loc('twoandmore'), trigger: 'blur' },
    ],
};

</script>
