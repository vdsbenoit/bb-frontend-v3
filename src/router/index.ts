import { toastPopup } from './../services/popup';
import { isShowRankingToAll } from './../services/settings';
import { ROLES } from './../services/users';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useAuthStore } from "@/services/users";
import HomePageVue from '../views/HomePage.vue';
import GuestHomePageVue from '../views/GuestHomePage.vue';
import Nprogress from 'nprogress';
import OnboardingPage from '@/views/OnboardingPage.vue';

const routes: Array<RouteRecordRaw> = [
  { 
    path: '', 
    redirect: '/guest'
  },
  {
    name: 'guest',
    path: '/guest',
    component: GuestHomePageVue
  },
  {
    name: 'login',
    path: '/login',
    component: () => import ('../views/LoginPage.vue'),
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
    name: 'home',
    path: '/home',
    component: HomePageVue,
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'onboarding',
    path: '/onboarding',
    component: OnboardingPage,
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'teams',
    path: '/team/:teamId?',
    component: () => import ('../views/TeamPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'game',
    path: '/game/:gameId',
    component: () => import ('../views/GamePage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'games',
    path: '/games',
    component: () => import ('../views/GamesPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'match',
    path: '/match/:matchId',
    component: () => import ('../views/MatchPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'matches',
    path: '/matches',
    component: () => import ('../views/MatchesPage.vue'),
    meta: { minimumRole: ROLES.Organisateur }
  },
  {
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'section',
    path: '/sections/:sectionId',
    component: () => import ('../views/SectionsPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'leaders',
    path: '/leaders',
    component: () => import ('../views/LeadersPage.vue'),
    meta: { minimumRole: ROLES.Animateur }
  },
  {
    name: 'leader',
    path: '/leader/:sectionId',
    component: () => import ('../views/LeadersPage.vue'),
    meta: { minimumRole: ROLES.Animateur }
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: () => import ('../views/RankingPage.vue'),
    meta: { minimumRole: ROLES.Administrateur }
  },
  {
    name: 'myProfile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'profile',
    path: '/profile/:userId',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Organisateur }
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import ('../views/SettingsPage.vue'),
    meta: { minimumRole: ROLES.Administrateur }
  },
  {
    name: 'users',
    path: '/users/:userFilter?',
    props: true,
    component: () => import ('../views/UsersPage.vue'),
    meta: { minimumRole: ROLES.Administrateur }
  },
  {
    name: 'requests',
    path: '/requests',
    props: true,
    component: () => import ('../views/RequestsPage.vue'),
    meta: { minimumRole: ROLES.Chef }
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

router.beforeEach(async (to, from, next) => {
  // If this isn't an initial page load.
  if (to.name) {
    // Start the route progress bar.
    Nprogress.start()
  }
  const user = useAuthStore();
  if (user.isLoggedIn) {
    if (to.name === "guest") return next('/home');
    if (to.name === "login"){
      toastPopup("Tu es déjà connecté");
      return next('/home');
    }
    if (user.profile.role === -1) await user.forceFetchCurrentUserProfile();
    if (to.name === "onboarding"){
      if (user.profile.hasDoneOnboarding) {
        toastPopup("Tu as déjà fait l'onboarding");
        return next('/home');
      }
    }
    if (!user.profile.hasDoneOnboarding && to.name !== "onboarding") {
      console.log("User is newbie, redirecting to onboarding");
      return next('/onboarding');
    }
    if (to.meta.minimumRole){
      if (user.profile.role >= to.meta.minimumRole) return next();
      else {
        toastPopup(`Tu n'as pas le droit d'accéder à cette page avec ton role (${user.profile.role})`);
        return next('/home');
      }
    } else return next();
  }
  else {
    if (!to.meta.minimumRole) return next();
    if(to.meta.minimumRole === ROLES.Anonyme) return next();
    if (to.name === "ranking" && isShowRankingToAll()) return next();
    toastPopup("Tu dois être connecté pour accéder à cette page");
    return next('/guest');
  }
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  Nprogress.done()
})

export default router
