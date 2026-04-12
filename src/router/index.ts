import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from '@ionic/vue-router'
import { getCurrentUser } from 'vuefire'
import { USER_ROLES } from '@/constants'
import { isRankingPublic } from '@/utils/app'
import { createUserProfile, getRoleByValue, getUserProfile } from '@/utils/userProfile'
import OnboardingPage from '@/views/OnboardingPage.vue'
import { toastPopup } from '../utils/popup'
import HomePageVue from '../views/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '',
    redirect: '/guest',
  },
  {
    name: 'guest',
    path: '/guest',
    component: () => import('../views/GuestHomePage.vue'),
    meta: { noAuth: true },
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('../views/LoginPage.vue'),
    meta: { noAuth: true },
  },
  {
    name: 'home',
    path: '/home',
    component: HomePageVue,
    meta: { minimumRole: USER_ROLES.Newbie },
  },
  {
    name: 'onboarding',
    path: '/onboarding',
    component: OnboardingPage,
    meta: { minimumRole: USER_ROLES.Newbie },
  },
  {
    name: 'myProfile',
    path: '/profile',
    component: () => import('../views/ProfilePage.vue'),
    meta: { minimumRole: USER_ROLES.Newbie },
  },
  {
    name: 'profile',
    path: '/profile/:userId',
    component: () => import('../views/ProfilePage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'team',
    path: '/team/:teamId',
    component: () => import('../views/PlayerTeamPage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'game',
    path: '/game/:gameId',
    component: () => import('../views/GamePage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'games',
    path: '/games',
    component: () => import('../views/GamesPage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'match',
    path: '/match/:matchId',
    component: () => import('../views/MatchPage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'player-group',
    path: '/player-group/:groupId?',
    component: () => import('../views/PlayerGroupsPage.vue'),
    meta: { minimumRole: USER_ROLES.Participant },
  },
  {
    name: 'attendant-group',
    path: '/attendant-group/:groupId?',
    component: () => import('../views/AttendantGroupsPage.vue'),
    meta: { minimumRole: USER_ROLES.Animateur },
  },
  {
    name: 'applicants',
    path: '/applicants',
    props: true,
    component: () => import('../views/ApplicantsPage.vue'),
    meta: { minimumRole: USER_ROLES.Chef },
  },
  {
    name: 'checkScores',
    path: '/check-scores',
    component: () => import('../views/CheckScoresPage.vue'),
    meta: { minimumRole: USER_ROLES.Organisateur },
  },
  {
    name: 'ranking',
    path: '/ranking',
    component: () => import('../views/RankingPage.vue'),
    meta: { minimumRole: USER_ROLES.Administrateur },
  },
  {
    name: 'settings',
    path: '/settings',
    component: () => import('../views/SettingsPage.vue'),
    meta: { minimumRole: USER_ROLES.Administrateur },
  },
  {
    name: 'new-users',
    path: '/new-users',
    props: { order: 'new' },
    component: () => import('../views/LastUsersPage.vue'),
    meta: { minimumRole: USER_ROLES.Administrateur },
  },
  {
    name: 'login-users',
    path: '/login-users',
    props: { order: 'login' },
    component: () => import('../views/LastUsersPage.vue'),
    meta: { minimumRole: USER_ROLES.Administrateur },
  },
  {
    name: 'about',
    path: '/about',
    component: () => import('../views/AboutPage.vue'),
    meta: { noAuth: true },
  },
  {
    path: '/:catchAll(.*)',
    component: () => import('../views/NotFoundPage.vue'),
    meta: { minimumRole: USER_ROLES.Anonyme },
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.minimumRole && to.meta.minimumRole === USER_ROLES.Anonyme) return true
  let currentUser
  try {
    currentUser = await getCurrentUser()
  } catch (e) {
    console.error('Error while getting current user: ', e)
    currentUser = null
  }
  // if the user is not connected
  if (!currentUser) {
    // if the pages does not require authentication, let the user access it
    if (to.meta.noAuth) return true
    // else, redirect to login
    console.log('User is not connected, redirecting to login')
    toastPopup('Tu dois être connecté pour accéder à cette page')
    return {
      path: '/login',
      query: {
        // we keep the current path in the query so we can
        // redirect to it after login with `router.push(route.query.redirect || '/')`
        redirect: to.fullPath,
      },
    }
  }
  // if the user is connected and try to open the guest page, redirect to home
  if (to.name === 'guest') return '/home'
  // if the user is connected and try to open the login page, redirect to home
  if (to.name === 'login') {
    toastPopup('Tu es déjà connecté')
    return '/home'
  }
  if (to.name === 'ranking') {
    const _isRankingPublic = await isRankingPublic()
    if (_isRankingPublic) return true
  }
  let userProfile = await getUserProfile(currentUser.uid) // fixme : limit the number of calls to the db
  if (!userProfile) {
    console.warn(`Could not find user profile in db for uid ${currentUser.uid}, trying to initialize one`)
    try {
      await createUserProfile(currentUser.uid, currentUser.email ?? '')
      userProfile = await getUserProfile(currentUser.uid)
    } catch (error) {
      console.error('Failed to create missing user profile:', error)
    }
  }
  if (!userProfile) {
    toastPopup('Nous n\'avons pas pu initialiser ton profil. Reconnecte-toi pour reessayer.')
    return '/login'
  }
  if (to.name === 'onboarding') {
    if (userProfile.hasDoneOnboarding) {
      toastPopup('Tu as déjà fait l\'onboarding')
      return '/home'
    }
  }
  if (!userProfile.hasDoneOnboarding && to.name !== 'onboarding') {
    console.log('User is newbie, redirecting to onboarding instead of ', to.name)
    return '/onboarding'
  }
  if (!to.meta.minimumRole) return true
  if (userProfile.role >= +to.meta.minimumRole) return true
  toastPopup(
    `Tu n'as pas le droit d'accéder à la page ${to.name?.toString()} 
    avec ton role (${getRoleByValue(userProfile.role)})`,
  )
  console.error(
    `The user ${userProfile.email} with the role ${userProfile.role} 
    tried to access ${to.name?.toString()} 
    which requires the role ${getRoleByValue(+to.meta?.minimumRole)}`,
  )
  return false
})

export default router
