import { createRouter, createWebHistory } from 'vue-router'

// Layouts & Pages
import DashboardLayout from '../layouts/DashboardLayout.vue'
import LoginPage from '../pages/LoginPage.vue'
import DashboardPage from '../pages/DashboardPage.vue'
import PayBillsPage from '../pages/PayBillsPage.vue'
import MonthlyServiceChargesPage from '../pages/MonthlyServiceChargesPage.vue'
import FlatMemberManagementPage from '../pages/FlatMemberManagementPage.vue'
import ProfilePage from '../pages/ProfilePage.vue'
import NotFoundPage from '../pages/NotFoundPage.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: { guestOnly: true, title: 'Login - Unique Castle' }
  },
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard'
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard - Unique Castle' }
      },
      {
        path: 'pay-bills',
        name: 'PayBills',
        component: PayBillsPage,
        meta: { title: 'Pay Service Charges - Unique Castle' }
      },
      {
        path: 'flat-members',
        name: 'FlatMemberManagement',
        component: FlatMemberManagementPage,
        meta: { requiresAuth: true, adminOnly: true, title: 'Flat Member Management - Unique Castle' }
      },
      {
        path: 'monthly-service-charges',
        name: 'MonthlyServiceCharges',
        component: MonthlyServiceChargesPage,
        meta: { requiresAuth: true, adminOnly: true, title: 'Monthly Service Charges - Unique Castle' }
      },
      {
        path: 'profile',
        name: 'Profile',
        component: ProfilePage,
        meta: { title: 'My Profile - Unique Castle' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: { title: 'Page Not Found - Unique Castle' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {

  // Update page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  const token = localStorage.getItem('unique_castle_token')

  // Check auth requirement
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!token) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }
  }

  // Prevent logged in user from accessing login page
  if (to.matched.some(record => record.meta.guestOnly)) {
    if (token) {
      return next({ name: 'Dashboard' })
    }
  }

  // Check adminOnly permissions
  if (to.matched.some(record => record.meta.adminOnly)) {
    try {
      const stored = localStorage.getItem('unique_castle_user')
      const user = stored ? JSON.parse(stored) : null
      const role = String(user?.role || '').toUpperCase()
      if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
        return next({ name: 'Dashboard' })
      }
    } catch (e) {
      return next({ name: 'Dashboard' })
    }
  }

  next()
})

export default router
