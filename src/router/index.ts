import { isShowRankingToAll } from './../services/settings';
import { ROLES } from './../services/users';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/services/users";
import HomePageVue from '../views/HomePage.vue';
import Nprogress from 'nprogress';

const ADMIN_PAGES = [
  "settings",
  "users",
  "promotions",
]

/**
 * 
 * @param to 
 * @param from 
 */
 const authCheck = (to: any, from: any) => {
  const user = useAuthStore();
  if (ADMIN_PAGES.includes(to.name)){
    if(user.profile.role >= ROLES.Administrateur) return true;
    else {
      console.log("redirected");
      return { name: 'home' };
    }
  }
  if (to.name === "ranking"){
    if(user.profile.role >= ROLES.Modérateur) return true;
    if(isShowRankingToAll()) return true;
    else {
      console.log("redirected");
      return { name: 'home' };
    }
  }
  if (user.isLoggedIn) {
    if (to.name === "login") {
      console.log("redirected");
      return { name: 'home' }
    } else {
      return true;
    }
  } else {
    if (to.name === "login") {
      return true;
    } else {
      console.log("redirected");
      return { name: "redirectLogin" };
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
    name: 'teams',
    path: '/team/:teamId',
    component: () => import ('../views/TeamPage.vue'),
    beforeEnter: authCheck,
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
    name: 'matches',
    path: '/matches',
    component: () => import ('../views/MatchesPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'section',
    path: '/sections/:sectionId',
    component: () => import ('../views/SectionsPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: () => import ('../views/RankingPage.vue'),
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
    name: 'redirectLogin',
    path: '/redirectLogin',
    component: () => import ('../views/LoginPage.vue'),
    props: { redirect: true }
  },
  {
    name: 'validation',
    path: '/validation',
    component: () => import ('../views/LoginPage.vue'),
    props: { validation: true }
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import ('../views/SettingsPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'users',
    path: '/users',
    component: () => import ('../views/UsersPage.vue'),
    beforeEnter: authCheck,
  },
  {
    name: 'promotions',
    path: '/promotions',
    component: () => import ('../views/UsersPage.vue'),
    beforeEnter: authCheck,
    props: { promotions: true }
  },
  {
    name: 'about',
    path: '/about',
    component: () => import ('../views/AboutPage.vue'),
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

router.beforeEach((to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    // Start the route progress bar.
    Nprogress.start()
  }
  next()
})

router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  Nprogress.done()
})

export default router
