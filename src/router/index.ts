import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/store";

/**
 * 
 * @param to 
 * @param from 
 */
 const authCheck = (to: any, from: any) => {
  const store = useAuthStore();
  console.log("authCheck", store.isLoggedIn);
  if (store.isLoggedIn) {
    if (to.name === "login") {
      return { name: 'home' }
    } else {
      return true;
    }
  } else {
    if (to.name === "login") {
      return true;
    } else {
      return { name: "login" };
    }
  }
};

const routes: Array<RouteRecordRaw> = [
  {
    name: 'home',
    path: '',
    redirect: '/folder/Inbox'
  },
  {
    name: 'player',
    path: '/player',
    component: () => import ('../views/PlayerPage.vue')
  },
  {
    name: 'login',
    path: '/login',
    component: () => import ('../views/LoginPage.vue')
  },
  {
    name: 'leader',
    path: '/leader',
    component: () => import ('../views/LeaderPage.vue'),
    beforeEnter: authCheck,
  },
  {
    path: '/folder/:id',
    component: () => import ('../views/FolderPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
