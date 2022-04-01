import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/services";

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
    redirect: '/sections'
  },
  {
    name: 'myTeam',
    path: '/team',
    component: () => import ('../views/TeamPage.vue')
  },
  {
    name: 'team',
    path: '/teams/:id',
    component: () => import ('../views/TeamPage.vue')
  },
  {
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue')
  },
  {
    name: 'profile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue')
  },
  {
    name: 'userProfile',
    path: '/profile/:id',
    component: () => import ('../views/ProfilePage.vue')
  },
  {
    name: 'validation',
    path: '/validation',
    component: () => import ('../views/ProfilePage.vue'),
    props: { validation: true }
  },
  {
    name: 'leader',
    path: '/leader',
    component: () => import ('../views/LeaderPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'about',
    path: '/about',
    component: () => import ('../views/AboutPage.vue'),
  },
  {
    path: '/folder/:id',
    component: () => import ('../views/FolderPage.vue')
  },
  { 
    path: "/:catchAll(.*)",
    component: () => import ('../views/NotFoundPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
