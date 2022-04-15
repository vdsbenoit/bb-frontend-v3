import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/services/users";
import HomePageVue from '../views/HomePage.vue';

/**
 * 
 * @param to 
 * @param from 
 */
 const authCheck = (to: any, from: any) => {
  const user = useAuthStore();
  console.log("authCheck", user.isLoggedIn);
  if (user.isLoggedIn) {
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
    path: '/',
    alias: '/home',
    component: HomePageVue
  },
  {
    name: 'index',
    path: '/guest',
    redirect: '/home'
  },
  {
    name: 'game',
    path: '/game/:gameId',
    component: () => import ('../views/GamePage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'games',
    path: '/games',
    component: () => import ('../views/GamesPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'match',
    path: '/match/:matchId',
    component: () => import ('../views/MatchPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'myProfile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'profile',
    path: '/profile/:userId',
    component: () => import ('../views/ProfilePage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'login',
    path: '/login',
    component: () => import ('../views/LoginPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'validation',
    path: '/validation',
    component: () => import ('../views/LoginPage.vue'),
    props: { validation: true }
  },
  {
    name: 'about',
    path: '/about',
    component: () => import ('../views/AboutPage.vue'),
  },
  {
    name: 'sandbox', //fixme
    path: '/sandbox',
    component: () => import ('../views/SandBox.vue'),
    beforeEnter: authCheck,
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
