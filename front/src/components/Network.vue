<template>
    <div ref="container">
    </div>
</template>

<script setup lang="ts">

import { onMounted, onBeforeUnmount, ref, reactive } from 'vue';

import {
    defineGraph,
    defineGraphConfig,
    defineLink,
    defineNodeWithDefaults,
    Graph,
    GraphController,
} from 'd3-graph-controller';
import { GraphNode } from 'd3-graph-controller';
import 'd3-graph-controller/default.css';
import store from "../store";

const controller = ref();
const container = ref<HTMLInputElement>();
const data = reactive({ reltypes: {} as { [index: string]: IRelation }, persons: {} as { [index: string]: IPerson } });

onBeforeUnmount(() => {
    controller.value.shutdown()
});

onMounted(async () => {

    await store.getDataMulti(data, { reltypes: 'id', persons: 'id' }, {});

    const result = await store.getData("relships");
    // console.log(result.data);
    const nodes = [...new Set(result.data.map((x: IRelship) => [x.member1, x.member2]).flat())];
    const nodesObjects = {} as { [index: string]: GraphNode };
    for (let node of nodes) {
        const handle = String(node);
        const info = data.persons[handle];

        const thisNode = defineNodeWithDefaults({
            type: 'node',
            id: handle,
            label: {
                color: 'black',
                fontSize: '1rem',
                text: info.firstname.charAt(0) + info.lastname.charAt(0),
            },
        });
        nodesObjects[handle] = thisNode;
    }

    const links = [];

    for (let rel of result.data) {
        const link = defineLink({
            source: nodesObjects[rel.member1],
            target: nodesObjects[rel.member2],
            color: data.reltypes?.[rel?.rel_id]?.color || 'gray',
            label: false,
            // label: {
            //     color: 'black',
            //     fontSize: '1rem',
            //     text: rel.rel_id,
            // },
        })
        links.push(link);
    }

    const graph = defineGraph({
        nodes: [...Object.values(nodesObjects)],
        links,
    });

    if (container.value) {
        controller.value = new GraphController(container.value, graph, defineGraphConfig({
            autoResize: true, zoom: {
                initial: 1,
                max: 1,
                min: 1,
            },
            callbacks: {
                nodeClicked: (node: GraphNode) => console.log(node.id, data.persons[node.id]),
            },
        }));
    }
});

</script>
