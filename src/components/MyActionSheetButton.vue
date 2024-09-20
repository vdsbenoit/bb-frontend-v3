<template>
  <ion-button @click="presentActionSheet" :disabled="isProcessing">
    <ion-spinner v-if="isProcessing"></ion-spinner>
    <div v-else>
      <slot />
    </div>
  </ion-button>
</template>

<script setup lang="ts">
import { actionSheetController } from "@ionic/vue"
import { computed, defineProps, ref } from "vue"

const props = defineProps<{
  actionSheetHeader?: string
  actionSheetSubHeader?: string
  destructiveButtons?: { text: string, data: any }[]
  buttons: { text: string, data: any }[]
  callback: (res: any, payload: any) => Promise<void>
  payload: any
}>()

const isProcessing = ref(false)

const buttons = computed(() => [
  { text: "Annuler", role: "cancel", data: "Annuler" },
  ...(props.destructiveButtons || []).map(button => ({
    text: button.text,
    role: "destructive",
    data: button.data
  })),
  ...(props.buttons || []).map(button => ({
    text: button.text,
    data: button.data
  }))
])

const presentActionSheet = async () => {
  const actionSheet = await actionSheetController.create({
    header: props.actionSheetHeader,
    subHeader: props.actionSheetSubHeader,
    buttons: buttons.value
  })

  await actionSheet.present()

  const result = await actionSheet.onDidDismiss()
  if (result.role && result.role != "cancel") {
    isProcessing.value = true
    props
      .callback(result, props.payload)
      .then(() => {
        isProcessing.value = false
      })
      .catch(e => {
        console.error("Cannot process action sheet callback function", e)
      })
  } else console.debug(`ActionSheet ${props.actionSheetHeader} cancelled`)
}
</script>

<style></style>
