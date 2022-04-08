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
    redirect: '/sandbox'
  },
  {
    name: 'myTeam',
    path: '/team',
    component: () => import ('../views/TeamPage.vue')
  },
  {
    name: 'teams',
    path: '/team/:id',
    component: () => import ('../views/TeamPage.vue')
  },
  {
    name: 'myGame',
    path: '/game',
    component: () => import ('../views/GamePage.vue')
  },
  {
    name: 'game',
    path: '/game/:id',
    component: () => import ('../views/GamePage.vue')
  },
  {
    name: 'match',
    path: '/match/:id',
    component: () => import ('../views/MatchPage.vue')
  },
  {
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue')
  },
  {
    name: 'myProfile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue')
  },
  {
    name: 'profiles',
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
    name: 'sandbox',
    path: '/sandbox',
    component: () => import ('../views/SandBox.vue'),
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
