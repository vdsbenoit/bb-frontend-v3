import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/services/users";

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
    name: 'index',
    path: '',
    redirect: '/home'
  },
  {
    name: 'index',
    path: '/guest',
    redirect: '/home'
  },
  {
    name: 'home',
    path: '/home',
    component: () => import ('../views/HomePage.vue'),
  },
  {
    name: 'myTeam',
    path: '/team',
    component: () => import ('../views/TeamPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'teams',
    path: '/team/:teamId',
    component: () => import ('../views/TeamPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'myGame',
    path: '/game',
    component: () => import ('../views/GamePage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'game',
    path: '/game/:gameId',
    component: () => import ('../views/GamePage.vue'),
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
