<template>
  <ion-button @click="presentActionSheet">
    <ion-spinner v-if="isProcessing"></ion-spinner>
    <div v-else>
      <slot />
    </div>
  </ion-button>
</template>

<script setup lang="ts">
import { actionSheetController } from "@ionic/vue"
import { defineProps, ref } from "vue"

const props = defineProps<{
  actionSheetHeader?: string
  actionSheetSubHeader?: string
  destructiveButtons?: string[]
  buttonTexts: string[]
  actionSheetCallback: (res: any) => Promise<void>
}>()

const isProcessing = ref(false)

const presentActionSheet = async () => {
  const buttons = [
    { text: "Annuler", role: "cancel", data: { buttonText: "Annuler" } },
    ...(props.destructiveButtons || []).map(buttonText => ({
      text: buttonText,
      role: "destructive",
      data: { buttonText }
    })),
    ...(props.buttonTexts || []).map(buttonText => ({
      text: buttonText,
      data: { buttonText }
    }))
  ]

  const actionSheet = await actionSheetController.create({
    header: props.actionSheetHeader,
    subHeader: props.actionSheetSubHeader,
    buttons: buttons
  })

  await actionSheet.present()

  const res = await actionSheet.onDidDismiss()
  if (res.role && res.role != "cancel") {
    isProcessing.value = true
    props
      .actionSheetCallback(res)
      .then(() => {
        isProcessing.value = false
      })
      .catch(e => {
        console.error("Cannot process action sheet callback function", e)
      })
  }
}
</script>

<style></style>
