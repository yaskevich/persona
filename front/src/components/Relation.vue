<template>
    <MainTitle :title="store.loc('relation') + ' ' + (id || rel.id || '')" :callback="confirm"
        :text="rel.id ? store.loc('save') : store.loc('add')">
    </MainTitle>

    <el-form :model="rel" ref="formRef" label-width="6rem" :rules="rules" v-if="isLoaded">

        <el-form-item prop="name1" :label="store.loc('role') + '&nbsp;1'">
            <el-input :placeholder="store.loc('title')" v-model="rel.name1" class="text-input"></el-input>
        </el-form-item>

        <el-form-item prop="name2" :label="store.loc('role') + '&nbsp;2'">
            <el-input :placeholder="store.loc('title')" v-model="rel.name2" class="text-input"></el-input>
        </el-form-item>

        <el-form-item prop="bilateral" :label="store.loc('direction')">
            <el-switch v-model="rel.bilateral" active-text="⟺" inactive-text="⟹" />
        </el-form-item>

        <el-form-item prop="color" :label="store.loc('color')">
            <el-color-picker v-model="rel.color" :predefine="predefineColors" />
        </el-form-item>

        <el-form-item v-if="rel?.id">
            <el-tag v-if="itemsCount" m size="large" effect="plain" type="danger">
                {{ itemsCount }}
            </el-tag>
            <el-popconfirm v-else :title="store.loc('confirmdel')" :confirmButtonText="store.loc('yes')"
                :cancelButtonText="store.loc('no')" @confirm="deleteRel">
                <template #reference>
                    <el-button type="danger">{{ store.loc('remove') }}</el-button>
                </template>
            </el-popconfirm>
        </el-form-item>

    </el-form>



</template>

<script setup lang="ts">

import { ref, reactive, onBeforeMount, ComponentPublicInstance } from 'vue';
import { ElForm } from 'element-plus';
import store from '../store';
import { useRoute } from 'vue-router';
import MainTitle from './MainTitle.vue';
import router from '../router';

const formRef = ref<ComponentPublicInstance<typeof ElForm>>();
const vuerouter = useRoute();
const id = String(vuerouter.params.id);
const rel = ref<IRelation>({ name1: '', name2: '', bilateral: false, color: '#B8B8B8' });
const isLoaded = ref(false);
const itemsCount = ref(0);

const rules = {
    name1: [
        {
            required: true,
            message: store.loc('fieldnonempty'),
            trigger: 'blur',
        },
        { min: 2, message: store.loc('fieldnonempty'), trigger: 'blur' },
    ],
    name2: [
        {
            required: true,
            message: store.loc('fieldnonempty'),
            trigger: 'blur',
        },
        { min: 2, message: store.loc('fieldnonempty'), trigger: 'blur' },
    ],
};

const predefineColors = ref([
    '#ff4500',
    '#ff8c00',
    '#ffd700',
    '#90ee90',
    '#00ced1',
    '#1e90ff',
    '#c71585',
]);

const deleteRel = async () => {
    const result = await store.deleteById('reltypes', String(rel.value.id));
    if (result?.data?.id) {
        router.push('/relations');
    }
};

onBeforeMount(async () => {
    if (id) {
        const result = await store.getData('reltypes', id);
        rel.value = result.data.shift();
        const result2 = await store.getData('relation', id);
        itemsCount.value = result2.data;
    }
    isLoaded.value = true;
});

const confirm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            const result = await store.postData('reltypes', rel.value);
            console.log(result);
            if (result?.data?.id) {
                rel.value['id'] = result.data.id;
            } else {
                console.log('error!');
            }
        } else {
            return false;
        }
    });
};

</script>
