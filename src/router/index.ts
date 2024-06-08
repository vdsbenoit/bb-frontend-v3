import { ROLES } from '@/constants';
import { isRankingPublic } from '@/utils/settings';
import { getRoleByValue, getUserProfile } from '@/utils/userProfile';
import OnboardingPage from '@/views/OnboardingPage.vue';
import { createRouter, createWebHistory } from '@ionic/vue-router';
import Nprogress from 'nprogress';
import { RouteRecordRaw } from 'vue-router';
import { getCurrentUser } from 'vuefire';
import GuestHomePageVue from '../views/GuestHomePage.vue';
import HomePageVue from '../views/HomePage.vue';
import { toastPopup } from './../services/popup';

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
    name: 'myProfile',
    path: '/profile',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Newbie }
  },
  {
    name: 'profile',
    path: '/profile/:userId',
    component: () => import ('../views/ProfilePage.vue'),
    meta: { minimumRole: ROLES.Participant }
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
    name: 'sections',
    path: '/sections',
    component: () => import ('../views/SectionsPage.vue'),
    meta: { minimumRole: ROLES.Participant }
  },
  {
    name: 'section',
    path: '/section/:sectionId',
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
    name: 'requests',
    path: '/requests',
    props: true,
    component: () => import ('../views/RequestsPage.vue'),
    meta: { minimumRole: ROLES.Chef }
  },
  {
    name: 'matches',
    path: '/matches',
    component: () => import ('../views/MatchesPage.vue'),
    meta: { minimumRole: ROLES.Organisateur }
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: () => import ('../views/RankingPage.vue'),
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
  // If this isn't an initial page load, start the route progress bar.
  if (to.name) Nprogress.start()
  if (!to.meta.minimumRole) return true
  if (to.meta.minimumRole === ROLES.Anonyme) return true
  const currentUser = await getCurrentUser()
  if(!currentUser) {
    if (to.name === "ranking" && await isRankingPublic()) return true
    toastPopup("Tu dois être connecté pour accéder à cette page");
    return {
      path: '/guest',
      query: {
        // we keep the current path in the query so we can
        // redirect to it after login with `router.push(route.query.redirect || '/')`
        redirect: to.fullPath
      },
    }
  }
  if (to.name === "guest") return '/home'
  if (to.name === "login"){
    toastPopup("Tu es déjà connecté");
    return '/home'
  }
  if (to.name === "ranking" && await isRankingPublic()) return true
  const userProfile = await getUserProfile(currentUser.uid)
  if (!userProfile) {
    toastPopup("Nous n'avons pas retrouvé ton profile dans la base de données")
    console.error("Could not find user profile in the db")
    return false
  }
  if (to.name === "onboarding"){
    if (userProfile.hasDoneOnboarding) {
      toastPopup("Tu as déjà fait l'onboarding");
      return next('/home');
    }
  }
  if (!userProfile.hasDoneOnboarding && to.name !== "onboarding" && to.name !== "myProfile") {
    console.log("User is newbie, redirecting to onboarding instead of ", to.name);
    return '/onboarding'
  }
  if (userProfile.role >= +to.meta.minimumRole) return true
  else {
    toastPopup(`Tu n'as pas le droit d'accéder à la page ${to.name?.toString()} avec ton role (${getRoleByValue(userProfile.role)})`);
    return false
  }  
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
router.afterEach((to, from) => {
  // Complete the animation of the route progress bar.
  Nprogress.done()
})

export default router
